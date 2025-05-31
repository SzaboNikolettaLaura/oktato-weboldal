import { defineEventHandler, readBody, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const { lectureId, token, answers } = await readBody(event);
    const user = event.context.$readUserToken(token);

    if (!user) {
      return sendError(event, new Error("Unauthorized: Invalid token"));
    }

    if (user.role !== "diak") {
      return sendError(event, new Error("Unauthorized: Only students can submit test completions"));
    }

    if (!lectureId) {
      return sendError(event, new Error("Missing lectureId parameter"));
    }

    const studentId = user.id;
    const completedAt = new Date();

    // Check if completion already exists for this student and lecture
    const [existingRows] = await event.context.$mysql.query(`
      SELECT id FROM completions 
      WHERE studentId = ? AND lectureId = ?
    `, [studentId, lectureId]);

    let completionId;

    if (existingRows.length > 0) {
      // Update existing completion
      await event.context.$mysql.query(`
        UPDATE completions 
        SET completedAt = ?, answers = ?
        WHERE studentId = ? AND lectureId = ?
      `, [completedAt, JSON.stringify(answers), studentId, lectureId]);
      
      completionId = existingRows[0].id;
    } else {
      // Insert new completion
      const [result] = await event.context.$mysql.query(`
        INSERT INTO completions (studentId, lectureId, completedAt, answers)
        VALUES (?, ?, ?, ?)
      `, [studentId, lectureId, completedAt, JSON.stringify(answers)]);
      
      completionId = result.insertId;
    }

    return { 
      message: 'Test completion recorded successfully!',
      completionId: completionId,
      completedAt: completedAt
    };

  } catch (error: any) {
    console.log(error);
    return sendError(event, new Error(error.message));
  }
}); 