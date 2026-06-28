import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfBase64, mimeType, routePresets, drivers } = req.body || {};

  if (!pdfBase64) {
    return res.status(400).json({ error: 'Missing pdfBase64 in request body' });
  }

  // Use backend env variable GEMINI_API_KEY.
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const filePart = {
      inlineData: {
        data: pdfBase64,
        mimeType: mimeType || 'application/pdf'
      }
    };

    const prompt = `
คุณเป็นผู้เชี่ยวชาญการตรวจเอกสารบัญชีและการขนส่งของไทย
นี่คือเอกสาร PDF หรือรูปภาพใบแจ้งยอดค่าขนส่งสินค้าของคนขับรถ กรุณาแกะข้อมูลรายการวิ่งออกมาทั้งหมด และวิเคราะห์หา เดือน และ ปี ของเอกสารนี้ด้วย

**กฎทางธุรกิจที่สำคัญในการคัดกรองเงิน (Business Rules):**
1. รายการที่มีจำนวนเงินเป็น 300, 600 หรือ 1000 บาท คือ "ค่าตะกร้า" (Basket Fee) ให้คัดออก ไม่รวมในผลลัพธ์
2. รายการที่มีจำนวนเงินอื่น ๆ ทั้งหมด (ที่ไม่ใช่ 300, 600, 1000) คือ "ค่าเที่ยว" (Trip Fare) ของงานวิ่งนั้น ๆ ให้ดึงข้อมูล วันที่ (date), เส้นทาง (route), และ ราคา (price) ออกมา

**การจับคู่เส้นทาง (Route Mapping):**
กรุณาเปรียบเทียบชื่อเส้นทาง/สายงานที่เขียนในเอกสาร กับรายชื่อเส้นทางจริงในระบบดังต่อไปนี้ เพื่อระบุค่า "route" ให้ตรงกับในระบบของเรามากที่สุด (หากในเอกสารเขียนสายงานและไม่มีตรงเป๊ะ ให้พยายามดึงรหัสสายงาน เช่น 510, 514 ออกมา):
${JSON.stringify(routePresets || [])}

**การจับคู่พนักงานขับรถ (Driver Mapping):**
กรุณาตรวจสอบว่าในแต่ละเที่ยววิ่งระบุเลขทะเบียนรถหรือชื่อคนขับเป็นใคร แล้วนำไปจับคู่เปรียบเทียบกับรายชื่อพนักงานขับรถในระบบเราด้านล่างนี้ เพื่อระบุค่า "driver" ให้ตรงกับชื่อระบบของเรามากที่สุด (หากไม่มีข้อมูลทะเบียน/ชื่อให้ระบุ หรือไม่สามารถระบุได้ ให้ใส่เป็นค่าว่างหรือไม่ระบุ):
${JSON.stringify(drivers || [])}

**การวิเคราะห์งวดเดือนและปี (Date Detection):**
กรุณาค้นหาว่างวดบัญชีหรือวันที่ของเอกสารนี้ เป็น เดือน อะไร และ ปี อะไร:
- detectedMonth: ให้ระบุเป็นตัวเลข 0 ถึง 11 (0 = มกราคม, 11 = ธันวาคม)
- detectedYear: ให้ระบุเป็นปี ค.ศ. คริสต์ศักราช 4 หลัก (เช่น 2026) หากในเอกสารเป็น พ.ศ. (เช่น 2569) ให้ลบด้วย 543 เพื่อแปลงเป็น ค.ศ.

**รูปแบบวันที่ของเที่ยววิ่ง (YYYY-MM-DD):**
สำหรับแต่ละรายการวิ่งที่ตรวจพบ ให้แปลงวันที่ให้อยู่ในรูปแบบ YYYY-MM-DD (เช่น หากอยู่ในรอบเดือน มิถุนายน 2569 และวันที่เขียนว่า "20" หรือ "20 มิ.ย." ให้เป็น "2026-06-20"):
- ตรวจสอบให้แน่ใจว่าวันและเดือนสอดคล้องกับงวดปฏิทินจริงของวันวิ่งนั้น ๆ

**ผลลัพธ์ที่ต้องการ:**
กรุณาส่งกลับผลลัพธ์เป็น JSON ในรูปแบบนี้เท่านั้น:
{
  "trips": [
    {
      "date": "2026-06-20",
      "route": "ชื่อสายงานที่ได้จากการดึงข้อมูลหรือจับคู่",
      "price": 5016,
      "driver": "ชื่อพนักงานขับรถที่ตรงกับระบบเรา (เช่น สมชาย)"
    }
  ],
  "detectedMonth": 5, 
  "detectedYear": 2026
}
`;

    const result = await model.generateContent([filePart, prompt]);
    const responseText = result.response.text();
    
    // Parse to ensure it is valid JSON before sending back
    const parsedData = JSON.parse(responseText);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error during Gemini API parsing:', error);
    return res.status(500).json({ error: error.message || 'Error processing AI parsing' });
  }
}
