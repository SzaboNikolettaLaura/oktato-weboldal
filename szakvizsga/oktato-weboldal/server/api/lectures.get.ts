import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as number;
    
    if (!id) {
      throw new Error("Missing id parameter");
    }

    // Get the lecture
    const [lectures, __] = await event.context.$mysql.query(`
      SELECT * FROM lectures WHERE id = ?
    `, [id]);

    if (lectures.length === 0) {
      throw new Error("Lecture not found");
    }

    const lecture = lectures[0];

    // Get exercises for this lecture
    const [exercises, ___] = await event.context.$mysql.query(`
      SELECT * FROM exercises WHERE lectureId = ?
    `, [id]);

    // Get tests for this lecture
    const [tests, ____] = await event.context.$mysql.query(`
      SELECT * FROM tests WHERE lectureId = ?
    `, [id]);

    // Parse the content to extract blocks
    const blocks = [];
    const contentParts = lecture.content.split(/(@\{[^\}]+\})/);

    for (const part of contentParts) {
      if (part.startsWith('@{')) {
        const exerciseId = Number(part.match(/(\d+)/)[1]);
        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
          blocks.push({
            type: 'code',
            content: exercise.code,
            description: exercise.description
          });
        }
      } else if (part.trim()) {
        blocks.push({
          type: 'text',
          content: part
        });
      }
    }

    // Add test blocks
    for (const test of tests) {
      blocks.push({
        type: 'test',
        title: test.title,
        questions: JSON.parse(test.questions)
      });
    }

    return {
      ...lecture,
      blocks
    };

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
}); 