import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const [rows, __] = await event.context.$mysql.query('SELECT users.id as id, first_name, last_name, email, specialization, year, `group`, initialScore, (SELECT MAX(lectureId) FROM completions WHERE studentId = users.id) as lastLecture FROM users JOIN students ON users.id = students.id LEFT JOIN completions on completions.studentId = students.id WHERE role = \'diak\'');
       
        return rows;
    } catch (error: any) {
        return sendError(event, new Error(error.message));
    }
});
