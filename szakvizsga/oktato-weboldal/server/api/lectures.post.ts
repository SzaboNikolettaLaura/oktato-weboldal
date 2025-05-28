import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const { course, blocks, title, token, visibility } = await readBody(event);
    const user = event.context.$readUserToken(token);

    if (user.role !== "tanar") {
      return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
    }

    const [lectureResult, __] = await event.context.$mysql.query(`
      INSERT INTO lectures (courseId, title, content, visible)
      VALUES (?, ?, ?, ?)
    `, [course, title, JSON.stringify(blocks), visibility]);

    return { 
      message: 'Lecture added successfully!',
      id: lectureResult.insertId 
    };

  } catch (error: any) {
    console.log(error);
    return sendError(event, new Error(error.message));
  }
});
