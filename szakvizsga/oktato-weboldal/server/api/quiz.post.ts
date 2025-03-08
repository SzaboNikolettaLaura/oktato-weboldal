import { defineEventHandler, readBody, setResponseStatus, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const mysql = event.context.$mysql

  const body = await readBody(event)
  const { correct, token } = body
  const user = event.context.$readUserToken(token);
  try {
    await mysql.query(
      'UPDATE students SET initialScore = ? WHERE id = ?',
      [correct, user.id]
    );

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
