import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const [exercises, __] = await event.context.$mysql.query(`
      SELECT * FROM exercises
    `);

    
    return exercises;
  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
});
