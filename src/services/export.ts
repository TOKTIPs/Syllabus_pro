import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, PageOrientation } from "docx";
import { saveAs } from "file-saver";
import { Syllabus, DetailedLecture } from "../types";

// Margin conversion: 1cm ≈ 567 twips
const MARGIN_3CM = 1701;
const MARGIN_1_5CM = 851;
const MARGIN_2CM = 1134;

export async function exportToDocx(syllabus: Syllabus, courseName: string) {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906, // A4 width in twips
            height: 16838, // A4 height in twips
            orientation: PageOrientation.PORTRAIT,
          },
          margin: {
            top: MARGIN_2CM,
            right: MARGIN_1_5CM,
            bottom: MARGIN_2CM,
            left: MARGIN_3CM,
          },
        },
      },
      children: [
        new Paragraph({
          text: courseName.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 480, line: 360 }, // 1.5 line spacing
        }),
        
        new Paragraph({ 
          children: [new TextRun({ text: "1. Giới thiệu chung", bold: true })], 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 240, after: 120, line: 360 } 
        }),
        new Paragraph({ text: syllabus.introduction, spacing: { line: 360 } }),

        new Paragraph({ 
          children: [new TextRun({ text: "2. Mục tiêu", bold: true })], 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 240, after: 120, line: 360 } 
        }),
        new Paragraph({ text: syllabus.goals, spacing: { line: 360 } }),

        new Paragraph({ 
          children: [new TextRun({ text: "3. Đối tượng học viên", bold: true })], 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 240, after: 120, line: 360 } 
        }),
        new Paragraph({ text: syllabus.targetAudience, spacing: { line: 360 } }),

        new Paragraph({ 
          children: [new TextRun({ text: "4. Thời lượng", bold: true })], 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 240, after: 120, line: 360 } 
        }),
        new Paragraph({ text: syllabus.duration, spacing: { line: 360 } }),

        new Paragraph({ 
          children: [new TextRun({ text: "5. Nội dung chi tiết", bold: true })], 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 240, after: 240, line: 360 } 
        }),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ 
                  width: { size: 10, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Giờ", bold: true })], alignment: AlignmentType.CENTER })] 
                }),
                new TableCell({ 
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Chủ đề", bold: true })] })] 
                }),
                new TableCell({ 
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Nội dung chính", bold: true })] })] 
                }),
                new TableCell({ 
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Mục tiêu & Bài tập", bold: true })] })] 
                }),
              ],
            }),
            ...syllabus.detailedContent.map(item => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: item.hour, alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.topic, bold: true })] })] }),
                new TableCell({ 
                  children: [
                    ...item.content.map(c => new Paragraph({ text: `• ${c}`, spacing: { line: 360 } }))
                  ] 
                }),
                new TableCell({ 
                  children: [
                    new Paragraph({ children: [new TextRun({ text: `Mục tiêu:`, bold: true }), new TextRun({ text: ` ${item.objective}` })], spacing: { after: 120, line: 360 } }),
                    new Paragraph({ children: [new TextRun({ text: `Bài tập:`, bold: true }), new TextRun({ text: ` ${item.exercise}`, italics: true })], spacing: { line: 360 } })
                  ] 
                }),
              ]
            }))
          ]
        }),
      ],
    }],
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 26, // 13pt
          }
        }
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 36, bold: true, font: "Times New Roman" },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Times New Roman" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      ]
    }
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${courseName}_Syllabus.docx`);
}

export function exportToMarkdown(syllabus: Syllabus, courseName: string) {
  const content = `# ${courseName.toUpperCase()}

## 1. Giới thiệu chung
${syllabus.introduction}

## 2. Mục tiêu
${syllabus.goals}

## 3. Đối tượng học viên
${syllabus.targetAudience}

## 4. Thời lượng
${syllabus.duration}

## 5. Nội dung chi tiết

| Giờ | Chủ đề | Nội dung chính | Mục tiêu & Bài tập |
| :--- | :--- | :--- | :--- |
${syllabus.detailedContent.map(item => {
  const contents = item.content.map(c => `- ${c}`).join('<br>');
  const goalsAndExercise = `**Mục tiêu:** ${item.objective}<br>**Bài tập:** *${item.exercise}*`;
  return `| ${item.hour} | **${item.topic}** | ${contents} | ${goalsAndExercise} |`;
}).join('\n')}

---
*Nội dung được tạo tự động bởi Syllabus Pro*
`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, `${courseName}_Syllabus.md`);
}

export async function exportDetailedLectureToDocx(lecture: DetailedLecture) {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: MARGIN_2CM, right: MARGIN_1_5CM, bottom: MARGIN_2CM, left: MARGIN_3CM },
        },
      },
      children: [
        new Paragraph({
          text: `CHI TIẾT BÀI GIẢNG: ${lecture.topic.toUpperCase()}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 480 },
        }),
        new Paragraph({ text: `Thời lượng dự kiến: ${lecture.hour}`, alignment: AlignmentType.CENTER, spacing: { after: 480 } }),

        ...lecture.slides.flatMap((slide, index) => [
          new Paragraph({ 
            children: [new TextRun({ text: `Slide ${index + 1}: ${slide.title}`, bold: true })], 
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({ 
            children: [new TextRun({ text: `Loại slide: ${slide.type.toUpperCase()}`, italics: true })], 
            spacing: { after: 120 } 
          }),
          ...slide.bullets.map(b => new Paragraph({ text: `• ${b}`, spacing: { line: 360 } })),
          new Paragraph({ 
            children: [new TextRun({ text: "Hướng dẫn diễn thuyết (Speaker Notes):", bold: true })],
            spacing: { before: 240, after: 120 }
          }),
          new Paragraph({ text: slide.speakerNotes, spacing: { after: 240, line: 360 } }),
          new Paragraph({ 
            children: [new TextRun({ text: "Gợi ý hình ảnh (Image Prompt):", bold: true, color: "666666" })],
            spacing: { after: 120 }
          }),
          new Paragraph({ text: slide.imagePrompt, spacing: { after: 400 } }),
        ]),

        new Paragraph({ 
          children: [new TextRun({ text: "MÃ PYTHON (PPTX GENERATION)", bold: true })], 
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({ text: lecture.pythonPptxCode, spacing: { line: 240 } }),
      ],
    }],
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 26 } } }
    }
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `Lecture_${lecture.topic}.docx`);
}

export function exportDetailedLectureToMarkdown(lecture: DetailedLecture) {
  const content = `# CHI TIẾT BÀI GIẢNG: ${lecture.topic}
**Thời lượng:** ${lecture.hour}

${lecture.slides.map((slide, index) => `
## Slide ${index + 1}: ${slide.title}
- **Loại:** ${slide.type}
- **Nội dung:**
${slide.bullets.map(b => `  - ${b}`).join('\n')}

**Speaker Notes:**
${slide.speakerNotes}

**Image Prompt:**
\`${slide.imagePrompt}\`
`).join('\n---\n')}

## Python PPTX Code
\`\`\`python
${lecture.pythonPptxCode}
\`\`\`

---
*Generated by Syllabus Pro AI Architect*
`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, `Lecture_${lecture.topic}.md`);
}
