import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import { useContentStore } from '../../store/contentStore';
import { useAuthStore } from '../../store/authStore';
import { postToSocialMedia } from '../../services/socialMediaService';
import Button from '../../components/common/Button';
import ChurchIdModal from '../../components/modals/ChurchIdModal';
import { Upload, Calendar, Hash, X, Facebook, Instagram, Youtube, Radio } from 'lucide-react';
import { Platform, ContentType } from '../../types';

const ContentUploader: React.FC = () => {
  const navigate = useNavigate();
  const { createContent, loading } = useContentStore();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showChurchIdModal, setShowChurchIdModal] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        setContentType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setContentType('video');
      }
    }
  };
  
  const togglePlatform = (platform: Platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };
  
  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };
  
  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create content');
      return;
    }

    if (!user.church_id) {
      setShowChurchIdModal(true);
      return;
    }
    
    if (!title) {
      toast.error('Please enter a title for your content');
      return;
    }
    
    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    
    if (isScheduling && !scheduledFor) {
      toast.error('Please select a date and time to schedule your content');
      return;
    }
    
    try {
      setIsPosting(true);

      // Upload file and get URL (mock for now)
      const mediaUrl = file ? 'https://example.com/media/placeholder.jpg' : undefined;
      
      // Create content in database
      const content = await createContent({
        title,
        description,
        contentType,
        mediaUrl,
        platforms,
        status: isScheduling ? 'scheduled' : 'draft',
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined,
        authorId: user.id,
        churchId: user.church_id,
        hashtags,
      });

      // If not scheduling, post immediately to social media
      if (!isScheduling) {
        try {
          await postToSocialMedia({
            message: description || title,
            mediaUrl,
            platforms,
            scheduledFor: scheduledFor?.toISOString(),
          });
          
          toast.success('Content posted successfully!');
        } catch (postError: any) {
          // Show detailed error message in a more readable format
          const errorMessage = postError.message.split('\n').map((line: string) => 
            line.trim()
          ).join('\n');
          
          toast.error(
            <div className="whitespace-pre-wrap">
              <strong>Posting Error:</strong>
              <br />
              {errorMessage}
            </div>,
            { duration: 6000 }
          );
          
          // Still navigate since the content was created
          toast.success('Content saved as draft');
        }
      } else {
        toast.success('Content scheduled successfully!');
      }
      
      navigate('/calendar');
    } catch (error: any) {
      console.error('Error creating content:', error);
      toast.error(error.message || 'Failed to save content');
    } finally {
      setIsPosting(false);
    }
  };

  const handleChurchIdSuccess = () => {
    setShowChurchIdModal(false);
    // Refresh the page to get updated user data
    window.location.reload();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {showChurchIdModal && (
        <ChurchIdModal
          onClose={() => setShowChurchIdModal(false)}
          onSuccess={handleChurchIdSuccess}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Content</h1>
        <p className="text-gray-500 mt-1">Create and schedule new content for your social media platforms</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Sunday Service Reminder"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Add details about your post..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={contentType === 'image'}
                    onChange={() => setContentType('image')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Image</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={contentType === 'video'}
                    onChange={() => setContentType('video')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Video</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={contentType === 'text'}
                    onChange={() => setContentType('text')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Text Only</span>
                </label>
              </div>
            </div>
            
            {contentType !== 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {contentType === 'image' ? 'Upload Image' : 'Upload Video'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept={contentType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {contentType === 'image' 
                        ? 'PNG, JPG, GIF up to 10MB' 
                        : 'MP4, MOV up to 100MB'}
                    </p>
                    {file && (
                      <p className="text-sm text-primary-600 font-medium">
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platforms *
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => togglePlatform('facebook')}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  platforms.includes('facebook')
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Facebook size={18} className="mr-2" />
                Facebook
              </button>
              
              <button
                type="button"
                onClick={() => togglePlatform('instagram')}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  platforms.includes('instagram')
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Instagram size={18} className="mr-2" />
                Instagram
              </button>
              
              <button
                type="button"
                onClick={() => togglePlatform('youtube')}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  platforms.includes('youtube')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Youtube size={18} className="mr-2" />
                YouTube
              </button>
              
              <button
                type="button"
                onClick={() => togglePlatform('tiktok')}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  platforms.includes('tiktok')
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Radio size={18} className="mr-2" />
                TikTok
              </button>
            </div>
          </div>
          
          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hashtags
            </label>
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  className="input pl-9"
                  placeholder="Add hashtag"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={addHashtag}
              >
                Add
              </Button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <X size={12} />
                      <span className="sr-only">Remove hashtag</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Scheduling */}
          <div>
            <div className="flex items-center mb-4">
              <input
                id="schedule"
                type="checkbox"
                checked={isScheduling}
                onChange={() => setIsScheduling(!isScheduling)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="schedule" className="ml-2 block text-sm font-medium text-gray-700">
                Schedule this post
              </label>
            </div>
            
            {isScheduling && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-3">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">
                    Select date and time
                  </label>
                </div>
                <DatePicker
                  selected={scheduledFor}
                  onChange={(date) => setScheduledFor(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="input"
                  placeholderText="Click to select date and time"
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading || isPosting}
              leftIcon={isScheduling ? <Calendar size={18} /> : <Upload size={18} />}
            >
              {isScheduling ? 'Schedule Post' : 'Post Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentUploader;