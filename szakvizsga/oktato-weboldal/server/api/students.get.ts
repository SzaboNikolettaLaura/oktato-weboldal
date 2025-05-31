import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const token = query.token as string;
        
        if (!token) {
            return sendError(event, new Error("Missing token parameter"));
        }

        const user = event.context.$readUserToken(token);

        if (!user) {
            return sendError(event, new Error("Unauthorized: Invalid token"));
        }

        if (user.role !== "tanar") {
            return sendError(event, new Error("Unauthorized: Only teachers can view student data"));
        }

        // Get basic student data - simplified query to debug
        const [students] = await event.context.$mysql.query(`
            SELECT 
                users.id as id, 
                first_name, 
                last_name, 
                email, 
                specialization, 
                year, 
                \`group\`, 
                initialScore
            FROM users 
            JOIN students ON users.id = students.id 
            WHERE role = 'diak'
        `);

        const [lectures] = await event.context.$mysql.query(`
            SELECT id, title
            FROM lectures
        `);

        // Add default values for now
        for (let student of students) {
            const [completions] = await event.context.$mysql.query(`
                SELECT lectureId, completedAt, answers
                FROM completions 
                WHERE studentId = ?
                ORDER BY completedAt DESC
            `, [student.id]);

            student.lastLecture = completions[0]?.lectureId || null;
            student.completionStats = {
                totalCompletions: completions.length,
                uniqueLectures: new Set(completions.map((c: any) => c.lectureId)).size,
                lastLectureTitle: lectures.find((l: any) => l.id === completions[0]?.lectureId)?.title || 'N/A',
                detailedCompletions: completions.map((c: any) => ({
                    lectureId: c.lectureId,
                    completedAt: c.completedAt
                }))
            };
        }
       
        return students;
    } catch (error: any) {
        console.error('Students API Error:', error);
        return sendError(event, new Error(error.message));
    }
});
