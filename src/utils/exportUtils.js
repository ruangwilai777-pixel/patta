import { getLocalDate } from './dateUtils';

export const exportToCSV = (trips) => {
    if (trips.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    const headers = ['วันที่', 'สายงาน', 'ค่าเที่ยว (+)', 'ค่าน้ำมัน (-)', 'ค่าซ่อมบำรุง (-)', 'ค่าจ้างคนขับ (-)', 'รายได้ตะกร้า (+)', 'ยอดเบิกทั้งหมด (ลูกน้อง)', 'กำไรสุทธิ'];

    const rows = trips.map(trip => [
        trip.date,
        trip.route,
        trip.price,
        trip.fuel,
        trip.maintenance || 0,
        trip.wage || 0,
        trip.basket || 0,
        trip.staffShare || 0,
        Math.round(trip.profit)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `logistics-fleet-${getLocalDate()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
