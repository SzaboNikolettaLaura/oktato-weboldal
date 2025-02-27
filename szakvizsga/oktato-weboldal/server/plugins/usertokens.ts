import jwt from 'jsonwebtoken';

const USER_TOKEN_SECRET = 'nagyonszipiszupistring';

function createUserToken(userData: {id: number, email: string, name: string, role: string}) {
    const token = jwt.sign(userData, USER_TOKEN_SECRET);
    return token;
} 

function readUserToken(token: string) {
    try {
        const userData = jwt.verify(token, USER_TOKEN_SECRET);
        if(typeof(userData) === 'string') {
            return null;
        }
        const user: Record<string, string> = {};
        if('id' in userData) {
            user["id"] = userData.id;
        }
        if('email' in userData) {
            user["email"] = userData.email;
        }
        if('password' in userData) {
            user["password"] = userData.password;
        }
        return user;
    } catch(e) {
        console.error('Invalid token supplied');
        return null;
    }
}

export default defineNitroPlugin(async (nitroApp)=> {
    nitroApp.hooks.hook('request', (event) => {
      event.context.$createUserToken = createUserToken;
      event.context.$readUserToken = readUserToken;
    });
});