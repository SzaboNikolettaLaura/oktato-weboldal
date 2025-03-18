import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Parse the incoming JSON body
    const { course, blocks, title, token } = await readBody(event);
    console.log(1);
    // Retrieve the user from the token
    const user = event.context.$readUserToken(token);
    console.log(user);
    // Check if the user's role is "tanar"
    if (user.role !== "tanar") {
      return sendError(event, new Error("Unauthorized: Only users with the 'tanar' role can perform this action."));
    }
    console.log('hello?');
    // Proceed with inserting the lecture data into the database
    const [lectureResult, __] = await event.context.$mysql.query(`
      INSERT INTO lectures (courseId, title, content)
      VALUES (?, ?, ?)
    `, [course, title, '']);
    console.log(blocks);
    const lectureId = lectureResult.insertId;
    let content = '';
    
    for (const block of blocks) {
      if (block.type === 'text') {
        content += block.content + "\n";
      } else if (block.type === 'code') {
        const [exerciseResult, _] = await event.context.$mysql.query(`
          INSERT INTO exercises (lectureId, description, code)
          VALUES (?, ?, ?)
        `, [lectureId, block.description, block.content]);
        const exerciseId = exerciseResult.insertId;
        content += `\n@{${exerciseId}}\n`
      } else if(block.type === 'test') {
        await event.context.$mysql.query(`
            INSERT INTO tests(lectureId, title, questions)
            VALUES(?, ?, ?)
          `, [lectureId, block.title, JSON.stringify(block.questions)]);
      }
    }

    // Update the lecture content in the database
    await event.context.$mysql.query('UPDATE lectures SET content = ? WHERE id = ?', [content, lectureId]);

    // Return a success response
    return { message: 'Course with lectures and exercises added successfully!' };

  } catch (error: any) {
    console.log(error);
    // Handle any errors and send the error response
    return sendError(event, new Error(error.message));
  }
});
