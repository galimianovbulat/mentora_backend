import type { Profile } from './profile.entity';
import type { IProfile, IStudentProfile, ITeacherProfile } from './profile.response';
import type { StudentProfile } from './student-profile.entity';
import type { TeacherProfile } from './teacher-profile.entity';

export function toMyProfileResponse(
    profile: Profile | null,
    teacherProfile: TeacherProfile | null,
    studentProfile: StudentProfile | null,
) {
    return {
        profile: profile ? toPublicProfile(profile) : null,
        teacherProfile: teacherProfile ? toPublicTeacherProfile(teacherProfile) : undefined,
        studentProfile: studentProfile ? toPublicStudentProfile(studentProfile) : undefined,
    };
}

function toPublicProfile(profile: Profile): IProfile {
    return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        surName: profile.surName,
    };
}

function toPublicTeacherProfile(profile: ITeacherProfile): ITeacherProfile {
    return {
        discipline: profile.discipline,
        examType: profile.examType,
        schoolGrade: profile.schoolGrade,
    };
}

function toPublicStudentProfile(profile: IStudentProfile): IStudentProfile {
    return {
        schoolGrade: profile.schoolGrade,
    };
}
