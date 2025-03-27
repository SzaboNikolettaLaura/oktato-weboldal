import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Get token from Authorization header
    const authHeader = event.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(event, new Error('No token provided'));
    }
    const token = authHeader.split(' ')[1];
    const user = event.context.$readUserToken(token);

    if (!user) {
      return sendError(event, new Error('Unauthorized'));
    }

    const body = await readBody(event);
    console.log('Received notification data:', body);
    const { courseId, lectureId, title, message, deadline } = body;

    // Verify course ownership
    const [course, __] = await event.context.$mysql.query(`
      SELECT * FROM courses WHERE id = ?
    `, [courseId]);

    if (!course || course.length === 0) {
      return sendError(event, new Error('Course not found or unauthorized'));
    }

    console.log('Inserting notification with values:', [courseId, lectureId, title, message, deadline]);

    // Insert notification
    const [result, _] = await event.context.$mysql.query(`
      INSERT INTO notifications (course_id, lecture_id, title, message, deadline, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [courseId, lectureId, title, message, deadline]);

    console.log('Insert result:', result);

    return { id: result.insertId };

  } catch (error: any) {
    console.error('Error in notifications.post:', error);
    return sendError(event, new Error(error.message));
  }
}); 