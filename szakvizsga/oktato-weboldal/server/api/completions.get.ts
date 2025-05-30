import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { lectureId, studentId, token } = query;
    
    if (!token) {
      return sendError(event, new Error("Missing token parameter"));
    }

    const user = event.context.$readUserToken(token as string);

    if (!user) {
      return sendError(event, new Error("Unauthorized: Invalid token"));
    }

    let sqlQuery = '';
    let params: any[] = [];

    if (user.role === 'tanar') {
      // Teachers can see all completions for a lecture or all completions
      if (lectureId) {
        sqlQuery = `
          SELECT c.id, c.studentId, c.lectureId, c.completedAt, c.answers,
                 u.first_name, u.last_name, u.email
          FROM completions c
          JOIN users u ON c.studentId = u.id
          WHERE c.lectureId = ?
          ORDER BY c.completedAt DESC
        `;
        params = [lectureId];
      } else {
        sqlQuery = `
          SELECT c.id, c.studentId, c.lectureId, c.completedAt, c.answers,
                 u.first_name, u.last_name, u.email, l.title as lectureTitle
          FROM completions c
          JOIN users u ON c.studentId = u.id
          LEFT JOIN lectures l ON c.lectureId = l.id
          ORDER BY c.completedAt DESC
        `;
      }
    } else if (user.role === 'diak') {
      // Students can only see their own completions
      const userId = user.id;
      
      if (lectureId) {
        sqlQuery = `
          SELECT id, studentId, lectureId, completedAt, answers
          FROM completions 
          WHERE studentId = ? AND lectureId = ?
        `;
        params = [userId, lectureId];
      } else {
        sqlQuery = `
          SELECT c.id, c.studentId, c.lectureId, c.completedAt, c.answers,
                 l.title as lectureTitle
          FROM completions c
          LEFT JOIN lectures l ON c.lectureId = l.id
          WHERE c.studentId = ?
          ORDER BY c.completedAt DESC
        `;
        params = [userId];
      }
    } else {
      return sendError(event, new Error("Unauthorized: Invalid user role"));
    }

    const [rows] = await event.context.$mysql.query(sqlQuery, params);
    
    return rows;

  } catch (error: any) {
    console.log(error);
    return sendError(event, new Error(error.message));
  }
}); 