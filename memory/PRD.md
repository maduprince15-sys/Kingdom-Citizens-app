# Kingdom Citizens - Bible Studies Team App

## Overview
A mobile application for Bible studies team called "Kingdom Citizens". The app facilitates community engagement through study sessions, prayer requests, verse sharing, and member communication.

## Core Features

### 1. Study Session Scheduling & Calendar
- Create study sessions with date, time, location, and scripture reference
- View upcoming and past sessions
- RSVP/attendance tracking
- Session details view
- **Add to device calendar integration** (iOS/Android)
- **Push notification reminders** for sessions you're attending

### 2. Bible Verse Sharing & Discussion
- Share verses with reference and text
- Add personal reflections
- **Attach images to verses**
- Like and comment on shared verses
- Community discussion threads

### 3. Prayer Request Board
- Submit prayer requests (can be anonymous)
- "Praying for you" feature to show support
- Mark prayers as answered
- Filter between active and answered prayers
- **Push notifications for new prayer requests**

### 4. Member Directory & Profiles
- User registration with name and email
- Profile management (name, phone, bio)
- Member directory with roles
- View other member profiles

### 5. Study Notes/Journal
- Create personal study notes
- Tag notes with scripture references
- **Attach images to notes**
- Private or public note sharing
- Organize with custom tags

### 6. In-App Messaging
- Direct messaging between members
- Conversation history
- Real-time message updates

### 7. Announcements Board
- Post community announcements
- Pin important announcements
- **Push notifications for new announcements**
- View announcement history

### 8. Groups
- Create small study groups
- Assign group leaders
- Group meeting schedules
- Join/leave groups

## New Features (v1.1)

### Push Notifications
- Notification for new prayer requests
- Notification for new announcements
- Session reminder notifications (1 hour before)

### Calendar Integration
- Add sessions to device calendar (iOS/Android)
- Automatic reminders via calendar app
- Creates "Kingdom Citizens" calendar

### Image Attachments
- Attach photos to verse discussions
- Attach photos to study notes
- Camera and photo library support

## Tech Stack
- **Frontend**: React Native with Expo Router
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: expo-notifications
- **Calendar**: expo-calendar
- **Image Picker**: expo-image-picker

## Theme
- Primary Color: Gold (#DAA520)
- Background: Dark (#0c0c0c)
- Surface: Dark Gray (#1a1a1a)
- Accent: Gold highlights

## API Endpoints
- `/api/members` - Member CRUD operations
- `/api/groups` - Group management
- `/api/sessions` - Study session scheduling
- `/api/verses` - Verse discussions (with image support)
- `/api/prayers` - Prayer requests
- `/api/notes` - Study notes (with image support)
- `/api/messages` - Direct messaging
- `/api/announcements` - Community announcements

## Navigation Structure
- **Home Tab**: Dashboard with recent content
- **Sessions Tab**: Study session calendar with calendar integration
- **Prayers Tab**: Prayer request board
- **Messages Tab**: Direct messaging
- **Profile Tab**: User profile and settings
