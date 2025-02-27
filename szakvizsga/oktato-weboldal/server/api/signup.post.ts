import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    const mysql = event.context.$mysql

    const body = await readBody(event);
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      await mysql.query('INSERT INTO users(email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
            [body.email, hashedPassword, body.role, body.firstName, body.lastName]
      )
      return {
        message: 'Success'
      }
    } catch(e) {
      setResponseStatus(event, 400);
      let message = 'Error while login';
      if(e && typeof(e) === 'object' && 'message' in e) {
        message = e.message as string;
      }
      return {
        error: message
      }
    }
  })