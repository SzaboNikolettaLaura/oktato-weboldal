import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as number;
    
    if (!id) {
      throw new Error("Missing id parameter");
    }

    const { blocks, title, token, visibility } = await readBody(event);
    const user = event.context.$readUserToken(token);

    // Check if the user's role is "tanar"
    if (user.role !== "tanar") {
      return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
    }

    // Update the lecture title and visibility
    await event.context.$mysql.query(`
      UPDATE lectures 
      SET title = ?, content = ?, visible = ?
      WHERE id = ?
    `, [title, JSON.stringify(blocks), visibility, id]);

    return { message: 'Lecture updated successfully!' };

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 