import React, { useState, useMemo } from 'react';
import {
    TableProperties, TrendingUp, Calendar, ChevronLeft, ChevronRight,
    Download, Plus, BarChart2, Users, Truck, Fuel, Wrench,
    ArrowUpRight, ArrowDownRight, Award, Activity, X
} from 'lucide-react';
import MonthlyTable from './MonthlyTable';

const months = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
];
const fmt = (n) => Math.round(n).toLocaleString('th-TH');

/* ── Mini KPI card ── */
const MiniKpi = ({ icon: Icon, label, value, color, sub }) => (
    <div style={{
        background: `${color}0f`,
        border: `1px solid ${color}33`,
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.35rem',
        position: 'relative', overflow: 'hidden',
    }}>
        <div style={{ position: 'absolute', top: -16, right: -16, width: 64, height: 64, borderRadius: '50%', background: `${color}0d` }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
            </div>
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{sub}</div>}
    </div>
);

/* ── Data Section Button ── */
const SectionBtn = ({ icon: Icon, label, desc, color, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem', borderRadius: '16px', border: 'none',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            background: active ? `linear-gradient(135deg, ${color}22, ${color}0a)` : 'rgba(255,255,255,0.03)',
            borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
            boxShadow: active ? `0 4px 20px ${color}20` : 'none',
            transition: 'all 0.2s cubic-bezier(0.23,1,0.32,1)',
        }}
    >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? `${color}33` : `${color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: active ? 'white' : '#94a3b8' }}>{label}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, marginTop: 2 }}>{desc}</div>
        </div>
        {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />}
    </button>
);

const DataHub = ({
    currentMonth, currentYear, trips, onMonthChange, onExport,
    onSelectDate, onEditTrip, onDeleteTrip, cnDeductions, setCnDeductions,
    onBulkUpdateRoutePrice, routePresets, stats = {}
}) => {
    const [activeSection, setActiveSection] = useState(null);

    /* ── Profit by day ── */
    const dailyProfit = useMemo(() => {
        const start = new Date(currentYear, currentMonth - 1, 20);
        const end   = new Date(currentYear, currentMonth,     19);
        const days  = [];
        let cur = new Date(start);
        while (cur <= end) {
            const ds = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
            const dayTrips = trips.filter(t => t.date === ds);
            const profit   = dayTrips.reduce((s, t) => s + (t.profit || 0), 0);
            const revenue  = dayTrips.reduce((s, t) => s + (t.price  || 0) + (t.basket || 0), 0);
            days.push({ date: ds, day: cur.getDate(), profit, revenue, count: dayTrips.length });
            cur.setDate(cur.getDate() + 1);
        }
        return days;
    }, [trips, currentMonth, currentYear]);

    const { totalRevenue=0, totalProfit=0, totalTrips=0, totalFuel=0, totalWage=0, totalMaintenance=0, totalBasketShare=0, totalStaffAdvance=0, totalBasket=0, totalPrice=0 } = stats;
    const maxAbsProfit = Math.max(...dailyProfit.map(d => Math.abs(d.profit)), 1);

    /* ── Route stats ── */
    const routeStats = useMemo(() => {
        const map = {};
        trips.forEach(t => {
            const r = (t.route||'ไม่ระบุ').trim();
            if (!map[r]) map[r] = { route: r, trips: 0, revenue: 0, profit: 0 };
            map[r].trips++;
            map[r].revenue += (t.price||0) + (t.basket||0);
            map[r].profit  += (t.profit||0);
        });
        return Object.values(map).sort((a,b) => b.trips - a.trips);
    }, [trips]);

    const sections = [
        { id: 'daily-table', icon: TableProperties, label: 'ตารางรายวัน', desc: 'รายการวิ่งงานทุกวันในรอบบิล', color: '#6366f1' },
        { id: 'profit',      icon: TrendingUp,      label: 'ผลกำไรรายวัน', desc: 'กราฟกำไร-ขาดทุนแต่ละวัน',    color: '#22c55e' },
        { id: 'finance',     icon: BarChart2,       label: 'รายละเอียดการเงิน', desc: 'รายได้ / ต้นทุน / กำไรสุทธิ', color: '#38bdf8' },
        { id: 'routes',      icon: Truck,           label: 'สรุปสายงาน', desc: 'สถิติแต่ละเส้นทาง',             color: '#a78bfa' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Month Navigator ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 4 }}>
                    <button onClick={() => onMonthChange(-1)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ minWidth: 140, textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                        {months[currentMonth]} {currentYear}
                    </span>
                    <button onClick={() => onMonthChange(1)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                    รอบบิล 20 {months[(currentMonth-1+12)%12]} – 19 {months[currentMonth]}
                </div>
                <button onClick={onExport} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* ── Mini KPI Strip ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                <MiniKpi icon={TrendingUp} label="รายได้รวม"      value={`฿${fmt(totalRevenue)}`} color="#38bdf8" sub={`${totalTrips} เที่ยว`} />
                <MiniKpi icon={Award}      label="กำไรสุทธิ"      value={`฿${fmt(totalProfit)}`}  color={totalProfit>=0?'#22c55e':'#f43f5e'} />
                <MiniKpi icon={Fuel}       label="ค่าน้ำมัน"      value={`฿${fmt(totalFuel)}`}    color="#f87171" />
                <MiniKpi icon={Users}      label="ยอดจ่ายพนักงาน" value={`฿${fmt(totalWage)}`}    color="#fb923c" />
            </div>

            {/* ── Section Buttons Grid ── */}
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.25rem' }}>
                    เลือกข้อมูลที่ต้องการดู
                </div>
                {sections.map(s => (
                    <SectionBtn
                        key={s.id}
                        icon={s.icon}
                        label={s.label}
                        desc={s.desc}
                        color={s.color}
                        active={activeSection === s.id}
                        onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                    />
                ))}
            </div>

            {/* ════════════════════════════════════════
                SECTION: ตารางรายวัน
            ════════════════════════════════════════ */}
            {activeSection === 'daily-table' && (
                <div style={{ animation: 'fadeSlideUp 0.3s cubic-bezier(0.23,1,0.32,1) both' }}>
                    <MonthlyTable
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        trips={trips}
                        onMonthChange={onMonthChange}
                        onExport={onExport}
                        onSelectDate={onSelectDate}
                        onEditTrip={onEditTrip}
                        onDeleteTrip={onDeleteTrip}
                        cnDeductions={cnDeductions}
                        setCnDeductions={setCnDeductions}
                        showSlips={false}
                        onBulkUpdateRoutePrice={onBulkUpdateRoutePrice}
                        routePresets={routePresets}
                    />
                </div>
            )}

            {/* ════════════════════════════════════════
                SECTION: ผลกำไรรายวัน
            ════════════════════════════════════════ */}
            {activeSection === 'profit' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem', animation: 'fadeSlideUp 0.3s cubic-bezier(0.23,1,0.32,1) both' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="#22c55e" /> ผลกำไร-ขาดทุนรายวัน
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', minWidth: 600, paddingBottom: '0.5rem' }}>
                            {dailyProfit.map(d => {
                                const isPos = d.profit >= 0;
                                const h = d.count === 0 ? 4 : Math.max(8, (Math.abs(d.profit) / maxAbsProfit) * 100);
                                const color = d.count === 0 ? '#334155' : (isPos ? '#22c55e' : '#f43f5e');
                                return (
                                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 14 }}>
                                        <div style={{ fontSize: '0.55rem', color: isPos ? '#22c55e' : '#f43f5e', fontWeight: 700, opacity: d.count > 0 ? 1 : 0 }}>
                                            {d.count > 0 ? (isPos ? '+' : '') + Math.round(d.profit / 1000) + 'k' : ''}
                                        </div>
                                        <div style={{ width: '100%', height: `${h}px`, background: `${color}${d.count===0?'33':'cc'}`, borderRadius: 4, boxShadow: d.count > 0 ? `0 0 6px ${color}60` : 'none', transition: 'height 0.5s cubic-bezier(0.23,1,0.32,1)' }} title={`${d.date}: ฿${fmt(d.profit)}`} />
                                        <div style={{ fontSize: '0.55rem', color: '#475569', fontWeight: 700 }}>{d.day}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Daily profit table */}
                    <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    {['วันที่','จำนวนเที่ยว','รายได้','กำไร'].map(h => (
                                        <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: h==='วันที่'?'left':'right', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dailyProfit.filter(d => d.count > 0).map(d => {
                                    const isPos = d.profit >= 0;
                                    const color = isPos ? '#22c55e' : '#f43f5e';
                                    return (
                                        <tr key={d.date} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '0.5rem 0.75rem', color: '#e2e8f0', fontWeight: 600 }}>{d.date}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#a78bfa', fontWeight: 700 }}>{d.count} เที่ยว</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>฿{fmt(d.revenue)}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color, fontWeight: 800 }}>
                                                {isPos ? <ArrowUpRight size={12} color={color} style={{display:'inline'}}/> : <ArrowDownRight size={12} color={color} style={{display:'inline'}}/>}
                                                {' '}฿{fmt(d.profit)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: totalProfit>=0?'rgba(34,197,94,0.08)':'rgba(244,63,94,0.08)', fontWeight: 800 }}>
                                    <td style={{ padding: '0.65rem 0.75rem', color: 'white' }}>รวมทั้งหมด</td>
                                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#a78bfa' }}>{totalTrips} เที่ยว</td>
                                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#38bdf8' }}>฿{fmt(totalRevenue)}</td>
                                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: totalProfit>=0?'#22c55e':'#f43f5e', fontSize: '1rem' }}>฿{fmt(totalProfit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                SECTION: รายละเอียดการเงิน
            ════════════════════════════════════════ */}
            {activeSection === 'finance' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', animation: 'fadeSlideUp 0.3s cubic-bezier(0.23,1,0.32,1) both' }}>
                    {/* Income / Expense breakdown */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={16} color="#818cf8" /> รายละเอียดการเงิน
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { label: 'ค่าเที่ยว (Revenue)',       val: totalPrice,        color: '#38bdf8', plus: true  },
                                { label: 'ค่าตะกร้า',                 val: totalBasket,       color: '#34d399', plus: true  },
                                { label: 'ค่าน้ำมัน',                 val: totalFuel,         color: '#f87171', plus: false },
                                { label: 'ค่าจ้างพนักงาน',           val: totalWage,         color: '#fb923c', plus: false },
                                { label: 'ค่าซ่อมบำรุง',             val: totalMaintenance,  color: '#e879f9', plus: false },
                                { label: 'ส่วนแบ่งตะกร้าคืนพนักงาน',val: totalBasketShare,  color: '#fbbf24', plus: false },
                                { label: 'ยอดเบิกล่วงหน้า',          val: totalStaffAdvance, color: '#94a3b8', plus: false },
                            ].map(({ label, val, color, plus }, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 3, height: 16, borderRadius: 3, background: color }} />
                                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {plus ? <ArrowUpRight size={12} color={color} /> : <ArrowDownRight size={12} color={color} />}
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}> ฿{fmt(val)}</span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', borderRadius: 14, background: totalProfit>=0?'rgba(34,197,94,0.12)':'rgba(244,63,94,0.12)', border: `1px solid ${totalProfit>=0?'#22c55e40':'#f43f5e40'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {totalProfit>=0 ? <ArrowUpRight size={15} color="#22c55e" /> : <ArrowDownRight size={15} color="#f43f5e" />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: totalProfit>=0?'#22c55e':'#f43f5e' }}>กำไรสุทธิรวม</span>
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: totalProfit>=0?'#22c55e':'#f43f5e' }}>฿{fmt(totalProfit)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Cost ratio bars */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Activity size={16} color="#818cf8" /> สัดส่วนต้นทุนต่อรายได้
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {[
                                { label: 'ค่าน้ำมัน',      val: totalFuel,         color: '#f87171', icon: Fuel      },
                                { label: 'ค่าจ้างพนักงาน', val: totalWage,         color: '#fb923c', icon: Users     },
                                { label: 'ค่าซ่อมบำรุง',   val: totalMaintenance,  color: '#e879f9', icon: Wrench    },
                                { label: 'ส่วนแบ่งตะกร้า', val: totalBasketShare,  color: '#fbbf24', icon: Award     },
                                { label: 'ยอดเบิก',         val: totalStaffAdvance, color: '#94a3b8', icon: TrendingUp },
                            ].map(({ label, val, color, icon: Icon }) => {
                                const pct = totalRevenue > 0 ? Math.min((val/totalRevenue)*100, 100) : 0;
                                return (
                                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Icon size={13} color={color} />
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color }}>฿{fmt(val)} <span style={{ color: '#475569', fontWeight: 600 }}>({pct.toFixed(1)}%)</span></span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: `linear-gradient(90deg, ${color}99, ${color})`, transition: 'width 0.8s cubic-bezier(0.23,1,0.32,1)', boxShadow: `0 0 8px ${color}60` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Award size={13} color="#22c55e" />
                                        <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>Profit Margin</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#22c55e' }}>
                                        {totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : '0.0'}%
                                    </span>
                                </div>
                                <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${totalRevenue>0?Math.min((totalProfit/totalRevenue)*100,100):0}%`, borderRadius: 8, background: 'linear-gradient(90deg, #16a34a, #22c55e)', boxShadow: '0 0 12px #22c55e60', transition: 'width 0.8s cubic-bezier(0.23,1,0.32,1)' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                SECTION: สรุปสายงาน
            ════════════════════════════════════════ */}
            {activeSection === 'routes' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem', animation: 'fadeSlideUp 0.3s cubic-bezier(0.23,1,0.32,1) both' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Truck size={16} color="#38bdf8" /> สรุปสายงานรายเดือน
                    </h3>
                    {routeStats.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#475569', padding: '2rem', fontSize: '0.82rem' }}>ไม่มีข้อมูลสายงานในรอบนี้</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        {['#','สายงาน','จำนวนเที่ยว','รายได้','กำไร'].map(h => (
                                            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: h==='สายงาน'||h==='#'?'left':'right', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {routeStats.map((r, i) => {
                                        const barPct = routeStats[0].trips > 0 ? (r.trips / routeStats[0].trips) * 100 : 0;
                                        const isPos = r.profit >= 0;
                                        return (
                                            <tr key={r.route} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 700, width: 32 }}>#{i+1}</td>
                                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{r.route}</div>
                                                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', width: '100%', maxWidth: 200 }}>
                                                        <div style={{ height: '100%', width: `${barPct}%`, borderRadius: 4, background: 'linear-gradient(90deg, #818cf8, #6366f1)', transition: 'width 0.6s cubic-bezier(0.23,1,0.32,1)' }} />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#a78bfa', fontWeight: 700 }}>{r.trips} เที่ยว</td>
                                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>฿{fmt(r.revenue)}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: isPos?'#22c55e':'#f43f5e', fontWeight: 800 }}>฿{fmt(r.profit)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DataHub;
