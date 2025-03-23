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
      SET title = ?, visible = ?
      WHERE id = ?
    `, [title, visibility, id]);

    // Delete existing exercises and tests for this lecture
    await event.context.$mysql.query('DELETE FROM exercises WHERE lectureId = ?', [id]);
    await event.context.$mysql.query('DELETE FROM tests WHERE lectureId = ?', [id]);

    let content = '';
    
    // Recreate exercises and tests
    for (const block of blocks) {
      if (block.type === 'text') {
        content += block.content + "\n";
      } else if (block.type === 'code') {
        const [exerciseResult, _] = await event.context.$mysql.query(`
          INSERT INTO exercises (lectureId, description, code)
          VALUES (?, ?, ?)
        `, [id, block.description, block.content]);
        const exerciseId = exerciseResult.insertId;
        content += `\n@{${exerciseId}}\n`
      } else if(block.type === 'test') {
        await event.context.$mysql.query(`
          INSERT INTO tests(lectureId, title, questions)
          VALUES(?, ?, ?)
        `, [id, block.title, JSON.stringify(block.questions)]);
      }
    }

    // Update the lecture content
    await event.context.$mysql.query('UPDATE lectures SET content = ? WHERE id = ?', [content, id]);

    return { message: 'Lecture updated successfully!' };

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 