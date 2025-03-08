import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        // Extract query parameters
        const query = getQuery(event);
        const token = query.token as string;
        if (!token) {
            throw new Error("Missing token parameter");
        }

        // Get user data using the token
        const userData = await event.context.$readUserToken(token);

        if (!userData || !userData.id) {
            throw new Error("Invalid or expired token");
        }

        // Fetch profile data from MySQL using user ID
        const [profile, _] = await event.context.$mysql.query(
            "SELECT * FROM students WHERE id = ?",
            [userData.id]
        );

        if (!profile.length) {
            throw new Error("Profile not found");
        }

        return profile[0]; // Return the first row
    } catch (error: any) {
        return sendError(event, new Error(error.message));
    }
});
