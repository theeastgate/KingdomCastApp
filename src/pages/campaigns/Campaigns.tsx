import React, { useState } from 'react';
import { Calendar, PlusCircle, ChevronRight, Clock, Users, BarChart3 } from 'lucide-react';
import Button from '../../components/common/Button';

const Campaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'drafts'>('active');
  
  // Mock campaign data
  const campaigns = [
    {
      id: '1',
      name: 'Easter Outreach 2025',
      status: 'active',
      startDate: new Date(2025, 2, 10),
      endDate: new Date(2025, 3, 10),
      postsCount: 12,
      scheduledCount: 8,
      completedCount: 4,
      team: ['John D.', 'Sarah K.', 'Michael T.'],
      description: 'Easter service promotion and outreach campaign'
    },
    {
      id: '2',
      name: 'VBS 2025',
      status: 'active',
      startDate: new Date(2025, 4, 1),
      endDate: new Date(2025, 5, 15),
      postsCount: 8,
      scheduledCount: 8,
      completedCount: 0,
      team: ['Sarah K.', 'Michael T.'],
      description: 'Vacation Bible School registration and event promotion'
    },
    {
      id: '3',
      name: 'Christmas 2024',
      status: 'past',
      startDate: new Date(2024, 10, 15),
      endDate: new Date(2024, 11, 25),
      postsCount: 15,
      scheduledCount: 0,
      completedCount: 15,
      team: ['John D.', 'Sarah K.', 'Michael T.', 'Lisa R.'],
      description: 'Christmas services and events promotion'
    },
    {
      id: '4',
      name: 'Fall Series 2024',
      status: 'past',
      startDate: new Date(2024, 8, 1),
      endDate: new Date(2024, 9, 30),
      postsCount: 8,
      scheduledCount: 0,
      completedCount: 8,
      team: ['John D.', 'Michael T.'],
      description: 'Fall sermon series promotion'
    },
    {
      id: '5',
      name: 'Summer Camp 2025',
      status: 'draft',
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2025, 6, 31),
      postsCount: 5,
      scheduledCount: 0,
      completedCount: 0,
      team: ['Sarah K.'],
      description: 'Summer youth camp registration and promotion'
    }
  ];
  
  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 'active') return campaign.status === 'active';
    if (activeTab === 'past') return campaign.status === 'past';
    return campaign.status === 'draft';
  });
  
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };
  
  const calculateProgress = (completedCount: number, totalCount: number) => {
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">Organize your content into strategic campaigns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => {/* Handle action */}}
          >
            New Campaign
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'active'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Campaigns
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'past'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Campaigns
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'drafts'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drafts
            </button>
          </nav>
        </div>
        
        {/* Campaign List */}
        <div className="p-4">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeTab === 'active'
                  ? "You don't have any active campaigns. Create one to start organizing your content."
                  : activeTab === 'past'
                  ? "You don't have any past campaigns."
                  : "You don't have any draft campaigns."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                leftIcon={<PlusCircle size={18} />}
                onClick={() => {/* Handle action */}}
              >
                Create a Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <ChevronRight size={16} className="ml-2 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar size={16} className="mr-1" />
                        <span>{formatDateRange(campaign.startDate, campaign.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="sm:text-right mt-4 sm:mt-0">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium">
                            {campaign.status === 'active' ? (
                              <>
                                <span className="text-success-600">{campaign.completedCount}</span>
                                <span className="text-gray-500"> / {campaign.postsCount} posts</span>
                              </>
                            ) : campaign.status === 'past' ? (
                              <span className="text-gray-900">{campaign.postsCount} posts</span>
                            ) : (
                              <span className="text-gray-500">{campaign.postsCount} planned posts</span>
                            )}
                          </div>
                          
                          {campaign.status === 'active' && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-primary-600 h-1.5 rounded-full" 
                                style={{ width: `${calculateProgress(campaign.completedCount, campaign.postsCount)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Users size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm">
                          <span className="font-medium">{campaign.team.length}</span> team members
                        </div>
                      </div>
                      
                      {campaign.status === 'past' && (
                        <div className="flex items-center">
                          <BarChart3 size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm">
                            <span className="font-medium">View Analytics</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;