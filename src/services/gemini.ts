import { GoogleGenAI, Type } from "@google/genai";
import { Syllabus, SyllabusInput, ThemeConfig, SlideContent, DetailedLecture, OverviewSlides } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ARCHITECT_INSTRUCTION = `Bạn là một AI Training Architect & Instructional Designer cấp cao. 
Bạn chuyên thiết kế chương trình đào tạo CNTT và Chuyển đổi số. 
Phong cách làm việc của bạn là chuyên nghiệp, logic, sư phạm và truyền cảm hứng.
Bạn luôn tuân thủ các quy tắc về cấu trúc bài giảng và thẩm mỹ thiết kế.`;

const syllabusSchema = {
  type: Type.OBJECT,
  properties: {
    introduction: { type: Type.STRING, description: "General introduction of the course" },
    goals: { type: Type.STRING, description: "Learning objectives of the course" },
    targetAudience: { type: Type.STRING, description: "Intended learners" },
    duration: { type: Type.STRING, description: "Course duration" },
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
            items: { type: Type.STRING }
          },
          exercise: { type: Type.STRING }
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

const detailedLectureSchema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    hour: { type: Type.STRING },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["intro", "theory", "practice", "exercise", "summary"] },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          speakerNotes: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["title", "type", "bullets", "speakerNotes", "imagePrompt"]
      }
    },
    pythonPptxCode: { type: Type.STRING, description: "Python code to generate this PPTX using python-pptx" }
  },
  required: ["topic", "hour", "slides", "pythonPptxCode"]
};

const themeSchema = {
  type: Type.OBJECT,
  properties: {
    primaryColor: { type: Type.STRING },
    secondaryColor: { type: Type.STRING },
    accentColor: { type: Type.STRING },
    textColor: { type: Type.STRING },
    backgroundColor: { type: Type.STRING },
    fontStyle: { type: Type.STRING, enum: ["modern", "classic", "minimalist"] }
  },
  required: ["primaryColor", "secondaryColor", "accentColor", "textColor", "backgroundColor", "fontStyle"]
};

const overviewSlidesSchema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING }
        },
        required: ["id", "title", "points", "imagePrompt"]
      }
    },
    pythonPptxCode: { type: Type.STRING }
  },
  required: ["slides", "pythonPptxCode"]
};

/**
 * Helper to wrap Gemini calls with error handling for quota and safety.
 */
async function safeAiCall<T>(call: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    console.error(`Gemini API Error (${errorMessage}):`, error);
    
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
    
    // Check for quota error (429)
    if (errorStr.includes("429") || error?.status === 429 || errorStr.toLowerCase().includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(`QUOTA_EXHAUSTED: Hệ thống đang tạm thời hết lượt sử dụng miễn phí (Quota 429). Vui lòng thử lại sau giây lát hoặc giảm bớt yêu cầu.`);
    }
    
    // Check for safety filter
    if (errorStr.includes("SAFETY")) {
      throw new Error("Nội dung yêu cầu bị bộ lọc an toàn của AI từ chối. Vui lòng điều chỉnh lại yêu cầu.");
    }

    throw new Error(`${errorMessage}: ${error.message || "Lỗi không xác định"}`);
  }
}

