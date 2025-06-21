import { defineEventHandler, getQuery, sendError, readMultipartFormData } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const token = query.token;
        if (!token) {
            throw new Error("Missing token parameter");
        }
        const {id} = event.context.$readUserToken(token);
        if(!id) {
            throw new Error("Invalid token");
        }
        if (!(event.node.req.headers['content-type'] && event.node.req.headers['content-type'].includes('multipart/form-data'))) {
            throw new Error('Content-Type must be multipart/form-data');
        }
        const form = await readMultipartFormData(event);
        console.log(form);
        let imageFile = null;
        for (const item of form) {
            if (item.type.includes('image') && item.name === 'image') {
                imageFile = item;
                break;
            }
        }
        if (!imageFile) {
            throw new Error('No image file uploaded');
        }
        const ext = path.extname(imageFile.filename);
        const fileName = `user_${id}_${Date.now()}${ext}`;
        const savePath = path.join(process.cwd(), 'public', 'images', fileName);
        await fs.writeFile(savePath, imageFile.data);
        const imageUrl = `/images/${fileName}`;
        await event.context.$mysql.query('UPDATE users SET image = ? WHERE (id = ?)', [imageUrl, id]);
        return { message: 'Success', image: imageUrl };
    } catch (error) {
        console.log(error);
        return sendError(event, new Error(error.message));
    }
}); 