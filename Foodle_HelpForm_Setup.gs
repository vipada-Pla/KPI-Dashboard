/**
 * Foodle Noodle – สร้าง Google Form "แจ้งการช่วยเพื่อน (Empathy)" + Google Sheet เก็บคำตอบ อัตโนมัติ
 *
 * วิธีใช้ (ทำครั้งเดียว ประมาณ 3 นาที):
 * 1) เปิด https://script.google.com ด้วยบัญชี Google ของบริษัท → กด "โปรเจ็กต์ใหม่"
 * 2) ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดในไฟล์นี้ทั้งหมด → กดบันทึก (ไอคอนแผ่นดิสก์)
 * 3) เลือกฟังก์ชัน createFoodleHelpForm ด้านบน → กด "เรียกใช้" (Run)
 * 4) ครั้งแรก Google จะขอสิทธิ์ → เลือกบัญชี → "ขั้นสูง" → "ไปที่โปรเจ็กต์ (ไม่ปลอดภัย)" → อนุญาต
 *    (ขึ้นคำเตือนเพราะเป็นสคริปต์ที่เราสร้างเอง ไม่ใช่แอปจาก Store)
 * 5) ดูลิงก์ใน "บันทึกการดำเนินการ" (Execution log) ด้านล่าง:
 *    - ลิงก์ฟอร์มสำหรับพนักงาน → ส่งเข้า LINE กลุ่ม / ทำ QR ติดหน้าไลน์ผลิต
 *    - ลิงก์ชีตคำตอบ → ส่งให้ Claude เพื่อเชื่อมเข้าแอป KPI & Empathy
 */

const DEPTS = [
  'วางแผน/ผลิต', 'QA/QC', 'คลังสินค้า', 'วิศวกรรม/ซ่อมบำรุง', 'ซัพพลายเชน/จัดซื้อ',
  'ฝ่ายขาย/แอดมินขาย', 'R&D', 'HR', 'บัญชี'
];
const HELP_TYPES = [
  'ช่วยงานในแผนก',
  'ช่วยงานข้ามแผนก',
  'ช่วยแก้ปัญหาด่วน/คุณภาพ/ความปลอดภัย'
];

function createFoodleHelpForm() {
  const form = FormApp.create('แจ้งการช่วยเพื่อน (Empathy) – Foodle Noodle');
  form.setDescription(
    'ใช้แจ้งเมื่อเพื่อนร่วมงานช่วยคุณทำงาน เพื่อให้เพื่อนได้คะแนน Empathy\n' +
    '• ผู้ได้รับการช่วยเป็นคนกรอก (ห้ามกรอกให้ตัวเอง)\n' +
    '• หัวหน้าของเพื่อนที่ช่วยจะตรวจและยืนยันภายใน 7 วัน\n' +
    '• เขียนเฉพาะเรื่องงาน ไม่ใส่เรื่องส่วนตัว สุขภาพ หรือเงินเดือน'
  );
  form.setProgressBar(false);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage('ขอบคุณที่แจ้งค่ะ หัวหน้าจะตรวจและยืนยันภายใน 7 วัน');
  try { form.setRequireLogin(false); } catch (e) { /* บัญชี Google ทั่วไปไม่ต้องตั้งค่านี้ */ }

  form.addTextItem().setTitle('ชื่อของคุณ (ผู้ได้รับการช่วย)').setHelpText('ชื่อ-ชื่อเล่น').setRequired(true);
  form.addListItem().setTitle('แผนกของคุณ').setChoiceValues(DEPTS).setRequired(true);
  form.addTextItem().setTitle('เพื่อนที่ช่วยคุณ').setHelpText('ชื่อ-ชื่อเล่น ของเพื่อนที่ช่วย').setRequired(true);
  form.addListItem().setTitle('แผนกของเพื่อนที่ช่วย').setChoiceValues(DEPTS).setRequired(true);
  form.addDateItem().setTitle('วันที่ได้รับการช่วย').setRequired(true);
  form.addMultipleChoiceItem().setTitle('ประเภทการช่วย').setChoiceValues(HELP_TYPES).setRequired(true);
  form.addParagraphTextItem().setTitle('เพื่อนช่วยเรื่องอะไร')
    .setHelpText('เช่น ช่วยนับสต็อกบรรจุภัณฑ์ก่อนตรวจรับ, สอนตั้งเครื่องนึ่ง')
    .setRequired(true);

  const ss = SpreadsheetApp.create('แจ้งการช่วยเพื่อน (Empathy) – คำตอบ');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('ลิงก์ฟอร์มสำหรับพนักงาน: ' + form.getPublishedUrl());
  Logger.log('ลิงก์แก้ไขฟอร์ม (เฉพาะผู้ดูแล): ' + form.getEditUrl());
  Logger.log('ลิงก์ชีตคำตอบ (ส่งให้ Claude): ' + ss.getUrl());
}
