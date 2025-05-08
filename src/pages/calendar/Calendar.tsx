import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Facebook, 
  Instagram, 
  Youtube, 
  Radio,
  Image,
  Video,
  FileText,
  MoreVertical
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Platform, ContentType } from '../../types';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  
  // Mock data for scheduled content
  const scheduledContent = [
    {
      id: '1',
      title: 'Sunday Service Reminder',
      date: new Date(2025, 2, 10, 9, 0),
      platforms: ['facebook', 'instagram'] as Platform[],
      contentType: 'image' as ContentType
    },
    {
      id: '2',
      title: 'Youth Group Announcement',
      date: new Date(2025, 2, 15, 16, 30),
      platforms: ['instagram'] as Platform[],
      contentType: 'video' as ContentType
    },
    {
      id: '3',
      title: 'Bible Verse of the Day',
      date: new Date(2025, 2, 20, 8, 0),
      platforms: ['facebook', 'instagram', 'tiktok'] as Platform[],
      contentType: 'image' as ContentType
    },
    {
      id: '4',
      title: 'Worship Night Promo',
      date: new Date(2025, 2, 25, 19, 0),
      platforms: ['facebook', 'youtube'] as Platform[],
      contentType: 'video' as ContentType
    },
    {
      id: '5',
      title: 'Weekly Newsletter',
      date: new Date(2025, 2, 28, 10, 0),
      platforms: ['facebook'] as Platform[],
      contentType: 'text' as ContentType
    }
  ];
  
  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Previous month days to display
    const prevMonthDays = [];
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = daysInMonth(prevMonthYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentMonthDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Next month days to display
    const nextMonthDays = [];
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
    
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  
  const getContentForDay = (day: number, month: number, year: number) => {
    return scheduledContent.filter(content => {
      const contentDate = content.date;
      return (
        contentDate.getDate() === day &&
        contentDate.getMonth() === month &&
        contentDate.getFullYear() === year
      );
    });
  };
  
  const renderContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'image':
        return <Image size={14} />;
      case 'video':
        return <Video size={14} />;
      case 'text':
        return <FileText size={14} />;
      default:
        return null;
    }
  };
  
  const renderPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook size={14} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={14} className="text-pink-600" />;
      case 'youtube':
        return <Youtube size={14} className="text-red-600" />;
      case 'tiktok':
        return <Radio size={14} className="text-gray-900" />;
      default:
        return null;
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500 mt-1">View and manage your scheduled content</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate('/upload')}
          >
            New Post
          </Button>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center">
                <button
                  className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  onClick={prevMonth}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  onClick={nextMonth}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={view === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
        
        {/* Month View */}
        {view === 'month' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-gray-50 text-center py-2">
                  <span className="text-sm font-medium text-gray-700">{day}</span>
                </div>
              ))}
              
              {getMonthData().map((date, index) => {
                const dayContent = getContentForDay(date.day, date.month, date.year);
                
                return (
                  <div
                    key={index}
                    className={`bg-white min-h-[100px] p-2 ${
                      !date.isCurrentMonth ? 'text-gray-400' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isToday(date.day, date.month, date.year)
                            ? 'h-6 w-6 rounded-full bg-primary-600 text-white flex items-center justify-center'
                            : ''
                        }`}
                      >
                        {date.day}
                      </span>
                      {dayContent.length > 0 && (
                        <span className="text-xs text-gray-500">{dayContent.length} posts</span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                      {dayContent.map((content) => (
                        <div
                          key={content.id}
                          className="p-1 text-xs rounded bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center space-x-1">
                              <span>{renderContentTypeIcon(content.contentType)}</span>
                              <span className="font-medium">{formatTime(content.date)}</span>
                            </div>
                            <div>
                              <button className="p-0.5 hover:bg-gray-200 rounded-full">
                                <MoreVertical size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="truncate font-medium">{content.title}</p>
                          <div className="flex space-x-1 mt-1">
                            {content.platforms.map((platform) => (
                              <span key={platform}>{renderPlatformIcon(platform)}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Week View - Simplified for demo */}
        {view === 'week' && (
          <div className="p-4">
            <div className="text-center p-8">
              <p className="text-gray-500">Week view would display a detailed view of the current week's posts with hourly slots.</p>
              <p className="text-gray-500 mt-2">This would be implemented in the full version.</p>
            </div>
          </div>
        )}
        
        {/* Day View - Simplified for demo */}
        {view === 'day' && (
          <div className="p-4">
            <div className="text-center p-8">
              <p className="text-gray-500">Day view would display a detailed schedule for the selected day with hourly slots and content details.</p>
              <p className="text-gray-500 mt-2">This would be implemented in the full version.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Upcoming Posts (Simplified for demo) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Upcoming Posts</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {scheduledContent
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
            .map((content) => (
              <div key={content.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="mr-2">{renderContentTypeIcon(content.contentType)}</span>
                      <h3 className="font-medium text-gray-900">{content.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {content.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {content.platforms.map((platform) => (
                        <span
                          key={platform}
                          className={`platform-badge ${
                            platform === 'facebook'
                              ? 'platform-badge-facebook'
                              : platform === 'instagram'
                              ? 'platform-badge-instagram'
                              : platform === 'youtube'
                              ? 'platform-badge-youtube'
                              : 'platform-badge-tiktok'
                          }`}
                        >
                          {renderPlatformIcon(platform)}
                          <span className="ml-1">{platform}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Cancel</Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;