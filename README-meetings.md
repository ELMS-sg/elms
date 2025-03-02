# Meetings Feature Documentation

## Overview

The Meetings feature allows students to schedule, join, and manage meetings with teachers. It supports both one-on-one and group meetings, with options for online or in-person sessions. Teachers can set their availability, and students can book available slots.

## Database Schema

The meetings feature uses the following database tables:

1. **meetings** - Stores meeting details including:
   - Basic info (title, description, type)
   - Timing (start_time, end_time, duration)
   - Location details (is_online, meeting_link, location)
   - Status and capacity (status, max_participants, available_slots)
   - Relations (teacher_id, class_id)

2. **meeting_participants** - Tracks participants for group meetings:
   - meeting_id - Reference to the meeting
   - user_id - Reference to the participant
   - joined_at - When the user joined the meeting

3. **teacher_availability** - Manages teacher availability:
   - teacher_id - Reference to the teacher
   - date - The date of availability
   - slots - Array of available time slots

## Meeting Types and Statuses

- **Meeting Types**: 
  - `ONE_ON_ONE` - Individual sessions between a teacher and student
  - `GROUP` - Sessions with multiple participants

- **Meeting Statuses**:
  - `open` - Available for booking
  - `confirmed` - Booked and scheduled
  - `cancelled` - Cancelled by teacher or student
  - `completed` - Successfully conducted

## Setup Instructions

### 1. Database Setup

Run the migrations to create the necessary tables and functions:

```bash
npx supabase migration up
```

### 2. Seed Data

Populate the database with initial data:

```bash
npx supabase db reset
```

This will apply both migrations and seed data.

### 3. Environment Variables

Ensure your `.env.local` file includes the necessary Supabase configuration:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Functions

The meetings feature includes the following API functions in `src/lib/meeting-actions.ts`:

### Meeting Retrieval

- `getUpcomingMeetings()` - Fetches upcoming meetings for the current user
- `getPastMeetings()` - Fetches past meetings for the current user
- `getMeetingById(id)` - Retrieves details for a specific meeting
- `getAvailableMeetings()` - Fetches available meeting slots
- `getMeetingsForCalendar()` - Formats meetings for calendar display

### Meeting Management

- `scheduleMeeting(meetingData)` - Books a new meeting
- `cancelMeeting(meetingId)` - Cancels an existing meeting
- `joinMeeting(meetingId)` - Joins a group meeting

### Teacher Availability

- `getAvailableTeachers()` - Fetches teachers with availability
- `getTeacherAvailability(teacherId)` - Retrieves a teacher's available slots

## UI Components

The meetings feature includes the following pages:

1. **Meetings Dashboard** (`/dashboard/meetings`) - Overview of all meetings
2. **Calendar View** (`/dashboard/meetings/calendar`) - Calendar display of meetings
3. **Schedule Page** (`/dashboard/meetings/schedule`) - Interface for scheduling new meetings

## Security

Row Level Security (RLS) policies ensure that:

- Students can only view and join meetings they're eligible for
- Teachers can only manage their own meetings
- Administrators have full access to all meetings

## Future Enhancements

Potential improvements for the meetings feature:

1. Integration with calendar services (Google Calendar, Outlook)
2. Automated reminders via email/SMS
3. Meeting recording and note-taking capabilities
4. Rating and feedback system for completed meetings 