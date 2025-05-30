# Test Feature Documentation

## Overview

This application now includes a comprehensive test system that allows teachers to create tests and students to take them. The test system is integrated into the lesson editor and course viewer.

## Features

### For Teachers

1. **Test Creation**: Teachers can create tests as part of lessons using the TestBlockEditor component
2. **Question Types**: Support for three types of questions:
   - Text questions (short answer)
   - Radio questions (single choice multiple choice)
   - Checkbox questions (multiple choice with multiple correct answers)
3. **AI Generation**: Tests can be generated automatically using AI by providing a prompt
4. **Test Preview**: Teachers can do a "test run" to see how the test appears to students
5. **Correct Answer Indicators**: In teacher mode, correct answers are marked with ✓

### For Students

1. **Test Taking**: Students can take tests by clicking the test button in course view
2. **Progress Tracking**: See how many questions have been answered in each test
3. **Navigation**: Move between different tests within a lecture
4. **Answer Validation**: Cannot submit until all questions are answered
5. **Multiple Test Support**: A single lecture can contain multiple test blocks

## How to Use

### Creating a Test (Teachers)

1. Go to the lesson editor (`/lessonedit`)
2. Select or create a course
3. Add a "Test Block" from the dropdown or context menu
4. Click "Módosítás" (Edit) on the test block
5. In the TestBlockEditor modal:
   - Enter a test title
   - Add questions manually or use AI generation
   - For each question, select the type and add options if needed
   - Mark correct answers for multiple choice questions
6. Click "Teszt mentése" (Save Test)

### Taking a Test (Students/Teachers)

1. Go to the course view (`/course`)
2. Find a lecture that contains tests
3. Click "Teszt megkezdése" (Start Test) or "Teszt előnézet" (Test Preview) for teachers
4. Navigate through the test using the sidebar or navigation buttons
5. Answer all questions
6. Click "Teszt beküldése" (Submit Test) when complete

## Technical Details

### File Structure

- `pages/test/[id].vue` - Main test taking page
- `components/TestBlockEditor.vue` - Test creation/editing modal
- Modified `pages/course.vue` - Added test buttons and preview
- Modified `pages/lessonedit.vue` - Integration with lesson editor

### Data Format

Tests are stored as blocks within lectures:

```json
{
  "type": "test",
  "title": "Test Title",
  "questions": [
    {
      "title": "Question text",
      "type": "text|radio|checkbox",
      "options": [
        {
          "text": "Option text",
          "isCorrect": true|false
        }
      ]
    }
  ],
  "id": "unique_id"
}
```

### API Endpoints

Tests use the existing lecture API endpoints:
- `GET /api/lectures?id={lectureId}` - Load test data
- `POST /api/lectures` - Save new tests
- `PATCH /api/lectures?id={lectureId}` - Update existing tests

### URL Structure

- Test taking: `/test/{lectureId}`
- The page automatically extracts all test blocks from the specified lecture

## Features Implemented

✅ Test creation with multiple question types
✅ AI-powered test generation
✅ Test preview for teachers
✅ Student test taking interface
✅ Progress tracking
✅ Answer validation
✅ Multiple test support per lecture
✅ Responsive design
✅ Integration with existing lesson system

## Future Enhancements

- Test result storage and grading
- Time limits for tests
- Test statistics and analytics
- Student performance tracking
- Export test results
- Question banks and reusable questions 