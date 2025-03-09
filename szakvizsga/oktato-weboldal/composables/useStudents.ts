import axios from "axios";

export type IStudent = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    specialization: string | null;
    year: string | null;
    group: string | null;
    initialScore: string | null;
    lastLecture: number | null;
}

const useStudents = async () => {
    const init = async (): Promise<IStudent[]> => {
        try {
            const students = await axios<IStudent[]>('/api/students')
            return students.data;
        } catch(e) {
            return []
        }
    }

    const studentData = await useAsyncData<IStudent[]>(`students`, init);

    return {
        studentData: studentData.data
    }
}
export default useStudents