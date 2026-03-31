export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'leader' | 'admin';
  group_ids: string[];
  profile_image?: string;
  bio?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  member_ids: string[];
  meeting_day?: string;
  meeting_time?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  group_id?: string;
  host_id: string;
  attendee_ids: string[];
  scripture_reference?: string;
  notes?: string;
  created_at: string;
}

export interface VerseDiscussion {
  id: string;
  verse_reference: string;
  verse_text: string;
  shared_by_id: string;
  shared_by_name: string;
  reflection?: string;
  group_id?: string;
  image?: string;
  comments: Comment[];
  likes: string[];
  created_at: string;
}

export interface Comment {
  id: string;
  member_id: string;
  member_name: string;
  text: string;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  requested_by_id: string;
  requested_by_name: string;
  is_anonymous: boolean;
  is_answered: boolean;
  group_id?: string;
  praying_members: string[];
  created_at: string;
  answered_at?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  member_id: string;
  scripture_reference?: string;
  session_id?: string;
  tags: string[];
  is_private: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id?: string;
  group_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  group_id?: string;
  is_pinned: boolean;
  created_at: string;
}
