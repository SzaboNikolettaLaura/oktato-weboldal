import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as number;
    
    if (!id) {
      throw new Error("Missing id parameter");
    }

    const { visible, token } = await readBody(event);
    const user = event.context.$readUserToken(token);

    // Check if the user's role is "tanar"
    if (user.role !== "tanar") {
      return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
    }

    // Update the course visibility
    await event.context.$mysql.query(`
      UPDATE courses 
      SET visible = ? 
      WHERE id = ?
    `, [visible, id]);

    return { message: 'Course visibility updated successfully!' };

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 