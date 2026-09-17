export interface Post {
  id: string;
  category: '자유' | '스포츠클럽' | '학생체육지원단' | '내가 바로 원곡 릴스꾼' | '학생심판지원단(기자단)' | string;
  title: string;
  author: string;
  content: string;
  date: string;
  views: number;
  isFlagged?: boolean;
  flaggedReason?: string;
  fileUrl?: string;
  fileData?: string;
  linkUrl?: string;
  imageUrl?: string;
  imageFileName?: string;
  imageFileSize?: number;
  hasStoredImage?: boolean;
  videoUrl?: string;
  videoData?: string;
  videoFileName?: string;
  videoSourceType?: 'file' | 'youtube' | 'link';
  hasStoredVideo?: boolean;
  videoFileSize?: number;
}

export interface RentalItem {
  id: string;
  name: string;
  category: string;
  total: number;
  rented: number;
  image?: string;
  renter?: string;
  classRoom?: string;
}

export interface MatchItem {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  time: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'finished';
}

export type UserRole = 'student' | 'student_council' | 'admin';

export interface ToastInfo {
  text: string;
  type: 'success' | 'error' | 'info';
}
