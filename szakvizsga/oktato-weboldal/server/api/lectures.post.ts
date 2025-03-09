import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
      // Parse the incoming JSON body
      const { course, blocks, title } = await readBody(event);
      const [lectureResult, __] = await event.context.$mysql.query(`
        INSERT INTO lectures (courseId, title, content)
        VALUES (?, ?, ?)
      `, [course, title, '']);
      console.log(blocks);
      const lectureId = lectureResult.insertId;
      let content = '';
      for(const block of blocks) {
          if(block.type === 'text') {
              content += block.content + "\n";
          } else if(block.type === 'code') {
            const [exerciseResult, _] = await event.context.$mysql.query(`
              INSERT INTO exercises (lectureId, description, code)
              VALUES (?, ?, ?)
            `, [lectureId, block.description, block.content]);
            const exerciseId = exerciseResult.insertId;
            content += `\n@{${exerciseId}}\n`
          }
      }

      await event.context.$mysql.query('UPDATE lectures SET content = ? WHERE id = ?', [content, lectureId]);

      // Return a success response
      return { message: 'Course with lectures and exercises added successfully!' };

    } catch (error: any) {
      // Handle any errors and send the error response
      return sendError(event, new Error(error.message));
    }
});
