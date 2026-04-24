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

export interface SlideContent {
  id: string;
  title: string;
  points: string[];
  imagePrompt: string;
  imageUrl?: string;
}

export interface OverviewSlides {
  slides: SlideContent[];
  pythonPptxCode: string;
}

export interface SavedSyllabus {
  id: string;
  timestamp: number;
  input: SyllabusInput;
  syllabus: Syllabus;
  logoBase64: string | null;
  themeConfig: ThemeConfig;
  detailedLectures?: Record<string, DetailedLecture>; // Map hour string to lecture content
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontStyle: 'modern' | 'classic' | 'minimalist';
}

export interface LectureSlide {
  title: string;
  type: 'intro' | 'theory' | 'practice' | 'exercise' | 'summary';
  bullets: string[];
  speakerNotes: string;
  imagePrompt: string;
}

export interface DetailedLecture {
  topic: string;
  hour: string;
  slides: LectureSlide[];
  pythonPptxCode: string;
}