export async function generateSyllabus(input: SyllabusInput, previousSyllabus?: Syllabus, adjustment?: string): Promise<Syllabus> {
  const durationText = input.duration ? input.duration : "16 giờ (2 ngày) - khóa cơ bản overview";
  
  let prompt = `${ARCHITECT_INSTRUCTION}
  Hãy xây dựng một syllabus chi tiết cho khóa học sau:
  - Tên khóa học: ${input.courseName}
  - Mục tiêu mong muốn: ${input.goals || 'Chưa cung cấp'}
  - Đối tượng học viên: ${input.targetAudience || 'Chưa cung cấp'}
  - Thời lượng: ${durationText}
  - Các yêu cầu khác: ${input.requirements || 'N/A'}

  Yêu cầu về nội dung (Giai đoạn 1):
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

  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: syllabusSchema,
      },
    });
    return JSON.parse(response.text || "{}") as Syllabus;
  }, "Lỗi khi tạo Syllabus");
}

export async function generateDetailedLecture(syllabus: Syllabus, selectedHour: string): Promise<DetailedLecture> {
  const targetTopic = syllabus.detailedContent.find(c => c.hour === selectedHour);
  
  const prompt = `${ARCHITECT_INSTRUCTION}
  Hãy triển khai CHI TIẾT bài giảng (Giai đoạn 3) cho nội dung giờ học: "${targetTopic?.topic}" (${selectedHour}).
  
  Cấu trúc yêu cầu (12-15 slide):
  - Slide 1: Review/Tóm tắt nội dung giờ học trước.
  - Slide 2-4: Lý thuyết (30% thời lượng).
  - Slide 5-10: Hướng dẫn từng bước thực hành (40% thời lượng) - Phải chi tiết, logic.
  - Slide 11: Bài tập thực hành (10% thời lượng).
  - Slide 12: Tóm tắt và Gợi mở nội dung giờ học tiếp theo.
  
  Yêu cầu sản phẩm:
  1. Với mỗi slide: Tiêu đề, Loại slide (intro/theory/practice/exercise/summary), Bullet points nội dung, Speaker Notes chi tiết (hướng dẫn diễn thuyết), và Image Prompt mô tả hình ảnh.
  2. Mã Python (pythonPptxCode): Viết đoạn mã sử dụng thư viện 'python-pptx' để tạo cấu trúc file PowerPoint này. Mã phải hoàn chỉnh để người dùng copy và chạy được.
  
  Ngữ cảnh Syllabus: ${JSON.stringify(syllabus)}
  Hãy tập trung sâu vào chủ đề "${targetTopic?.topic}".`;

  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: detailedLectureSchema,
      },
    });
    return JSON.parse(response.text || "{}") as DetailedLecture;
  }, "Lỗi khi tạo Nội dung chi tiết");
}

export async function analyzeLogo(logoBase64: string): Promise<ThemeConfig> {
  const [mime, data] = logoBase64.split(",");
  const mimeType = mime.split(":")[1].split(";")[0];

  const prompt = "Phân tích logo này và đề xuất một bảng màu chuyên nghiệp (HEX) cho Slide thuyết trình. Phân tích phong cách thương hiệu (modern, classic, hoặc minimalist). Trả về mã màu cho primary, secondary, accent, text và background theo logo. Nếu logo có ít màu, hãy tự đề xuất thêm các màu harmonized phù hợp.";

  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: themeSchema,
      },
    });
    return JSON.parse(response.text || "{}") as ThemeConfig;
  }, "Lỗi khi phân tích Logo");
}

export async function generateSlidesFromSyllabus(syllabus: Syllabus): Promise<OverviewSlides> {
  const prompt = `${ARCHITECT_INSTRUCTION}
  Dựa trên syllabus sau, hãy thiết kế các slide bài giảng TỔNG QUAN (Giai đoạn 2). 
  
  Yêu cầu:
  1. Mỗi mục trong 'detailedContent' hãy tạo thành 1 slide.
  2. Mỗi slide gồm tiêu đề, 3-7 ý chính rút gọn từ nội dung chi tiết.
  3. Đề xuất một 'imagePrompt' mô tả hình ảnh minh họa cho slide đó.
  4. Mã Python (pythonPptxCode): Viết đoạn mã sử dụng 'python-pptx' để tạo file PowerPoint tổng quan này.
  
  Syllabus: ${JSON.stringify(syllabus)}
  Ngôn ngữ slide: Tiếng Việt.`;

  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: overviewSlidesSchema,
      },
    });
    return JSON.parse(response.text || "{}") as OverviewSlides;
  }, "Lỗi khi tạo Slide tổng quan");
}

export async function generateSlideImage(prompt: string): Promise<string> {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `${prompt}, professional presentation slide style, high quality, corporate aesthetic.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) return "";

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  }, "Lỗi khi tạo ảnh slide");
}
