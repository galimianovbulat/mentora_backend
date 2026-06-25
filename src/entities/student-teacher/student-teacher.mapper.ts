import type { StudentTeacherLink } from './student-teacher.entity';
import type { IPublicLink } from './student-teacher.response';

export function toPublicLink(studentTeacherLink: StudentTeacherLink): IPublicLink {
    return {
        studentId: studentTeacherLink.studentId,
        teacherId: studentTeacherLink.teacherId,
    };
}
