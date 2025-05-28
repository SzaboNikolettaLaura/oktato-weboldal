import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as number;
    
    if (!id) {
      throw new Error("Missing id parameter");
    }

    const [lectures, __] = await event.context.$mysql.query(`
      SELECT * FROM lectures WHERE id = ?
    `, [id]);

    if (lectures.length === 0) {
      throw new Error("Lecture not found");
    }

    const lecture = lectures[0];
    try {
      lecture.blocks = JSON.parse(lecture.content);
    } catch (error) {
      lecture.blocks = [];
    }

    return lecture;

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 