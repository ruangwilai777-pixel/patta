import React from 'react';
import { Printer, ShoppingBasket, Truck, ReceiptText } from 'lucide-react';

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
        if (!isDriverCopy) {
            // Office Copy: Daily breakdown (un-aggregated)
            const list = [];
            trips.forEach(trip => {
                if (!trip.date) return;
                const [y, m, d] = trip.date.split('-');
                
                const deliveryVal = parseFloat(trip.price || 0);
                const deliveryLabel = 'ค่าขนส่งสินค้า';

                const basketVal = parseFloat(trip.basket || 0);
                const basketLabel = 'ค่าตะกร้าสินค้า';

                const beYear = (parseInt(y) + 543).toString().slice(-2);
                const formattedDate = `${d}/${m}/${beYear}`;

                if (deliveryVal > 0) {
                    list.push({
                        date: trip.date,
                        formattedDate,
                        route: trip.route,
                        type: deliveryLabel,
                        pricePerUnit: deliveryVal,
                        count: 1,
                        totalAmount: deliveryVal,
                        month: m,
                        year: y
                    });
                }

                if (basketVal > 0) {
                    list.push({
                        date: trip.date,
                        formattedDate,
                        route: trip.route,
                        type: basketLabel,
                        pricePerUnit: basketVal,
                        count: 1,
                        totalAmount: basketVal,
                        month: m,
                        year: y
                    });
                }
            });

            // Sort chronologically by date, then route, then type
            return list.sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                if (a.route !== b.route) {
                    return a.route.localeCompare(b.route);
                }
                return a.type.includes('ตะกร้า') ? 1 : -1;
            });
        } else {
            // Driver Copy: Grouped by route (original logic)
            const deliveryGroups = {};
            const basketGroups = {};

            trips.forEach(trip => {
                if (!trip.date) return;
                const [y, m, d] = trip.date.split('-');

                const deliveryVal = parseFloat(trip.wage || 0);
                const deliveryLabel = 'ค่าจ้าง';

                const basketVal = parseFloat(trip.basketShare || 0);
                const basketLabel = 'ค่าส่วนแบ่งตะกร้า';

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
        }
    }, [trips, isDriverCopy]);

    const deliveryData = groupedData.filter(item => !item.type.includes('ตะกร้า'));
    const basketData = groupedData.filter(item => item.type.includes('ตะกร้า'));

    const totalAllRevenue = groupedData.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
    const totalCount = groupedData.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);

    const housingAllowance = (isDriverCopy && trips.length > 0) ? 1000 : 0;
    const totalAdvance = isDriverCopy ? trips.reduce((sum, t) => sum + (parseFloat(t.staffShare) || 0), 0) : 0;
    const grandTotal = isDriverCopy ? (totalAllRevenue + housingAllowance) - (totalAdvance + (parseFloat(cnDeduction) || 0)) : totalAllRevenue;

    return (
        <div className="glass-card fade-in billing-summary-card" style={{
            width: '100%', maxWidth: '900px', margin: '1.5rem auto',
            display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', color: 'var(--text-main)',
            borderRadius: '2rem', border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            fontFamily: "'Outfit', 'Chakra Petch', 'Sarabun', sans-serif", overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <ReceiptText size={20} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
                        {isDriverCopy ? 'ใบแจ้งยอด (สำหรับคนขับ)' : 'ใบวางบิล (สำหรับสำนักงาน)'}
                    </span>
                </div>
                <button className="btn btn-outline" onClick={() => window.print()} style={{ border: '1px solid var(--glass-border)', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                    <Printer size={14} /> พิมพ์เอกสาร
                </button>
            </div>

            <div className="print-area" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                {/* Header Info like the image */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '12px', color: 'var(--text-main)', gap: '1rem' }}>
                    <div style={{ border: '1px solid var(--glass-border)', padding: '0.8rem 1.2rem', width: '60%', background: 'rgba(255,255,255,0.01)', borderRadius: '14px' }}>
                        <p style={{ margin: '2px 0' }}><strong>ชื่อ:</strong> <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{driverName}</span></p>
                        <p style={{ margin: '2px 0', color: 'var(--text-dim)' }}><strong>ที่อยู่:</strong> {address}</p>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', padding: '0.8rem 1.2rem', width: '35%', background: 'rgba(255,255,255,0.01)', borderRadius: '14px' }}>
                        <p style={{ margin: '2px 0', color: 'var(--text-dim)' }}><strong>รอบวิ่งวันที่:</strong></p>
                        <p style={{ margin: '2px 0', fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{rangeDisplay}</p>
                    </div>
                </div>

                {/* 1. DELIVERY / WAGE SECTION */}
                {deliveryData.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--text-main)' }}>
                            <Truck size={20} color="var(--primary)" />
                            <span style={{ fontWeight: '700', fontSize: '14px', textDecoration: 'underline' }}>{isDriverCopy ? 'รายละเอียดค่าจ้าง' : 'รายละเอียดค่าขนส่งสินค้า'}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid var(--glass-border)' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-main)' }}>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '50px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>ลำดับ</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '90px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>{isDriverCopy ? 'เดือน/ปี' : 'วันที่'}</th>
                                    <th style={{ ...thStyle, padding: '12px 10px', border: '1px solid var(--glass-border)', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>สายงาน</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '70px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>เที่ยว</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', textAlign: 'right', width: '100px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>ราคา/เที่ยว</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', textAlign: 'right', width: '115px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>เงินรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryData.map((item, idx) => (
                                    <tr key={idx} style={{ background: 'transparent' }}>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700', border: '1px solid var(--glass-border)' }}>{String(idx + 1).padStart(2, '0')}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', border: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>
                                            <span style={{ fontWeight: '500', fontSize: '13px' }}>
                                                {isDriverCopy ? `${item.month}/${item.year}` : item.formattedDate}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, padding: '10px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--glass-border)', fontSize: '14px' }}>{item.route}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '14px', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>{item.count}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '500', color: 'var(--text-dim)', border: '1px solid var(--glass-border)', fontSize: '12px' }}>{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. BASKET SECTION */}
                {basketData.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--text-main)' }}>
                            <ShoppingBasket size={20} color="var(--safe)" />
                            <span style={{ fontWeight: '700', fontSize: '14px', textDecoration: 'underline' }}>{isDriverCopy ? 'รายละเอียดค่าส่วนแบ่งตะกร้า' : 'รายละเอียดค่าตะกร้าสินค้า'}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid var(--glass-border)' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-main)' }}>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '50px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>ลำดับ</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '90px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>{isDriverCopy ? 'เดือน/ปี' : 'วันที่'}</th>
                                    <th style={{ ...thStyle, padding: '12px 10px', border: '1px solid var(--glass-border)', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>รายละเอียดตะกร้า</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', width: '70px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>จำนวน</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', textAlign: 'right', width: '100px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>ราคา/หน่วย</th>
                                    <th style={{ ...thStyle, padding: '12px 6px', border: '1px solid var(--glass-border)', textAlign: 'right', width: '115px', fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>เงินรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {basketData.map((item, idx) => (
                                    <tr key={idx} style={{ background: 'transparent' }}>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700', border: '1px solid var(--glass-border)' }}>{String(idx + 1).padStart(2, '0')}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', border: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>
                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>
                                                {isDriverCopy ? `${item.month}/${item.year}` : item.formattedDate}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, padding: '10px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--glass-border)', fontSize: '14px' }}>{item.route}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '14px', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>{item.count}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '500', color: 'var(--text-dim)', border: '1px solid var(--glass-border)', fontSize: '12px' }}>{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--safe)', border: '1px solid var(--glass-border)' }}>{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DEDUCTIONS & EXTRAS SECTION (DRIVER ONLY) */}
                {isDriverCopy && (
                    <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                            <span>🏠 ค่าเช่าบ้าน (Housing Allowance):</span>
                            <span style={{ color: 'var(--safe)' }}>+ ฿{housingAllowance.toLocaleString()}</span>
                        </div>
                        {totalAdvance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                <span>💸 หักเบิกเงินล่วงหน้า (Staff Advance):</span>
                                <span style={{ color: 'var(--danger)' }}>- ฿{totalAdvance.toLocaleString()}</span>
                            </div>
                        )}
                        {cnDeduction > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                <span>🔖 หักคืน (CN Deductions):</span>
                                <span style={{ color: 'var(--danger)' }}>- ฿{cnDeduction.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* GRAND TOTAL SUMMARY */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--glass-border)' }}>
                    <tfoot>
                        <tr style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white' }}>
                            <td colSpan={3} style={{ ...tdStyle, background: 'transparent', padding: '16px 20px', textAlign: 'right', fontSize: '1.05rem', fontWeight: '700', border: 'none', color: '#fff' }}>
                                {isDriverCopy ? 'รวมเงินที่ได้รับสุทธิ (Total Pay):' : 'สรุปยอดสุทธิทั้งสิ้น (Total Revenue):'}
                            </td>
                            <td style={{ ...tdStyle, background: 'transparent', padding: '16px 20px', textAlign: 'center', fontSize: '1.05rem', fontWeight: '600', width: '120px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                {totalCount} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>รายการ</span>
                            </td>
                            <td style={{ ...tdStyle, background: 'transparent', padding: '16px 20px', textAlign: 'right', fontSize: '1.45rem', fontWeight: '900', width: '220px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
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
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', height: '40px', marginBottom: '6px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>ผู้รับเงิน ({driverName})</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '400' }}>วันที่ ....../....../......</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '210px' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', height: '40px', marginBottom: '6px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>ผู้อนุมัติจ่าย (ภัทธา ทรานสปอร์ต)</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '400' }}>วันที่ ....../....../......</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    .modal-overlay { background: white !important; position: absolute !important; }
                    .billing-summary-card { 
                        box-shadow: none !important; 
                        border: none !important; 
                        width: 100% !important; 
                        max-width: none !important; 
                        background: white !important; 
                        color: black !important;
                    }
                    .btn-icon, .X, button { display: none !important; }
                    .print-area { color: black !important; background: white !important; }
                    .print-area div, .print-area p, .print-area span, .print-area strong { color: black !important; }
                    .print-area div { border-color: #cbd5e1 !important; background: white !important; }
                    table { border: 2px solid #000 !important; }
                    th { border: 1px solid #cbd5e1 !important; color: #1e293b !important; background: #f0f4f8 !important; }
                    tbody tr { background: white !important; color: black !important; }
                    td { border: 1px solid #cbd5e1 !important; color: black !important; }
                    tfoot tr { background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important; color: white !important; }
                    tfoot td { color: white !important; }
                }
            `}</style>
        </div>
    );
};

const thStyle = { padding: '10px', border: '1px solid var(--glass-border)', textAlign: 'center', background: 'transparent', color: 'var(--text-main)' };
const tdStyle = { padding: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)' };

export default BillingSummary;
