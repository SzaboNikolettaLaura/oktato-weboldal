import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    
    const { token } = getQuery(event);
    const user = event.context.$readUserToken(token);
    if(!user) {
      return sendError(event, new Error('Unauthorized'));
    }

    const role = user.role;

    let query = '';
    let params: any[] = [];

    if (role === 'tanar') {
      // Teachers see notifications for their courses
      query = `
        SELECT n.*, c.title as course_title, l.title as lecture_title
        FROM notifications n
        JOIN courses c ON n.course_id = c.id
        LEFT JOIN lectures l ON n.lecture_id = l.id
        ORDER BY n.created_at DESC
      `;
      params = [];
    } else {
      // Students see notifications for courses they're enrolled in
      query = `
        SELECT n.*, c.title as course_title, l.title as lecture_title
        FROM notifications n
        JOIN courses c ON n.course_id = c.id
        LEFT JOIN lectures l ON n.lecture_id = l.id
        ORDER BY n.created_at DESC
      `;
      params = [];
    }
    const [notifications, _] = await event.context.$mysql.query(query, params);
    return notifications;

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 