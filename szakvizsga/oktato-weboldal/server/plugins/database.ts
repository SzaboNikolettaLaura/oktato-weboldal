import mysql from 'mysql2/promise';

export default defineNitroPlugin(async (nitroApp)=> {
  let pool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'hghjlug;o7986976',
    database: 'learning-web',
    connectionLimit: 10,
  });

    nitroApp.hooks.hook('request', (event) => {
      event.context.$mysql = pool;
  });
});