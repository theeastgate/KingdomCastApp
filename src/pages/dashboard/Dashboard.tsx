import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Clock, Instagram, Facebook, Youtube, Radio } from 'lucide-react';
import Button from '../../components/common/Button';

const Dashboard: React.FC = () => {
  // Mock data for the dashboard
  const upcomingPosts = [
    {
      id: '1',
      title: 'Sunday Service Reminder',
      contentType: 'image',
      scheduledFor: '2025-03-27T09:00:00.000Z',
      platforms: ['facebook', 'instagram']
    },
    {
      id: '2',
      title: 'Youth Group Promo Video',
      contentType: 'video',
      scheduledFor: '2025-03-28T17:30:00.000Z',
      platforms: ['instagram', 'youtube']
    },
    {
      id: '3',
      title: 'Bible Verse of the Day',
      contentType: 'image',
      scheduledFor: '2025-03-29T12:00:00.000Z',
      platforms: ['facebook', 'instagram', 'tiktok']
    }
  ];
  
  const stats = [
    { name: 'Total Posts', value: '24', change: '+12%', changeType: 'positive' },
    { name: 'Platforms Connected', value: '4', change: 'New', changeType: 'positive' },
    { name: 'Upcoming Posts', value: '8', change: '', changeType: 'neutral' },
    { name: 'Active Campaigns', value: '2', change: '', changeType: 'neutral' },
  ];
  
  const quickActions = [
    { name: 'Upload Content', icon: <PlusCircle />, path: '/upload', bgColor: 'bg-primary-600' },
    { name: 'View Calendar', icon: <Calendar />, path: '/calendar', bgColor: 'bg-secondary-600' },
    { name: 'Schedule Post', icon: <Clock />, path: '/upload?schedule=true', bgColor: 'bg-accent-500' },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook size={16} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={16} className="text-pink-600" />;
      case 'youtube':
        return <Youtube size={16} className="text-red-600" />;
      case 'tiktok':
        return <Radio size={16} className="text-gray-900" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your social media content</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => {/* Handle action */}}
          >
            New Post
          </Button>
        </div>
      </div>
      
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <Link 
            key={index}
            to={action.path}
            className="card p-6 hover:translate-y-[-2px] transition-all flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-full mb-3 ${action.bgColor} text-white`}>
              {React.cloneElement(action.icon, { size: 24 })}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
          </Link>
        ))}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-5 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <p className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-success-600' : 
                  stat.changeType === 'negative' ? 'text-error-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Posts</h2>
            <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-700">
              View Calendar
            </Link>
          </div>
          <div className="card divide-y divide-gray-100">
            {upcomingPosts.map((post, index) => (
              <div 
                key={post.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      post.contentType === 'video' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></span>
                    <p className="text-xs text-gray-500 uppercase">
                      {post.contentType}
                    </p>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 truncate">{post.title}</h3>
                  <div className="flex items-center mt-2">
                    <Clock size={14} className="text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">{formatDate(post.scheduledFor)}</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  {post.platforms.map((platform) => (
                    <div 
                      key={platform}
                      className="p-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {getPlatformIcon(platform)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {upcomingPosts.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500">No upcoming posts scheduled</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => {/* Handle action */}}
                >
                  Schedule a Post
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="card p-4">
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                    <Check size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Sunday Service Reminder</span> was posted successfully
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                    <PlusCircle size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Youth Group Promo</span> was uploaded
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                    <Calendar size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Easter Campaign</span> was created
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for the activity icon
const Check = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Dashboard;