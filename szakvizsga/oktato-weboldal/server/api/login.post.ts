import bcrypt from 'bcrypt';

import { defineEventHandler, readBody, setResponseStatus, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const mysql = event.context.$mysql

  const body = await readBody(event)
  const { email, password } = body

  try {
    // Query the database to check if the email and password match a user
    const [rows] = await mysql.query(
      'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = ?',
      [email, password]
    )

    // If no user is found with the given credentials
    if (rows.length === 0) {
        throw new Error("User not found");
    }

    const storedPassword = rows[0]['password'];
    const isPasswordSame = await bcrypt.compare(password, storedPassword);

    if(!isPasswordSame) {
      throw new Error("Incorrect password");
    }

    // If a user is found, return success
    return {
      token: event.context.$createUserToken(rows[0])
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
