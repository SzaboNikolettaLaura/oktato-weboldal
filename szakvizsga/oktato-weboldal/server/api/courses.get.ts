import { defineEventHandler, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Fetch all courses
    const [courses, __] = await event.context.$mysql.query(`
      SELECT * FROM courses
    `);

    // Prepare an empty array to hold the result
    const result = [];

    // For each course, fetch its associated lectures
    for (const course of courses) {
      const [lectures, __] = await event.context.$mysql.query(`
        SELECT * FROM lectures WHERE course_id = ?
      `, [course.id]);

      // Add exercises to each lecture
      for (const lecture of lectures) {
        const [exercises, __] = await event.context.$mysql.query(`
          SELECT * FROM exercises WHERE lecture_id = ?
        `, [lecture.id]);

        // Add the exercises to the lecture
        lecture.exercises = exercises;
      }

      // Push the course with the lectures (and their exercises) as a nested attribute
      result.push({
        ...course,
        lectures: lectures
      });
    }

    return result;

  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
});
