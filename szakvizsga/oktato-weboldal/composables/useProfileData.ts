import axios from "axios";
import type { IUser } from "./useUserData";

export type IProfile = {
    id: number;
    specialization: string;
    year: number | null;
    group: string;
    initialScore: number | null;
    user: IUser | null;
}

const useProfileData = async () => {

    const {userData} = useUserData();
    const init = async (): Promise<IProfile> => {
        if(userData.value.role === 'guest') {
            return {
                id: 0,
                specialization: '',
                group: '',
                initialScore: null,
                year: null,
                user: userData.value
            }
        }
        try {
            const profile = await axios<IProfile>('/api/profile', {params: {token: userData.value.token}});
            return {...profile.data, user: userData.value};
        } catch(e) {
            return {
                id: 0,
                specialization: '',
                group: '',
                initialScore: null,
                year: null,
                user: userData.value
            }
        }
    }
    const profileData = await useAsyncData<IProfile>('profile', init);
    
    return {
        profileData: profileData.data
    }
}
export default useProfileData