# Test Completion Feature

## Overview
This feature allows students to complete tests and stores their completion data in the database. Teachers can view completion records to track student progress.

## Database Schema
The `completions` table tracks test completions with the following structure:
- `id` - Primary key (auto-increment)
- `studentId` - Foreign key to users table (student who completed the test)
- `lectureId` - Foreign key to lectures table (the lecture/test that was completed)
- `completedAt` - Timestamp when the test was completed
- `answers` - JSON column storing the student's answers

## API Endpoints

### POST /api/completions
Stores a test completion when a student submits a test.

**Request Body:**
```json
{
  "lectureId": "123",
  "answers": {
    "0": {
      "0": "answer text",
      "1": 2,
      "2": [1, 3]
    }
  },
  "token": "student_jwt_token"
}
```

**Response:**
```json
{
  "message": "Test completion recorded successfully!",
  "completionId": 456,
  "completedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/completions
Retrieves test completions based on user role.

**Query Parameters:**
- `lectureId` (optional) - Filter by specific lecture
- `studentId` (optional) - Filter by specific student (teachers only)
- `token` (required) - JWT token for authentication

**For Students:** Returns only their own completions
**For Teachers:** Returns completions for all students

## Frontend Implementation

### Test Page (`pages/test/[id].vue`)
- Checks if student has already completed the test on load
- Shows completion badge if test was previously completed
- Allows re-submission of tests
- Stores answers in database when student submits

### Features:
- **Completion Status**: Shows if a student has already completed the test
- **Answer Persistence**: Loads previous answers if student has already completed the test
- **Re-submission**: Allows students to update their answers by re-submitting
- **Teacher Preview**: Teachers can preview tests without creating completion records

## Database Migration
Run `db_migrations/add_answers_to_completions.sql` to add the answers column if it doesn't exist.

## Usage Examples

### Student completes a test:
1. Student navigates to `/test/123`
2. Student fills out test questions
3. Student clicks "Teszt beküldése"
4. System stores completion in database
5. Student sees success message and completion badge

### Teacher views completions:
```javascript
// Get all completions for a specific lecture
const response = await axios.get('/api/completions?lectureId=123&token=teacher_token');

// Get all completions for all lectures
const response = await axios.get('/api/completions?token=teacher_token');
```

### Student views their completions:
```javascript
// Get student's own completions
const response = await axios.get('/api/completions?token=student_token');

// Get student's completion for specific lecture
const response = await axios.get('/api/completions?lectureId=123&token=student_token');
```

## Security
- Students can only view and create their own completions
- Teachers can view all completions but cannot create them
- All endpoints require valid JWT tokens
- SQL injection protection through parameterized queries 