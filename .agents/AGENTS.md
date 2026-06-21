# คำสั่งสำหรับ AI / Instructions for future AI Agents

## [ภาษาไทย / Thai]
⚠️ **ข้อบังคับวิกฤต (CRITICAL RULES) - ห้ามละเมิดเด็ดขาด:**
1. **ห้ามทำการ Build หรือ Compile ใหม่**: ห้ามรันคำสั่ง `npm run build` หรือ `vite build` เพราะจะทำให้ไฟล์ระบบหลักเสียหาย
2. **ห้ามเปลี่ยนไฟล์ระบบหลัก**: โครงการนี้ทำงานผ่านไฟล์สำเร็จรูป (Pre-compiled Bundle) ต่อไปนี้เท่านั้น:
   - `/public/assets/main-Dcs-rvvl.js` (ไฟล์ JavaScript หลัก)
   - `/public/assets/main-gNL91H-p.css` (ไฟล์ CSS หลัก)
3. **ห้ามสร้างไฟล์ HTML หรือลิงก์ Bundle ใหม่**: ห้ามนำเข้าไฟล์ JS หรือ CSS ของเวอร์ชันอื่นเข้ามาในระบบ
4. **การแก้ไข UI/Style หรือแก้ไขพฤติกรรมหน้าจอ**:
   - ต้องทำผ่าน **CSS/JS Injection ในไฟล์ `index.html` และ `public/index.html` เท่านั้น** (ทั้งสองไฟล์ต้องแก้ไขให้ตรงกันเสมอ)
   - ค้นหาบล็อกสคริปต์ `DOM Patch` หรือ `DOM Patch V9` บริเวณด้านล่างของไฟล์เพื่อเพิ่มหรือปรับปรุงโค้ด CSS/JS ตรงนั้น

---

## [English]
⚠️ **CRITICAL DIRECTIVES - DO NOT VIOLATE:**
1. **DO NOT RUN BUILD COMMANDS**: Never run `npm run build` or `vite build`. This project uses a static pre-compiled bundle.
2. **DO NOT CHANGE THE REFERENCE BUNDLE**: The application must only load these exact files:
   - `/public/assets/main-Dcs-rvvl.js`
   - `/public/assets/main-gNL91H-p.css`
3. **DO NOT CREATE NEW VERSIONS OR BUNDLES**: Do not inject or add other JavaScript or CSS bundle files to the index page.
4. **HOW TO CUSTOMIZE UI / BEHAVIOR**:
   - Any layout modifications, UI fixes, or CSS styling must be injected directly into `index.html` and `public/index.html` (keep both in sync).
   - Find the `<script>` tag near `</body>` containing `DOM Patch` (or `DOM Patch V9`) and write your custom CSS/JS patches inside it.
