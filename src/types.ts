/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SyllabusInput {
  courseName: string;
  goals?: string;
  targetAudience?: string;
  duration?: string;
  requirements?: string;
}

export interface CourseDetail {
  hour: string;
  topic: string;
  objective: string;
  content: string[]; // List of 3-5 bullet points
  exercise: string;
}

export interface ExternalCourse {
  name: string;
  link: string;
  type: 'free' | 'paid';
}

export interface Syllabus {
  introduction: string;
  goals: string;
  targetAudience: string;
  duration: string;
  detailedContent: CourseDetail[];
  externalCourses: ExternalCourse[];
}
