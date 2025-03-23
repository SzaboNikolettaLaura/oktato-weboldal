import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Parse the incoming JSON body
    const { title, token } = await readBody(event);
    // Retrieve the user from the token
    const user = event.context.$readUserToken(token);
    // Check if the user's role is "tanar"
    if (user.role !== "tanar") {
      return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
    }
    // Proceed with inserting the lecture data into the database
    const [courseResult, __] = await event.context.$mysql.query(`
      INSERT INTO courses (title)
      VALUES (?)
    `, [title]);

    // Return a success response
    return { message: 'Course added successfully!' };

  } catch (error: any) {
    console.log(error);
    // Handle any errors and send the error response
    return sendError(event, new Error(error.message));
  }
});
