import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Radio, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface SocialConnectProps {
  platform: 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const SocialConnect: React.FC<SocialConnectProps> = ({
  platform,
  isConnected,
  onConnect,
  onDisconnect,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchAccountInfo();
    }
  }, [isConnected, platform]);

  const fetchAccountInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDebugInfo('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();

      if (error) {
        console.error('Error fetching account info:', error);
        setDebugInfo(`Failed to fetch account info: ${error.message}`);
        return;
      }
      
      if (!data) {
        setDebugInfo('No account data found');
        return;
      }
      
      setAccountInfo(data);
      setDebugInfo(null);
    } catch (err: any) {
      console.error('Error fetching account info:', err);
      setDebugInfo(`Unexpected error: ${err.message}`);
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'facebook':
        return <Facebook size={20} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={20} className="text-pink-600" />;
      case 'youtube':
        return <Youtube size={20} className="text-red-600" />;
      case 'tiktok':
        return <Radio size={20} className="text-gray-900" />;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'instagram':
        return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'youtube':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'tiktok':
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDebugInfo('No authenticated user found during connect');
        throw new Error('Not authenticated');
      }

      // Generate and store state parameter
      const state = `${platform}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(`${platform}_oauth_state`, state);

      // Use the current origin for the redirect URI
      const redirectUri = `${window.location.origin}/settings?platform=${platform}`;
      
      let authUrl = '';

      switch (platform) {
        case 'facebook':
          if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
            throw new Error('Facebook App ID not configured');
          }
          const fbScope = 'pages_manage_posts,pages_read_engagement';
          authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
            `client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(fbScope)}&` +
            `state=${state}`;
          break;

        case 'youtube':
          if (!import.meta.env.VITE_YOUTUBE_CLIENT_ID) {
            throw new Error('YouTube Client ID not configured');
          }
          // Updated YouTube scopes
          const ytScope = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
            'https://www.googleapis.com/auth/youtubepartner',
            'https://www.googleapis.com/auth/youtubepartner-channel-audit'
          ].join(' ');
          
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${import.meta.env.VITE_YOUTUBE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(ytScope)}&` +
            `response_type=code&` +
            `access_type=offline&` +
            `include_granted_scopes=true&` +
            `prompt=consent&` +
            `state=${state}`;
          break;

        default:
          throw new Error('Platform not supported yet');
      }

      // Log the redirect URI for debugging
      console.log(`Redirecting to: ${platform} OAuth`, {
        redirectUri,
        platform,
        state
      });

      window.location.href = authUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect account';
      setError(errorMessage);
      setDebugInfo(`Connection error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDebugInfo('No authenticated user found during disconnect');
        throw new Error('Not authenticated');
      }
      
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('platform', platform)
        .eq('user_id', user.id);

      if (error) {
        setDebugInfo(`Database error during disconnect: ${error.message}`);
        throw error;
      }

      setAccountInfo(null);
      onDisconnect();
      toast.success(`Disconnected ${platform} account`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to disconnect account';
      setError(errorMessage);
      setDebugInfo(`Disconnect error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = () => {
    if (!accountInfo?.pages?.length) return '';
    return accountInfo.pages[0]?.name || accountInfo.pages[0]?.username || '';
  };

  return (
    <div className={`p-4 border rounded-lg ${getPlatformColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            {getPlatformIcon()}
          </div>
          <div>
            <h3 className="font-medium capitalize">{platform}</h3>
            <p className="text-sm opacity-75">
              {isConnected ? `Connected as: ${getAccountName()}` : 'Not connected'}
            </p>
            {debugInfo && (
              <p className="text-xs text-gray-500 mt-1">Debug: {debugInfo}</p>
            )}
          </div>
        </div>

        <Button
          variant={isConnected ? 'outline' : 'primary'}
          size="sm"
          onClick={isConnected ? handleDisconnect : handleConnect}
          isLoading={loading}
          className={isConnected ? 'text-gray-700 hover:bg-gray-100' : ''}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>

      {error && (
        <div className="mt-3 flex items-start space-x-2 text-sm text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SocialConnect;