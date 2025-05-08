import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Users, 
  Lock, 
  Building, 
  LogOut, 
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Radio
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import SocialConnect from '../../components/settings/SocialConnect';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState([
    { platform: 'facebook', name: '', status: 'disconnected' },
    { platform: 'instagram', name: '', status: 'disconnected' },
    { platform: 'youtube', name: '', status: 'disconnected' },
    { platform: 'tiktok', name: '', status: 'disconnected' }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchConnectedAccounts();
    }
  }, [user?.id]);

  useEffect(() => {
    // Check for OAuth callback
    const params = new URLSearchParams(location.search);
    const platform = params.get('platform');
    const code = params.get('code');
    const state = params.get('state');
    
    if (platform && code && state && user?.id) {
      // Verify state matches what we stored
      const storedState = localStorage.getItem(`${platform}_oauth_state`);
      if (state !== storedState) {
        toast.error('Invalid OAuth state');
        return;
      }
      
      // Clear stored state
      localStorage.removeItem(`${platform}_oauth_state`);
      
      handleOAuthCallback(platform, code, user.id);
      // Clear the URL parameters
      navigate('/settings', { replace: true });
    }
  }, [location, user?.id]);

  const fetchConnectedAccounts = async () => {
    try {
      if (!user?.id) {
        console.warn('User ID is undefined, skipping fetch of connected accounts');
        return;
      }

      setIsLoading(true);
      const { data: accounts, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setConnectedAccounts(prev => 
        prev.map(account => {
          const connectedAccount = accounts?.find(a => a.platform === account.platform);
          return connectedAccount
            ? { ...account, status: 'connected', name: connectedAccount.pages?.[0]?.name || '' }
            : { ...account, status: 'disconnected', name: '' };
        })
      );
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      toast.error('Failed to fetch connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (platform: string, code: string, userId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Failed to get session');
      if (!session?.access_token) throw new Error('No access token available');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-auth/${platform}-auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect account');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to connect account');
      }

      // Refresh connected accounts
      await fetchConnectedAccounts();
      toast.success(`Successfully connected ${platform}`);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast.error(error.message || 'Failed to connect account');
    }
  };
  
  // Mock team members
  const teamMembers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', avatarUrl: '' },
    { id: '2', name: 'Sarah Kim', email: 'sarah@example.com', role: 'editor', avatarUrl: '' },
    { id: '3', name: 'Michael Thompson', email: 'michael@example.com', role: 'editor', avatarUrl: '' },
    { id: '4', name: 'Lisa Rodriguez', email: 'lisa@example.com', role: 'viewer', avatarUrl: '' },
  ];
  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleConnect = (platform: string) => {
    console.log(`Connecting to ${platform}`);
  };

  const handleDisconnect = async (platform: string) => {
    try {
      if (!user?.id) {
        console.warn('User ID is undefined, cannot disconnect account');
        return;
      }

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('platform', platform)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchConnectedAccounts();
      toast.success(`Disconnected ${platform} account`);
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect account');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-500">Please wait while we load your settings</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, team, and integrations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <nav className="divide-y divide-gray-100">
              <button
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} className="mr-3" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === 'team' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('team')}
              >
                <Users size={18} className="mr-3" />
                <span className="font-medium">Team Members</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === 'connections' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('connections')}
              >
                <ArrowRight size={18} className="mr-3" />
                <span className="font-medium">Connections</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === 'church' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('church')}
              >
                <Building size={18} className="mr-3" />
                <span className="font-medium">Church Info</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={18} className="mr-3" />
                <span className="font-medium">Security</span>
              </button>
              <button
                className="w-full text-left px-4 py-3 flex items-center text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut size={18} className="mr-3" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
                
                <div className="mb-8">
                  <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary-700" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-medium">{user.firstname} {user.lastname}</h3>
                      <p className="text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500 capitalize mt-1">Role: {user.role || 'viewer'}</p>
                    </div>
                  </div>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        className="input"
                        defaultValue={user.firstname}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        className="input"
                        defaultValue={user.lastname}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      defaultValue={user.email}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Your email is used for login and notifications</p>
                  </div>
                  
                  <div>
                    <Button variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Team Tab */}
            {activeTab === 'team' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold">Team Members</h2>
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<Users size={16} />}
                    className="mt-2 sm:mt-0"
                  >
                    Invite Team Member
                  </Button>
                </div>
                
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                                {member.avatarUrl ? (
                                  <img 
                                    src={member.avatarUrl} 
                                    alt={member.name} 
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <User size={20} className="text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.role === 'admin' 
                                ? 'bg-primary-100 text-primary-800' 
                                : member.role === 'editor'
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Connected Platforms</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading connected accounts...</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {connectedAccounts.map((account) => (
                      <SocialConnect
                        key={account.platform}
                        platform={account.platform as 'facebook' | 'instagram' | 'youtube' | 'tiktok'}
                        isConnected={account.status === 'connected'}
                        onConnect={() => handleConnect(account.platform)}
                        onDisconnect={() => handleDisconnect(account.platform)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="mt-6 text-sm text-gray-500">
                  Connecting your accounts allows KingdomCast to post content directly to your social media platforms.
                  <br />
                  We never post without your permission.
                </p>
              </div>
            )}
            
            {/* Church Info Tab */}
            {activeTab === 'church' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Church Information</h2>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                      Church name
                    </label>
                    <input
                      id="churchName"
                      type="text"
                      className="input"
                      defaultValue="First Baptist Church"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      className="input"
                      defaultValue="https://example.com"
                      placeholder="https://your-church-website.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Church logo
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building className="h-10 w-10 text-gray-400" />
                      </div>
                      <Button variant="outline" className="ml-5">
                        Change
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Button variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <form className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current password
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          className="input"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          className="input"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm new password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="primary">
                        Update Password
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-red-600 mb-3">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account and all of your content.
                      This action cannot be undone.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;