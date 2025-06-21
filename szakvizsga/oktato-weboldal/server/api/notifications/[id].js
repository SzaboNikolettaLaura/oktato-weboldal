import { defineEventHandler, getQuery, readBody, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const method = event.method;
    const mysql = event.context.$mysql;
    const id = event.context.params.id;

    if (method === 'PUT') {
      const { title, message, deadline, status, token } = await readBody(event);
      if (!token) {
        return sendError(event, new Error('Missing token parameter'));
      }
      const user = event.context.$readUserToken(token);
      if (!user) {
        return sendError(event, new Error('Unauthorized'));
      }
      if (user.role !== 'tanar') {
        return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
      }
      await mysql.query(
        `UPDATE notifications 
         SET title = ?, message = ?, deadline = ?, status = ?
         WHERE id = ?`,
        [title, message, deadline, status, id]
      );
      return { message: 'Notification updated successfully!' };
    }

    if (method === 'DELETE') {
      const query = getQuery(event);
      const token = query.token;
      if (!token) {
        return sendError(event, new Error('Missing token parameter'));
      }
      const user = event.context.$readUserToken(token);
      if (!user) {
        return sendError(event, new Error('Unauthorized'));
      }
      if (user.role !== 'tanar') {
        return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
      }
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
      return { message: 'Notification deleted successfully!' };
    }

    return sendError(event, new Error('Method not allowed'));
  } catch (error) {
    return sendError(event, new Error(error.message));
  }
}); 