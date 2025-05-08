import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
};

const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
const YOUTUBE_CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID");
const YOUTUBE_CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const platform = pathParts[pathParts.length - 1];
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { code } = await req.json();
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Authorization code not provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let accessToken, refreshToken, expiresAt, pages;
    const redirectUri = 'https://magical-otter-6d992a.netlify.app/settings';

    switch (platform) {
      case "facebook-auth":
        if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
          throw new Error("Missing Facebook credentials");
        }

        const fbTokenResponse = await fetch(
          `https://graph.facebook.com/v19.0/oauth/access_token?` +
          `client_id=${FACEBOOK_APP_ID}&` +
          `client_secret=${FACEBOOK_APP_SECRET}&` +
          `code=${code}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}`
        );

        const fbTokenData = await fbTokenResponse.json();
        if (!fbTokenResponse.ok) {
          throw new Error(fbTokenData.error?.message || "Failed to get Facebook access token");
        }

        accessToken = fbTokenData.access_token;

        const fbPagesResponse = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
        );

        const fbPagesData = await fbPagesResponse.json();
        if (!fbPagesResponse.ok) {
          throw new Error(fbPagesData.error?.message || "Failed to get Facebook pages");
        }

        pages = fbPagesData.data;
        break;

      case "youtube-auth":
        if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
          throw new Error("Missing YouTube credentials");
        }

        const ytTokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: YOUTUBE_CLIENT_ID,
              client_secret: YOUTUBE_CLIENT_SECRET,
              code: code,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
            }).toString(),
          }
        );

        const ytTokenData = await ytTokenResponse.json();
        if (!ytTokenResponse.ok) {
          throw new Error(ytTokenData.error_description || ytTokenData.error || "Failed to get YouTube access token");
        }

        accessToken = ytTokenData.access_token;
        refreshToken = ytTokenData.refresh_token;
        expiresAt = new Date(Date.now() + (ytTokenData.expires_in * 1000)).toISOString();

        const ytChannelResponse = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const ytChannelData = await ytChannelResponse.json();
        if (!ytChannelResponse.ok) {
          throw new Error(ytChannelData.error?.message || "Failed to get YouTube channel info");
        }

        if (!ytChannelData.items || ytChannelData.items.length === 0) {
          throw new Error("No YouTube channels found for this account");
        }

        pages = ytChannelData.items;
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported platform: ${platform}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
    }

    await saveSocialAccount(userId, platform.replace("-auth", ""), accessToken, refreshToken, pages, expiresAt);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: error.message.includes("Missing") ? 401 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function saveSocialAccount(
  userId: string,
  platform: string,
  accessToken: string,
  refreshToken: string | null = null,
  pages: any = null,
  expiresAt: string | null = null
) {
  const { error } = await supabase
    .from("social_accounts")
    .upsert({
      user_id: userId,
      platform,
      access_token: accessToken,
      refresh_token: refreshToken,
      pages,
      expires_at: expiresAt,
      connected_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}