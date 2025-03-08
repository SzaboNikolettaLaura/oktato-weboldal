import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        // Extract query parameters
        const query = getQuery(event);
        const id = query.id as number;
        if (!id) {
            throw new Error("Missing id parameter");
        }

        const [rows, __] = await event.context.$mysql.query('SELECT id, role, first_name, last_name, email FROM users where ID = ?', [id]);
        if(rows.length === 0) {
            throw new Error("No user found with id");
        }
        const userData = rows[0];
        if (!userData || !userData.id) {
            throw new Error("Invalid id");
        }

        // Fetch profile data from MySQL using user ID
        const [profile, _] = await event.context.$mysql.query(
            "SELECT * FROM students WHERE id = ?",
            [userData.id]
        );

        if (!profile.length) {
            throw new Error("Profile not found");
        }

        return {...profile[0], user: userData}; // Return the first row
    } catch (error: any) {
        return sendError(event, new Error(error.message));
    }
});
