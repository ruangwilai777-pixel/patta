import React from 'react';
import { X, Printer, ShoppingBasket, Truck, ReceiptText } from 'lucide-react';

const BillingSummary = ({ trips, currentMonth, currentYear, driverName = "นางสาว ภัทธา เรืองวิลัย", address = "เลขที่ 246 หมู่ 6 ต.เวียงตาล อ.ห้างฉัตร ลำปาง 52190", isDriverCopy = false, cnDeduction = 0 }) => {
    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    // Calculate display range: 20th of prev month to 19th of current
    const rangeDisplay = React.useMemo(() => {
        const prevMonth = (currentMonth - 1 + 12) % 12;
        return `20 ${monthNames[prevMonth]} - 19 ${monthNames[currentMonth]} ${currentYear}`;
    }, [currentMonth, currentYear, monthNames]);

    // Group trips by Route and Price (Separate Delivery Fee/Wage and Basket Fee/Share rows)
    const groupedData = React.useMemo(() => {
        const deliveryGroups = {};
        const basketGroups = {};

        trips.forEach(trip => {
            if (!trip.date) return;
            // Use actual month/year from trip date to separate groups by month
            const [y, m, d] = trip.date.split('-');

            // Determine values and labels based on copy type
            const deliveryVal = isDriverCopy ? parseFloat(trip.wage || 0) : parseFloat(trip.price || 0);
            const deliveryLabel = isDriverCopy ? 'ค่าจ้าง' : 'ค่าขนส่งสินค้า';

            const basketVal = isDriverCopy ? parseFloat(trip.basketShare || 0) : parseFloat(trip.basket || 0);
            const basketLabel = isDriverCopy ? 'ค่าส่วนแบ่งตะกร้า' : 'ค่าตะกร้าสินค้า';

            // Handle Delivery/Wage
            if (deliveryVal > 0) {
                const dKey = `DEL_${trip.route}_${deliveryVal}_${m}_${y}`;
                if (!deliveryGroups[dKey]) {
                    deliveryGroups[dKey] = {
                        route: trip.route,
                        type: deliveryLabel,
                        pricePerUnit: deliveryVal,
                        count: 0,
                        totalAmount: 0,
                        month: m,
                        year: y
                    };
                }
                deliveryGroups[dKey].count += 1;
                deliveryGroups[dKey].totalAmount += deliveryVal;
            }

            // Handle Basket/Share
            if (basketVal > 0) {
                const bKey = `BSK_${trip.route}_${basketVal}_${m}_${y}`;
                if (!basketGroups[bKey]) {
                    basketGroups[bKey] = {
                        route: trip.route,
                        type: basketLabel,
                        pricePerUnit: basketVal,
                        count: 0,
                        totalAmount: 0,
                        month: m,
                        year: y
                    };
                }
                basketGroups[bKey].count += 1;
                basketGroups[bKey].totalAmount += basketVal;
            }
        });

        return [...Object.values(deliveryGroups), ...Object.values(basketGroups)].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            if (a.month !== b.month) return a.month - b.month;
            if (a.route < b.route) return -1;
            if (a.route > b.route) return 1;
            return a.type.includes('ตะกร้า') ? 1 : -1;
        });
    }, [trips, isDriverCopy]);

    const deliveryData = groupedData.filter(item => !item.type.includes('ตะกร้า'));
    const basketData = groupedData.filter(item => item.type.includes('ตะกร้า'));

    const totalAllRevenue = groupedData.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
    const totalCount = groupedData.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);

    const housingAllowance = (isDriverCopy && trips.length > 0) ? 1000 : 0;
    const totalAdvance = isDriverCopy ? trips.reduce((sum, t) => sum + (parseFloat(t.staffShare) || 0), 0) : 0;
    const grandTotal = isDriverCopy ? (totalAllRevenue + housingAllowance) - (totalAdvance + (parseFloat(cnDeduction) || 0)) : totalAllRevenue;

    return (
        <div className="glass-card fade-in" style={{
            width: '50%', minWidth: '650px', margin: '1.5rem auto',
            display: 'flex', flexDirection: 'column', background: '#fff', color: '#000',
            borderRadius: '1.25rem', border: '1.5px solid #e2e8f0', // Thinner, softer border for premium look
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            fontFamily: "'Sarabun', sans-serif", overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '2px solid #000', background: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#000', padding: '8px', borderRadius: '8px' }}>
                        <ReceiptText size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.5px', color: '#000' }}>
                        {isDriverCopy ? 'ใบแจ้งยอด (สำหรับคนขับ)' : 'ใบวางบิล (สำหรับสำนักงาน)'}
                    </span>
                </div>
                <button className="btn" onClick={() => window.print()} style={{ background: '#000', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> พิมพ์เอกสาร
                </button>
            </div>

            <div className="print-area" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                {/* Header Info like the image */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '12px', color: '#000' }}>
                    <div style={{ border: '1.5px solid #e2e8f0', padding: '0.8rem 1.2rem', width: '60%', background: '#fff', borderRadius: '14px' }}>
                        <p style={{ margin: '2px 0' }}><strong>ชื่อ:</strong> <span style={{ fontSize: '13px', fontWeight: '700' }}>{driverName}</span></p>
                        <p style={{ margin: '2px 0' }}><strong>ที่อยู่:</strong> {address}</p>
                    </div>
                    <div style={{ border: '1.5px solid #e2e8f0', padding: '0.8rem 1.2rem', width: '35%', background: '#fff', borderRadius: '14px' }}>
                        <p style={{ margin: '2px 0' }}><strong>รอบวิ่งวันที่:</strong></p>
                        <p style={{ margin: '2px 0', fontWeight: '700', fontSize: '13px' }}>{rangeDisplay}</p>
                    </div>
                </div>

                {/* 1. DELIVERY / WAGE SECTION */}
                {deliveryData.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#000' }}>
                            <Truck size={20} />
                            <span style={{ fontWeight: '700', fontSize: '15px', textDecoration: 'underline' }}>{isDriverCopy ? 'รายละเอียดค่าจ้าง' : 'รายละเอียดค่าขนส่งสินค้า'}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '2px solid #000' }}>
                            <thead>
                                <tr style={{ background: '#f0f4f8', color: '#334155' }}>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '50px', fontSize: '13px', fontWeight: '700' }}>ลำดับ</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '90px', fontSize: '13px', fontWeight: '700' }}>เดือน/ปี</th>
                                    <th style={{ ...thStyle, padding: '12px 10px', border: '1px solid #cbd5e1', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>สายงาน</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '70px', fontSize: '13px', fontWeight: '700' }}>เที่ยว</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', textAlign: 'right', width: '100px', fontSize: '13px', fontWeight: '700' }}>ราคา/เที่ยว</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', textAlign: 'right', width: '115px', fontSize: '13px', fontWeight: '700' }}>เงินรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryData.map((item, idx) => (
                                    <tr key={idx} style={{ background: '#fff' }}>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', color: '#000', fontWeight: '700', border: '1px solid #cbd5e1' }}>{String(idx + 1).padStart(2, '0')}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                                            <span style={{ fontWeight: '500', fontSize: '13px', color: '#000' }}>{item.month}/{item.year}</span>
                                        </td>
                                        <td style={{ ...tdStyle, padding: '10px', fontWeight: '600', color: '#000', border: '1px solid #cbd5e1', fontSize: '15px' }}>{item.route}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '1rem', color: '#000', border: '1px solid #cbd5e1' }}>{item.count}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '500', color: '#000', border: '1px solid #cbd5e1', fontSize: '12px' }}>{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '600', fontSize: '1.15rem', color: '#000', border: '1px solid #cbd5e1' }}>{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. BASKET SECTION */}
                {basketData.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#000' }}>
                            <ShoppingBasket size={20} />
                            <span style={{ fontWeight: '700', fontSize: '15px', textDecoration: 'underline' }}>{isDriverCopy ? 'รายละเอียดค่าส่วนแบ่งตะกร้า' : 'รายละเอียดค่าตะกร้าสินค้า'}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '2px solid #000' }}>
                            <thead>
                                <tr style={{ background: '#f0f4f8', color: '#334155' }}>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '50px', fontSize: '13px', fontWeight: '700' }}>ลำดับ</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '90px', fontSize: '13px', fontWeight: '700' }}>เดือน/ปี</th>
                                    <th style={{ ...thStyle, padding: '12px 10px', border: '1px solid #cbd5e1', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>รายละเอียดตะกร้า</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', width: '70px', fontSize: '13px', fontWeight: '700' }}>จำนวน</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', textAlign: 'right', width: '100px', fontSize: '13px', fontWeight: '700' }}>ราคา/หน่วย</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid #cbd5e1', textAlign: 'right', width: '115px', fontSize: '13px', fontWeight: '700' }}>เงินรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {basketData.map((item, idx) => (
                                    <tr key={idx} style={{ background: '#fff' }}>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', color: '#000', fontWeight: '700', border: '1px solid #cbd5e1' }}>{String(idx + 1).padStart(2, '0')}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                                            <span style={{ fontWeight: '600', fontSize: '13px', color: '#000' }}>{item.month}/{item.year}</span>
                                        </td>
                                        <td style={{ ...tdStyle, padding: '10px', fontWeight: '600', color: '#000', border: '1px solid #cbd5e1', fontSize: '15px' }}>{item.route}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '1rem', color: '#000', border: '1px solid #cbd5e1' }}>{item.count}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '500', color: '#000', border: '1px solid #cbd5e1', fontSize: '12px' }}>{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '600', fontSize: '1.15rem', color: '#000', border: '1px solid #cbd5e1' }}>{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DEDUCTIONS & EXTRAS SECTION (DRIVER ONLY) */}
                {isDriverCopy && (
                    <div style={{ margin: '1rem 0', padding: '1rem', border: '2px solid #cbd5e1', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                            <span>🏠 ค่าเช่าบ้าน (Housing):</span>
                            <span style={{ color: '#059669' }}>+ ฿{housingAllowance.toLocaleString()}</span>
                        </div>
                        {totalAdvance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                <span>💸 หักเบิกเงินล่วงหน้า (Staff Advance):</span>
                                <span style={{ color: '#dc2626' }}>- ฿{totalAdvance.toLocaleString()}</span>
                            </div>
                        )}
                        {cnDeduction > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                <span>🔖 หักคืน (CN Deductions):</span>
                                <span style={{ color: '#dc2626' }}>- ฿{cnDeduction.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* GRAND TOTAL SUMMARY */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #cbd5e1' }}>
                    <tfoot>
                        <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
                            <td colSpan={3} style={{ ...tdStyle, background: 'transparent', padding: '20px', textAlign: 'right', fontSize: '1.1rem', fontWeight: '700', border: 'none', color: '#fff' }}>
                                {isDriverCopy ? 'รวมเงินที่ได้รับสุทธิ (Total Pay):' : 'สรุปยอดสุทธิทั้งสิ้น (Total Revenue):'}
                            </td>
                            <td style={{ ...tdStyle, background: 'transparent', padding: '20px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600', width: '120px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                {totalCount} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>รายการ</span>
                            </td>
                            <td style={{ ...tdStyle, background: 'transparent', padding: '20px', textAlign: 'right', fontSize: '1.6rem', fontWeight: '800', width: '220px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                ฿{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>


                {isDriverCopy && (
                    <div style={{
                        marginTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0 1rem'
                    }}>
                        <div style={{ textAlign: 'center', width: '210px' }}>
                            <div style={{ borderBottom: '2px solid #000', height: '40px', marginBottom: '6px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#000', margin: 0 }}>ผู้รับเงิน ({driverName})</p>
                            <p style={{ fontSize: '11px', color: '#000', fontWeight: '400' }}>วันที่ ....../....../......</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '210px' }}>
                            <div style={{ borderBottom: '2px solid #000', height: '40px', marginBottom: '6px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#000', margin: 0 }}>ผู้อนุมัติจ่าย (ภัทธา ทรานสปอร์ต)</p>
                            <p style={{ fontSize: '11px', color: '#000', fontWeight: '400' }}>วันที่ ....../....../......</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                    @media print {
                        .modal-overlay { background: white !important; position: absolute !important; }
                        .glass-card { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
                        .btn-icon, .X { display: none !important; }
                    }
                `}</style>
        </div>
    );
};

const thStyle = { padding: '10px', border: '1px solid #000', textAlign: 'center', background: '#fff', color: '#000' };
const tdStyle = { padding: '10px', border: '1px solid #000', background: '#fff', color: '#000' };

export default BillingSummary;
