import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        // Extract query parameters
        const query = getQuery(event);
        const token = query.token;
        if (!token) {
            throw new Error("Missing token parameter");
        }

        const {id} = event.context.$readUserToken(token);
        if(!id) {
            throw new Error("Invalid token");
        }

        const body = await readBody(event);
        const {specialization, group, year, user} = body;
        await event.context.$mysql.query('UPDATE students SET specialization = ?, `group` = ?, year = ? WHERE (id = ?)', [specialization, group, year, id]);
        await event.context.$mysql.query('UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE (id = ?)', [user.email, user.first_name, user.last_name, id]);
        return {
            message: 'Success'
        }
    } catch (error: any) {
        console.log(error);
        return sendError(event, new Error(error.message));
    }
});
