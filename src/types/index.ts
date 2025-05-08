export type Role = 'admin' | 'editor' | 'viewer';

export type Platform = 'facebook' | 'instagram' | 'youtube' | 'tiktok';

export type ContentType = 'video' | 'image' | 'text';

export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed';

export interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: Role;
  churchId: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Church {
  id: string;
  name: string;
  logo?: string;
  websiteUrl?: string;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledFor?: string;
  postedAt?: string;
  authorId: string;
  churchId: string;
  campaignId?: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
  postIds?: Record<Platform, string>;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  churchId: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  contentType: ContentType;
  platforms: Platform[];
  defaultHashtags: string[];
  churchId: string;
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: Platform;
  accessToken: string;
  refreshToken?: string;
  pages?: any[];
  connectedAt: string;
  expiresAt?: string;
}