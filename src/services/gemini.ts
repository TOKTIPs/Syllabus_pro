import { GoogleGenAI, Type } from "@google/genai";
import { Syllabus, SyllabusInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const syllabusSchema = {
  type: Type.OBJECT,
  properties: {
    introduction: { type: Type.STRING, description: "General introduction of the course" },
    goals: { type: Type.STRING, description: "Learning objectives of the course" },
    targetAudience: { type: Type.STRING, description: "Intended learners" },
    duration: { type: Type.STRING, description: "Course duration (default to 16h - 2 days if not specified)" },
    detailedContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hour: { type: Type.STRING },
          topic: { type: Type.STRING },
          objective: { type: Type.STRING },
          content: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Detailed content points (3-5 items)"
          },
          exercise: { type: Type.STRING, description: "Illustrative exercise name/description" }
        },
        required: ["hour", "topic", "objective", "content", "exercise"]
      }
    },
    externalCourses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          link: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["free", "paid"] }
        },
        required: ["name", "link", "type"]
      }
    }
  },
  required: ["introduction", "goals", "targetAudience", "duration", "detailedContent", "externalCourses"]
};

export async function generateSyllabus(input: SyllabusInput, previousSyllabus?: Syllabus, adjustment?: string): Promise<Syllabus> {
  const durationText = input.duration ? input.duration : "16 giờ (2 ngày) - khóa cơ bản overview";
  
  let prompt = `Bạn là một chuyên gia đào tạo doanh nghiệp. Hãy xây dựng một syllabus chi tiết cho khóa học sau:
  - Tên khóa học: ${input.courseName}
  - Mục tiêu mong muốn: ${input.goals || 'Chưa cung cấp'}
  - Đối tượng học viên: ${input.targetAudience || 'Chưa cung cấp'}
  - Thời lượng: ${durationText}
  - Các yêu cầu khác: ${input.requirements || 'N/A'}

  Yêu cầu về nội dung:
  1. Giới thiệu chung, Mục tiêu, Đối tượng, Thời lượng cần rõ ràng, chuyên nghiệp.
  2. Phần nội dung chi tiết:
     - Phân bổ theo từng giờ học (hour).
     - Mỗi giờ có tiêu đề chủ đề (topic), mục tiêu cụ thể (objective).
     - Phần nội dung (content) phải ở dạng gạch đầu dòng, từ 3-5 ý nhỏ mỗi mục.
     - Có 1 bài tập minh họa (exercise) phù hợp với đối tượng học viên và ngành nghề.
  3. Cung cấp danh sách các khóa học liên quan trên mạng (tầm 3-5 khóa), cả miễn phí và trả phí.
  4. Nếu thông tin mục tiêu/ngành nghề thiếu, hãy mặc định theo tiêu chuẩn phổ biến của khóa học đó.
  
  Ngôn ngữ trả về: Tiếng Việt.`;

  if (previousSyllabus && adjustment) {
    prompt += `\n\nDựa trên syllabus cũ: ${JSON.stringify(previousSyllabus)}\nHãy điều chỉnh theo yêu cầu sau: ${adjustment}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: syllabusSchema,
    },
  });

  return JSON.parse(response.text || "{}") as Syllabus;
}
