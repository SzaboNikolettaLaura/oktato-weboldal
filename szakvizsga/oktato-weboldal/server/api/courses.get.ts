import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const { token } = getQuery(event);
    const user = event.context.$readUserToken(token);
    if(!user) {
      return sendError(event, new Error('Unauthorized'));
    }
    const visibleQuery = user.role === 'tanar' ? '' : 'WHERE visible = 1';
    
    // Fetch all courses
    const [courses, __] = await event.context.$mysql.query(`
      SELECT * FROM courses ${visibleQuery}
    `);

    // Prepare an empty array to hold the result
    const result = [];

    // For each course, fetch its associated lectures
    for (const course of courses) {
      const [lectures, __] = await event.context.$mysql.query(`
        SELECT * FROM lectures WHERE courseId = ? ${visibleQuery}
      `, [course.id]);

      // Parse the blocks from content for each lecture
      for (const lecture of lectures) {
        try {
          lecture.blocks = JSON.parse(lecture.content);
        } catch (error) {
          lecture.blocks = [];
        }
      }

      // Push the course with the lectures as a nested attribute
      result.push({
        ...course,
        lectures: lectures
      });
    }

    return result;

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
});