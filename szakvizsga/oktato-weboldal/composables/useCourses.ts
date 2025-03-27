import axios from "axios";

export type IExercise = {
    id: number;
    description: string;
    code: string;
}

export type ILecture = {
    id: number;
    title: string;
    content: string;
}

export type ICourse = {
    id: number;
    title: string;
    lectures: ILecture[]
}

const useCourses = async (token: string) => {
    const init = async (): Promise<ICourse[]> => {
        try {
            const courses = await axios<ICourse[]>('/api/courses', {
                params: {
                    token
                }
            })
            return courses.data;
        } catch(e) {
            return []
        }
    }
    const courseData = await useAsyncData<ICourse[]>(`courses`, init);
    
    const setCourses = (courses: ICourse[]) => {
        courseData.data.value = courses;
    }

    return {
        courseData: courseData.data,
        setCourses
    }
}
export default useCourses