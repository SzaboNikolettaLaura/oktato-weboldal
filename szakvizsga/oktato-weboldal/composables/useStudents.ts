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
    completionStats?: {
        totalCompletions: number;
        uniqueLectures: number;
        lastLectureTitle: string;
        detailedCompletions: Array<{
            lectureId: number;
            completedAt: string;
            lectureTitle: string;
            courseTitle: string;
        }>;
    };
}

const useStudents = async (token?: string) => {
    const init = async (): Promise<IStudent[]> => {
        try {
            const url = token ? `/api/students?token=${token}` : '/api/students';
            const students = await axios<IStudent[]>(url);
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