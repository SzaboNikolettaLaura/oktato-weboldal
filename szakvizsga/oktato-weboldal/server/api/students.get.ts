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

        // Add default values for now
        for (let student of students) {
            student.lastLecture = null;
            student.completionStats = {
                totalCompletions: 0,
                uniqueLectures: 0,
                lastLectureTitle: 'N/A',
                detailedCompletions: []
            };
        }
       
        return students;
    } catch (error: any) {
        console.error('Students API Error:', error);
        return sendError(event, new Error(error.message));
    }
});
