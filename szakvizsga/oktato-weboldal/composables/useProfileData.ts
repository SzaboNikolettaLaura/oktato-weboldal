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

const useProfileData = async (id: number) => {
    const init = async (): Promise<IProfile> => {
        if(!id) {
            return {
                id: id,
                specialization: '',
                group: '',
                initialScore: null,
                year: null,
                user: null
            }
        }
        try {
            const profile = await axios<IProfile>('/api/profile', {params: {id}});
            return profile.data;
        } catch(e) {
            return {
                id: id,
                specialization: '',
                group: '',
                initialScore: null,
                year: null,
                user: null
            }
        }
    }
    const profileData = await useAsyncData<IProfile>(`profile-${id}`, init);
    
    return {
        profileData: profileData.data
    }
}
export default useProfileData