import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Image, 
  Video, 
  FileText, 
  Upload, 
  MoreHorizontal,
  Facebook,
  Instagram,
  Youtube,
  Radio
} from 'lucide-react';
import Button from '../../components/common/Button';
import { ContentType, Platform } from '../../types';

const MediaLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  
  // Mock media library data
  const mediaItems = [
    {
      id: '1',
      title: 'Sunday Service Announcement',
      contentType: 'image' as ContentType,
      thumbnailUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
      platforms: ['facebook', 'instagram'] as Platform[],
      createdAt: new Date(2025, 1, 15).toISOString(),
      status: 'posted',
    },
    {
      id: '2',
      title: 'Worship Night Promo',
      contentType: 'video' as ContentType,
      thumbnailUrl: 'https://images.pexels.com/photos/2774551/pexels-photo-2774551.jpeg?auto=compress&cs=tinysrgb&w=800',
      platforms: ['facebook', 'youtube'] as Platform[],
      createdAt: new Date(2025, 1, 28).toISOString(),
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'Weekly Bible Verse',
      contentType: 'image' as ContentType,
      thumbnailUrl: 'https://images.pexels.com/photos/267586/pexels-photo-267586.jpeg?auto=compress&cs=tinysrgb&w=800',
      platforms: ['instagram', 'facebook'] as Platform[],
      createdAt: new Date(2025, 2, 5).toISOString(),
      status: 'posted',
    },
    {
      id: '4',
      title: 'Youth Group Announcement',
      contentType: 'image' as ContentType,
      thumbnailUrl: 'https://images.pexels.com/photos/1769471/pexels-photo-1769471.jpeg?auto=compress&cs=tinysrgb&w=800',
      platforms: ['instagram'] as Platform[],
      createdAt: new Date(2025, 2, 10).toISOString(),
      status: 'posted',
    },
    {
      id: '5',
      title: 'Easter Service Invitation',
      contentType: 'video' as ContentType,
      thumbnailUrl: 'https://images.pexels.com/photos/2249390/pexels-photo-2249390.jpeg?auto=compress&cs=tinysrgb&w=800',
      platforms: ['facebook', 'youtube', 'instagram'] as Platform[],
      createdAt: new Date(2025, 2, 15).toISOString(),
      status: 'draft',
    },
    {
      id: '6',
      title: 'Monthly Newsletter',
      contentType: 'text' as ContentType,
      thumbnailUrl: '',
      platforms: ['facebook'] as Platform[],
      createdAt: new Date(2025, 2, 20).toISOString(),
      status: 'scheduled',
    },
  ];
  
  const filteredMedia = mediaItems
    .filter(item => 
      (selectedType === 'all' || item.contentType === selectedType) &&
      (searchTerm === '' || item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const renderContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'image':
        return <Image size={18} className="text-blue-500" />;
      case 'video':
        return <Video size={18} className="text-red-500" />;
      case 'text':
        return <FileText size={18} className="text-gray-500" />;
      default:
        return null;
    }
  };
  
  const renderPlatformIcon = (platform: Platform) => {
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
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Browse and manage your uploaded content</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary"
            leftIcon={<Upload size={18} />}
            onClick={() => {/* Handle upload */}}
          >
            Upload Media
          </Button>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search media..."
              className="input pl-9"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">Filter:</span>
            </div>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                className={`px-3 py-1.5 text-sm ${
                  selectedType === 'all' 
                    ? 'bg-gray-100 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedType('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1.5 text-sm flex items-center ${
                  selectedType === 'image' 
                    ? 'bg-gray-100 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedType('image')}
              >
                <Image size={14} className="mr-1" /> Images
              </button>
              <button
                className={`px-3 py-1.5 text-sm flex items-center ${
                  selectedType === 'video' 
                    ? 'bg-gray-100 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedType('video')}
              >
                <Video size={14} className="mr-1" /> Videos
              </button>
              <button
                className={`px-3 py-1.5 text-sm flex items-center ${
                  selectedType === 'text' 
                    ? 'bg-gray-100 font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedType('text')}
              >
                <FileText size={14} className="mr-1" /> Text
              </button>
            </div>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden ml-auto">
              <button
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={18} className="text-gray-700" />
              </button>
              <button
                className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Content */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No media found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : 'Try uploading some content or changing your filters'
            }
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {item.contentType !== 'text' ? (
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.contentType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="bg-white bg-opacity-75 p-2 rounded-full">
                            <Video size={20} className="text-gray-900" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 p-1 rounded-md bg-white bg-opacity-75">
                        {renderContentTypeIcon(item.contentType)}
                      </div>
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        {item.platforms.map((platform) => (
                          <div 
                            key={platform}
                            className="p-1 rounded-full bg-white bg-opacity-75"
                          >
                            {renderPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 flex items-center justify-center">
                      <FileText size={36} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-4 flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                      <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'posted' 
                          ? 'bg-success-100 text-success-800' 
                          : item.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <div className="col-span-6">Content</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-2 text-center">Platforms</div>
                <div className="col-span-2 text-center">Status</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredMedia.map((item) => (
                  <div 
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-6 flex items-center">
                      <div className="w-12 h-12 mr-3 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.contentType !== 'text' ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center">
                        {renderContentTypeIcon(item.contentType)}
                        <span className="ml-1 text-xs capitalize">
                          {item.contentType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex justify-center space-x-1">
                      {item.platforms.map((platform) => (
                        <div key={platform}>
                          {renderPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="col-span-2 flex justify-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'posted' 
                          ? 'bg-success-100 text-success-800' 
                          : item.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLibrary;