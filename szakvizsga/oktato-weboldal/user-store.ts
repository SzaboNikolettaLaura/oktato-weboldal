import { reactive } from 'vue'
import { jwtDecode } from "jwt-decode";

export const user = reactive({
    token: '',
    id: 0
});

export function clearUserToken() {
    localStorage.removeItem('user-token');
    user.token = '';
    user.id = 0;
}

export function setUserToken(token: string, remember: boolean) {
    if(remember) {
        localStorage.setItem('user-token', token);
    } else {
        clearUserToken();
    }
    user.token = token;
    const data = jwtDecode<Record<string, string>>(token);
    user.id = Number(data['id']);
}

export function init() {
    const token = localStorage.getItem('user-token');
    if(token) {
        setUserToken(token, true);
    }
 }