import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        // Extract query parameters
        const query = getQuery(event);
        const id = query.id as number;
        if (!id) {
            throw new Error("Missing id parameter");
        }

        const [rows, __] = await event.context.$mysql.query('SELECT exerciseId, completedAt FROM completions WHERE studentId = ?', [id]);
        
        return rows;
    } catch (error: any) {
        return sendError(event, new Error(error.message));
    }
});
