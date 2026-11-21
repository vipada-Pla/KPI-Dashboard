# Data model

## Datasets

| id | ชนิด | ที่มา |
|---|---|---|
| `kpi` | ไฟล์ CSV | คะแนน KPI ม.ค.–ต.ค. 2026 (month, month_no, dept, kpi_id, kpi, target, weight, score, status, note) |
| `sales` | ไฟล์ CSV | ยอดขายรายเดือน (month, month_no, actual_baht, target_baht) |
| `kpi_store` | store `data/team/kpi_entries` | คะแนนที่กรอกในแอป — doc id `2026-MM_Kxx` |
| `kpi_audit` | store `data/team/kpi_audit` | ประวัติการส่ง/อนุมัติ/ส่งกลับ |
| `help_store` | store `data/team/help_log` | บันทึกช่วยเพื่อน |

## Calcs

- `kpi_all` = `kpi` + รายการ `kpi_store` ที่ `state = อนุมัติ` (แทนที่เดือน+KPI เดียวกัน)
- `dept_month`, `company_month`, `headline`, `below`, `missing` คำนวณจาก `kpi_all`
- `empathy`, `help_stats` จาก `help_store` · `kpi_entry_stats` จาก `kpi_store`

## kpi_entries (1 doc ต่อ เดือน×KPI)
`month_no, month, kpi_id, dept, kpi, score, status_kpi, note, state (รอ HR ตรวจ | อนุมัติ | ส่งกลับ), submitted_by, submitted_name, submitted_at, reviewed_by, reviewed_name, reviewed_at, review_note`

## help_log
`date, month, helper, helper_dept, receiver, receiver_dept, help_type, detail, status (รอยืนยัน | ยืนยัน | ไม่อนุมัติ), recorded_by, recorded_name, recorded_at, confirmed_by, confirmed_name, confirmed_at`

## สิทธิ์
ทุกคนที่เปิดแอปอ่านได้ · เฉพาะ Editor เขียน `data/team/*` · ผู้ส่ง/ผู้บันทึกอนุมัติรายการของตัวเองไม่ได้ (บังคับที่หน้าแอป)
