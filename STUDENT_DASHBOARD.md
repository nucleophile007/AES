# Student Dashboard

A comprehensive student dashboard with assignment management, submission tracking, and communication features.

## Features

### 📚 Assignment Management
- View all assignments with due dates and status
- Submit assignments with text content and file uploads
- Track submission status (pending, submitted, graded)
- Filter assignments by subject and program

### 📝 Submission Tracking
- View all past submissions
- See grades and teacher feedback
- Download submitted files
- Track submission history

### 📊 Grades & Performance
- Overall grade tracking with visual progress bars
- Subject-wise grade breakdown
- Assignment completion rates
- Performance trends and improvement tracking

### 📅 Schedule & Events
- Upcoming tutoring sessions
- Assignment deadlines
- Calendar integration
- Event reminders and notifications

### 📈 Progress Monitoring
- Learning goals with progress tracking
- Study streak counter
- Performance analytics
- Achievement milestones

### 📚 Learning Resources
- Access to study materials
- Formula sheets and guides
- Video tutorial playlists
- Previous assignments archive

### 💬 Communication
- Direct messaging with teachers
- Conversation history
- Real-time notifications
- Teacher feedback and support

### 🎯 Sidebar Features
- **Overview**: Quick stats and recent activity
- **Assignments**: Complete assignment management
- **Submissions**: Submission history and status
- **Grades**: Performance tracking and analytics
- **Schedule**: Upcoming events and deadlines
- **Progress**: Goal tracking and achievements
- **Resources**: Learning materials library
- **Messages**: Teacher communication hub

## File Upload Support
- **Formats**: PDF, DOC, DOCX, TXT, JPG, PNG
- **Size Limit**: 10MB per file
- **Security**: File type validation and secure storage

## API Endpoints

### Assignments
- `GET /api/assignments` - Fetch assignments
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments` - Update assignment

### Submissions
- `GET /api/submissions` - Fetch submissions
- `POST /api/submissions` - Submit assignment
- `PUT /api/submissions` - Update submission

### Student Data
- `GET /api/student` - Fetch student profile and stats
- `PUT /api/student` - Update student profile

### File Upload
- `POST /api/upload` - Upload assignment files
- `DELETE /api/upload` - Delete uploaded files

### Messages
- `GET /api/messages` - Fetch conversations and messages
- `POST /api/messages` - Send new message
- `PUT /api/messages` - Mark messages as read

## Usage

Navigate to `/student-dashboard` to access the full dashboard interface.

The dashboard provides a comprehensive view of:
- Academic performance
- Assignment tracking
- Teacher communication
- Learning progress
- Study resources

All data is organized in an intuitive sidebar navigation with real-time updates and notifications.
