import React from 'react';

const DriverTripLog = ({ trips, currentMonth, currentYear, driverName, isDriverCopy = false }) => {
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    const logData = React.useMemo(() => {
        const startDate = new Date(currentYear, currentMonth - 1, 20);
        const endDate = new Date(currentYear, currentMonth, 19);

        const days = [];
        let curr = new Date(startDate);

        while (curr <= endDate) {
            const year = curr.getFullYear();
            const month = String(curr.getMonth() + 1).padStart(2, '0');
            const day = String(curr.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const dayTrips = trips.filter(t => t.date === dateStr);

            days.push({
                date: new Date(curr),
                dateStr,
                dayNum: curr.getDate(),
                dayLabel: dayNames[curr.getDay()],
                monthLabel: monthNames[curr.getMonth()],
                trips: dayTrips
            });
            curr.setDate(curr.getDate() + 1);
        }
        return days;
    }, [trips, currentMonth, currentYear]);

    // Reliable Split: Look for where the month actualy changes in our sequential dates
    const transitionIndex = logData.findIndex((d, i) => i > 0 && d.date.getMonth() !== logData[i - 1].date.getMonth());

    // Fallback if no transition
    const part1 = transitionIndex !== -1 ? logData.slice(0, transitionIndex) : logData;
    const part2 = transitionIndex !== -1 ? logData.slice(transitionIndex) : [];

    const renderTable = (data, title) => {
        const totalWage = data.reduce((sum, day) => {
            return sum + day.trips.reduce((s, t) => s + (isDriverCopy ? (t.wage || 0) : (t.price || 0)), 0);
        }, 0);

        const totalBasket = data.reduce((sum, day) => {
            return sum + day.trips.reduce((s, t) => s + (isDriverCopy ? (t.basketShare || 0) : (t.basket || 0)), 0);
        }, 0);

        return (
            <div className="trip-log-table-container" style={{ flex: 1, minWidth: '280px', width: '100%' }}>
                <div className="table-title-header" style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    padding: '10px',
                    border: '1px solid var(--glass-border)',
                    borderBottom: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    borderRadius: '12px 12px 0 0',
                }}>
                    {title}
                </div>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid var(--glass-border)',
                    fontSize: '13px',
                }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-main)' }}>
                            <th style={{ border: '1px solid var(--glass-border)', padding: '10px 4px', width: '35px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ที่</th>
                            <th style={{ border: '1px solid var(--glass-border)', padding: '10px 4px', width: '45px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>วัน</th>
                            <th style={{ border: '1px solid var(--glass-border)', padding: '10px 8px', fontWeight: '700', textAlign: 'left', color: 'var(--text-dim)', textTransform: 'uppercase' }}>สายวิ่ง</th>
                            <th style={{ border: '1px solid var(--glass-border)', padding: '10px 8px', width: '85px', fontWeight: '700', textAlign: 'right', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ค่าเที่ยว</th>
                            <th style={{ border: '1px solid var(--glass-border)', padding: '10px 8px', width: '85px', fontWeight: '700', textAlign: 'right', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ตะกร้า</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((day, idx) => {
                            return (
                                <React.Fragment key={day.dateStr}>
                                    {day.trips.length === 0 ? (
                                        <tr style={{ background: 'transparent' }}>
                                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'center', fontWeight: '700', color: 'var(--text-main)', padding: '8px 4px' }}>{day.dayNum}</td>
                                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-dim)', padding: '8px 4px' }}>{day.dayLabel}</td>
                                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'center', color: 'rgba(255, 255, 255, 0.15)', padding: '8px 8px' }}>-</td>
                                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', color: 'rgba(255, 255, 255, 0.15)', padding: '8px 8px' }}>-</td>
                                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', color: 'rgba(255, 255, 255, 0.15)', padding: '8px 8px' }}>-</td>
                                        </tr>
                                    ) : (
                                        day.trips.map((t, tIdx) => (
                                            <tr key={`${day.dateStr}-${t.id || tIdx}`} style={{ background: 'transparent' }}>
                                                {tIdx === 0 ? (
                                                    <>
                                                        <td rowSpan={day.trips.length} style={{ border: '1px solid var(--glass-border)', textAlign: 'center', fontWeight: '700', color: 'var(--text-main)', padding: '8px 4px' }}>{day.dayNum}</td>
                                                        <td rowSpan={day.trips.length} style={{ border: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-dim)', padding: '8px 4px' }}>{day.dayLabel}</td>
                                                    </>
                                                ) : null}
                                                <td style={{ border: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-main)', padding: '8px 8px' }}>{t.route}</td>
                                                <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', color: 'var(--text-main)', fontWeight: '700', padding: '8px 8px' }}>
                                                    {isDriverCopy ? (parseFloat(t.wage || 0)).toLocaleString() : (parseFloat(t.price || 0)).toLocaleString()}
                                                </td>
                                                <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', color: 'var(--text-main)', fontWeight: '700', padding: '8px 8px' }}>
                                                    {isDriverCopy ? (parseFloat(t.basketShare || 0)).toLocaleString() : (parseFloat(t.basket || 0)).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', fontWeight: '700' }}>
                            <td colSpan={3} style={{ border: '1px solid var(--glass-border)', textAlign: 'right', padding: '10px 8px', color: 'var(--text-main)' }}>รวม:</td>
                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', padding: '10px 8px', color: 'var(--primary)', fontSize: '14px' }}>{totalWage.toLocaleString()}</td>
                            <td style={{ border: '1px solid var(--glass-border)', textAlign: 'right', padding: '10px 8px', color: 'var(--safe)', fontSize: '14px' }}>{totalBasket.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    const prevMonthIdx = (currentMonth - 1 + 12) % 12;
    const currMonthIdx = currentMonth;

    return (
        <div className="trip-log-card glass-card" style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '2rem',
            color: 'var(--text-main)',
            fontFamily: "'Outfit', 'Chakra Petch', 'Sarabun', sans-serif",
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🗓️ ตารางลงงานรายวัน: {driverName}
                </h2>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    รอบประจำเดือน {monthNames[currMonthIdx]} {currentYear + 543}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
                {part1.length > 0 && renderTable(part1, `ช่วงวันที่ 20 - ${part1[part1.length - 1]?.dayNum} ${monthNames[prevMonthIdx]}`)}
                {part2.length > 0 && renderTable(part2, `ช่วงวันที่ 1 - 19 ${monthNames[currMonthIdx]}`)}
            </div>

            {/* GRAND TOTAL SUMMARY AT BOTTOM */}
            <div className="grand-total-container" style={{ marginTop: '30px', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.4)' }}>
                <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '16px', marginBottom: '15px', textDecoration: 'underline', color: 'var(--text-main)' }}>
                    สรุปยอดรวมสุทธิประจำรอบบิล
                </div>
                <div className="total-summary-grid" style={{ display: 'flex', justifyContent: 'space-around', gap: '15px', flexWrap: 'wrap' }}>
                    {(() => {
                        const grandTotalWage = trips.reduce((sum, t) => sum + (isDriverCopy ? (t.wage || 0) : (t.price || 0)), 0);
                        const grandTotalBasket = trips.reduce((sum, t) => sum + (isDriverCopy ? (t.basketShare || 0) : (t.basket || 0)), 0);
                        const totalAll = grandTotalWage + grandTotalBasket;

                        return (
                            <>
                                <div className="total-box" style={{
                                    flex: '1 1 150px',
                                    textAlign: 'center',
                                    border: '1px solid var(--glass-border)',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
                                }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{isDriverCopy ? 'ค่าจ้าง' : 'ค่าเที่ยว'}</div>
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>฿{grandTotalWage.toLocaleString()}</div>
                                </div>
                                <div className="total-box" style={{
                                    flex: '1 1 150px',
                                    textAlign: 'center',
                                    border: '1px solid var(--glass-border)',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
                                }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{isDriverCopy ? 'แบ่งตะกร้า' : 'ค่าตะกร้า'}</div>
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--safe)' }}>฿{grandTotalBasket.toLocaleString()}</div>
                                </div>
                                <div className="total-box highlight" style={{
                                    flex: '1 1 100%',
                                    textAlign: 'center',
                                    border: 'none',
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px rgba(148, 163, 255, 0.25)'
                                }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>รวมยอดสุทธิทั้งสิ้น</div>
                                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>฿{totalAll.toLocaleString()}</div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media screen and (max-width: 600px) {
                    .trip-log-card { padding: 0.75rem !important; border-radius: 1rem !important; }
                    .trip-log-table-container { min-width: 100% !important; }
                    table { font-size: 11px !important; }
                    th, td { padding: 4px 2px !important; }
                    .total-summary-grid { flex-direction: column !important; }
                    .total-box { flex: 1 1 auto !important; width: 100% !important; }
                    h2 { font-size: 16px !important; }
                }
                @media print {
                    .trip-log-card { 
                        width: 100% !important; 
                        min-width: 0 !important; 
                        margin: 0 !important; 
                        box-shadow: none !important;
                        padding: 0 !important;
                        border: none !important;
                        background: white !important;
                        color: black !important;
                    }
                    button { display: none !important; }
                    .table-title-header { background: #f8fafc !important; color: #1e293b !important; border: 1px solid #cbd5e1 !important; }
                    table { border: 1px solid #cbd5e1 !important; }
                    thead tr { background: #f8fafc !important; color: #1e293b !important; }
                    th { border: 1px solid #cbd5e1 !important; color: #1e293b !important; }
                    tbody tr { background: white !important; color: black !important; }
                    td { border: 1px solid #cbd5e1 !important; color: black !important; }
                    tfoot tr { background: #f8fafc !important; color: #1e293b !important; }
                    .grand-total-container { border: 1px solid #cbd5e1 !important; background: #f8fafc !important; }
                    .total-box { background: white !important; border: 1px solid #cbd5e1 !important; color: black !important; }
                    .total-box.highlight { background: #1e293b !important; color: white !important; }
                }
            `}} />
        </div>
    );
};

export default DriverTripLog;
