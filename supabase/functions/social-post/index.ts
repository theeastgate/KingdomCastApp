import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
      throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    const { message, mediaUrl, scheduledFor, accountId } = await req.json();
    const platform = new URL(req.url).pathname.split("/").pop();

    // Get social account details
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      throw new Error("Social account not found");
    }

    let result;

    switch (platform) {
      case "facebook":
        result = await postToFacebook(message, mediaUrl, account.access_token, account.pages[0].id);
        break;

      case "youtube":
        result = await postToYouTube(message, mediaUrl, account.access_token);
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in social-post function:", error);
    
    // Enhanced error handling for Facebook API errors
    let errorMessage = error.message;
    if (error.response) {
      try {
        const fbError = await error.response.json();
        errorMessage = fbError.error?.message || error.message;
      } catch (_) {
        // If parsing fails, use the original error message
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.response ? await error.response.text() : undefined
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function postToFacebook(message: string, mediaUrl: string | undefined, accessToken: string, pageId: string) {
  const endpoint = mediaUrl
    ? `https://graph.facebook.com/v19.0/${pageId}/photos`
    : `https://graph.facebook.com/v19.0/${pageId}/feed`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: new URLSearchParams({
      message,
      ...(mediaUrl && { url: mediaUrl }),
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Facebook API error:", error);
    throw new Error(error.error?.message || "Failed to post to Facebook");
  }

  return await response.json();
}

async function postToYouTube(title: string, videoUrl: string | undefined, accessToken: string) {
  if (!videoUrl) {
    throw new Error("Video URL is required for YouTube posts");
  }

  // First, initiate the upload
  const response = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        title,
        description: title,
        tags: [],
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to post to YouTube");
  }

  return await response.json();
}