import { jwtDecode } from "jwt-decode";

export type IUser = {
    token: string;
    id: Number;
    role: 'diak' | 'tanar' | 'guest';
    loaded: boolean;
    first_name: string;
    last_name: string;
    email: string;
}

const useUserData = () => {
  
    const init = (): IUser => {
        let loaded = false;
        if(process.browser) {
            const token = localStorage.getItem('user-token');
            if(token) {
                const data = jwtDecode<Record<string, string>>(token);
                return {
                    token: token,
                    id: Number(data['id']),
                    role: data['role'] as 'diak' | 'tanar',
                    loaded: true,
                    first_name: data['first_name'],
                    last_name: data['last_name'],
                    email: data['email']
                }
            }
            loaded = true;
        }
        return {
            token: '',
            id: 0,
            role: 'guest',
            loaded,
            first_name: '',
            last_name: '',
            email: ''
        }
    }
    const userData = useState<IUser>('user', init);

    const clearUserToken = () => {
        localStorage.removeItem('user-token');
    }

    const logout = () => {
        clearUserToken();
        userData.value = {
            id: 0,
            token: '',
            role: 'guest',
            loaded: true,
            first_name: '',
            last_name: '',
            email: ''
        };
    }
    
    const setUserData = (token: string, remember: boolean) => {
        if(remember) {
            localStorage.setItem('user-token', token);
        } else {
            clearUserToken();
        }
        userData.value.token = token;
        const data = jwtDecode<Record<string, string>>(token);
        userData.value.id = Number(data['id']);
        if(data['role'] === 'diak' || data['role'] === 'tanar') {
            userData.value.role = data['role'];
        }
        userData.value.first_name = data['first_name'];
        userData.value.last_name = data['last_name'];
        userData.value.email = data['email'];
        userData.value.loaded = true;
    }
    return {
        userData,
        setUserData,
        logout
    }
}
export default useUserData