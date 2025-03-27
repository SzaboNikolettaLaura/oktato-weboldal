import { defineEventHandler, readBody, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const mysql = event.context.$mysql;
  
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

  // GET /api/notifications - Get all notifications
  if (method === 'GET') {
    try {
      const [notifications] = await mysql.query(`
        SELECT n.*, c.title as courseTitle, l.title as lectureTitle
        FROM notifications n
        JOIN courses c ON n.course_id = c.id
        LEFT JOIN lectures l ON n.lecture_id = l.id
        WHERE c.teacher_id = ? OR c.id IN (
          SELECT course_id FROM enrollments WHERE student_id = ?
        )
        ORDER BY n.created_at DESC
      `, [user.id, user.id]);

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return sendError(event, new Error('Error fetching notifications'));
    }
  }

  // POST /api/notifications - Create new notification
  if (method === 'POST') {
    const body = await readBody(event);
    const { courseId, lectureId, title, message, deadline } = body;

    try {
      // Verify teacher owns the course
      const [course] = await mysql.query(
        'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
        [courseId, user.id]
      );

      if (!course) {
        return sendError(event, new Error('You can only create notifications for your own courses'));
      }

      // If lectureId is provided, verify it belongs to the course
      if (lectureId) {
        const [lecture] = await mysql.query(
          'SELECT id FROM lectures WHERE id = ? AND course_id = ?',
          [lectureId, courseId]
        );

        if (!lecture) {
          return sendError(event, new Error('Invalid lecture for this course'));
        }
      }

      const [result] = await mysql.query(
        `INSERT INTO notifications (course_id, lecture_id, title, message, deadline)
         VALUES (?, ?, ?, ?, ?)`,
        [courseId, lectureId, title, message, deadline]
      );

      return {
        id: result.insertId,
        courseId,
        lectureId,
        title,
        message,
        deadline,
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return sendError(event, new Error(error.message || 'Error creating notification'));
    }
  }

  // PUT /api/notifications/:id - Update notification
  if (method === 'PUT') {
    const id = event.context.params.id;
    const body = await readBody(event);
    const { title, message, deadline, status } = body;

    try {
      // Verify teacher owns the course
      const [notification] = await mysql.query(`
        SELECT n.* FROM notifications n
        JOIN courses c ON n.course_id = c.id
        WHERE n.id = ? AND c.teacher_id = ?
      `, [id, user.id]);

      if (!notification) {
        return sendError(event, new Error('You can only update notifications for your own courses'));
      }

      await mysql.query(
        `UPDATE notifications 
         SET title = ?, message = ?, deadline = ?, status = ?
         WHERE id = ?`,
        [title, message, deadline, status, id]
      );

      return { id, title, message, deadline, status };
    } catch (error) {
      console.error('Error updating notification:', error);
      return sendError(event, new Error(error.message || 'Error updating notification'));
    }
  }

  // DELETE /api/notifications/:id - Delete notification
  if (method === 'DELETE') {
    const id = event.context.params.id;

    try {
      // Verify teacher owns the course
      const [notification] = await mysql.query(`
        SELECT n.* FROM notifications n
        JOIN courses c ON n.course_id = c.id
        WHERE n.id = ? AND c.teacher_id = ?
      `, [id, user.id]);

      if (!notification) {
        return sendError(event, new Error('You can only delete notifications for your own courses'));
      }

      await mysql.query('DELETE FROM notifications WHERE id = ?', [id]);

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return sendError(event, new Error(error.message || 'Error deleting notification'));
    }
  }

  return sendError(event, new Error('Method not allowed'));
}); 