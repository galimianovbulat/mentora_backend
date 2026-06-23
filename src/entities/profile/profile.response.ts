import type { DISCIPLINE, EXAM_TYPE, SCHOOL_GRADE } from './constants';

export interface IProfile {
    firstName: string;
    lastName: string;
    surName: string | null;
}

export interface ITeacherProfile {
    discipline: DISCIPLINE[];
    examType: EXAM_TYPE[];
    schoolGrade: SCHOOL_GRADE[];
}

export interface IStudentProfile {
    schoolGrade: SCHOOL_GRADE;
}
