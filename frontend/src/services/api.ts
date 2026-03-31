import axios from 'axios';
import {
  Member,
  Group,
  StudySession,
  VerseDiscussion,
  PrayerRequest,
  StudyNote,
  Message,
  Announcement,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Members API
export const memberApi = {
  create: (data: Partial<Member>) => api.post<Member>('/members', data),
  getAll: () => api.get<Member[]>('/members'),
  getById: (id: string) => api.get<Member>(`/members/${id}`),
  getByEmail: (email: string) => api.get<Member>(`/members/email/${email}`),
  update: (id: string, data: Partial<Member>) => api.put<Member>(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
};

// Groups API
export const groupApi = {
  create: (data: Partial<Group>) => api.post<Group>('/groups', data),
  getAll: () => api.get<Group[]>('/groups'),
  getById: (id: string) => api.get<Group>(`/groups/${id}`),
  update: (id: string, data: Partial<Group>) => api.put<Group>(`/groups/${id}`, data),
  addMember: (groupId: string, memberId: string) =>
    api.post(`/groups/${groupId}/members/${memberId}`),
  removeMember: (groupId: string, memberId: string) =>
    api.delete(`/groups/${groupId}/members/${memberId}`),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

// Sessions API
export const sessionApi = {
  create: (data: Partial<StudySession>) => api.post<StudySession>('/sessions', data),
  getAll: (groupId?: string) =>
    api.get<StudySession[]>('/sessions', { params: { group_id: groupId } }),
  getUpcoming: () => api.get<StudySession[]>('/sessions/upcoming'),
  getById: (id: string) => api.get<StudySession>(`/sessions/${id}`),
  update: (id: string, data: Partial<StudySession>) =>
    api.put<StudySession>(`/sessions/${id}`, data),
  attend: (sessionId: string, memberId: string) =>
    api.post(`/sessions/${sessionId}/attend/${memberId}`),
  cancelAttendance: (sessionId: string, memberId: string) =>
    api.delete(`/sessions/${sessionId}/attend/${memberId}`),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

// Verses API
export const verseApi = {
  create: (data: Partial<VerseDiscussion>) => api.post<VerseDiscussion>('/verses', data),
  getAll: (groupId?: string) =>
    api.get<VerseDiscussion[]>('/verses', { params: { group_id: groupId } }),
  getById: (id: string) => api.get<VerseDiscussion>(`/verses/${id}`),
  addComment: (verseId: string, comment: { member_id: string; member_name: string; text: string }) =>
    api.post(`/verses/${verseId}/comments`, comment),
  like: (verseId: string, memberId: string) => api.post(`/verses/${verseId}/like/${memberId}`),
  unlike: (verseId: string, memberId: string) => api.delete(`/verses/${verseId}/like/${memberId}`),
  delete: (id: string) => api.delete(`/verses/${id}`),
};

// Prayers API
export const prayerApi = {
  create: (data: Partial<PrayerRequest>) => api.post<PrayerRequest>('/prayers', data),
  getAll: (groupId?: string, answered?: boolean) =>
    api.get<PrayerRequest[]>('/prayers', { params: { group_id: groupId, answered } }),
  getById: (id: string) => api.get<PrayerRequest>(`/prayers/${id}`),
  update: (id: string, data: Partial<PrayerRequest>) =>
    api.put<PrayerRequest>(`/prayers/${id}`, data),
  pray: (prayerId: string, memberId: string) =>
    api.post(`/prayers/${prayerId}/pray/${memberId}`),
  delete: (id: string) => api.delete(`/prayers/${id}`),
};

// Notes API
export const noteApi = {
  create: (data: Partial<StudyNote>) => api.post<StudyNote>('/notes', data),
  getAll: (memberId?: string, includePublic?: boolean) =>
    api.get<StudyNote[]>('/notes', { params: { member_id: memberId, include_public: includePublic } }),
  getById: (id: string) => api.get<StudyNote>(`/notes/${id}`),
  update: (id: string, data: Partial<StudyNote>) => api.put<StudyNote>(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// Messages API
export const messageApi = {
  create: (data: Partial<Message>) => api.post<Message>('/messages', data),
  getAll: (memberId: string, conversationWith?: string, groupId?: string) =>
    api.get<Message[]>('/messages', {
      params: { member_id: memberId, conversation_with: conversationWith, group_id: groupId },
    }),
  getConversations: (memberId: string) => api.get(`/messages/conversations/${memberId}`),
  markRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
};

// Announcements API
export const announcementApi = {
  create: (data: Partial<Announcement>) => api.post<Announcement>('/announcements', data),
  getAll: (groupId?: string) =>
    api.get<Announcement[]>('/announcements', { params: { group_id: groupId } }),
  getById: (id: string) => api.get<Announcement>(`/announcements/${id}`),
  togglePin: (id: string, pin: boolean) =>
    api.put(`/announcements/${id}/pin`, null, { params: { pin } }),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export default api;
