import React, { useState, useRef } from 'react';
import { useTrips } from '../hooks/useTrips';


import MonthlyTable from '../components/MonthlyTable';
import TripTable from '../components/TripTable';
import TripForm from '../components/TripForm';
import TripEditModal from '../components/TripEditModal';
import { Truck, ArrowRight, Maximize2, Minimize2, Plus, ShoppingCart, Wallet, Banknote, Users, Fuel, Settings, CreditCard, DollarSign } from 'lucide-react';
import FleetDashboard from '../components/FleetDashboard';
import { logoBase64 } from '../assets/logoBase64';
import BillingSummary from '../components/BillingSummary';
import DriverTripLog from '../components/DriverTripLog';


const Dashboard = () => {
    const {
        trips, addTrip, deleteTrip, updateTrip, stats, yearlyStats,
        currentMonth, setCurrentMonth,
        currentYear, setCurrentYear,
        routePresets,
        cnDeductions, setCnDeductions,
        fetchPresets, fetchTrips,
        isSupabaseReady, currentMonthTripsEnriched, uploadFile
    } = useTrips();

    React.useEffect(() => {
        document.title = "ตารางค่าเที่ยว (Admin)";
        // Dynamic Manifest for Admin
        const link = document.querySelector("link[rel*='manifest']") || document.createElement('link');
        link.type = 'application/manifest+json';
        link.rel = 'manifest';
        link.href = '/admin.webmanifest?v=2.2';
        document.getElementsByTagName('head')[0].appendChild(link);
    }, []);

    const [formDate, setFormDate] = useState(null);
    const [editingTrip, setEditingTrip] = useState(null);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'all'
    const [isMaximized, setIsMaximized] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBilling, setShowBilling] = useState(false);
    const formRef = useRef(null);

    const handleEditTrip = (trip) => {
        setEditingTrip(trip);
        setIsModalOpen(true);
    };

    const handleUpdateTrip = async (id, updatedData) => {
        await updateTrip(id, updatedData);
        setEditingTrip(null);
        setIsModalOpen(false);
    };

    const handleAddTrip = async (data) => {
        await addTrip(data);
        setIsModalOpen(false);
    };

    const handleExport = () => {
        const headers = ["วันที่", "คนขับ", "สายงาน", "ค่าเที่ยว", "น้ำมัน", "ค่าจ้าง", "ค่าซ่อม", "จำนวนตะกร้า", "ค่าตะกร้า", "ส่วนแบ่งตะกร้า", "ยอดเบิก", "กำไร"];
        const csvContent = [
            headers.join(","),
            ...(currentMonthTripsEnriched || []).map(t => [
                t.date,
                `"${t.driverName}"`,
                `"${t.route}"`,
                t.price,
                t.fuel,
                t.wage,
                t.maintenance,
                t.basketCount,
                t.basket,
                t.basketShare,
                t.staffShare,
                t.profit
            ].join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `fleet_data_${currentMonth + 1}_${currentYear}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleMonthChange = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleSelectDate = (date) => {
        setFormDate({ value: date, ts: Date.now() });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const [viewType, setViewType] = useState('monthly'); // 'monthly' or 'yearly' for stats

    const tripsArray = viewMode === 'monthly' ? currentMonthTripsEnriched : trips;


    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return (
        <FleetDashboard
            stats={stats}
            yearlyStats={yearlyStats}
            isSupabaseReady={isSupabaseReady}
            trips={trips}
            currentMonth={currentMonth}
            currentYear={currentYear}
            viewType={viewType}
            setViewType={setViewType}
            isMaximized={isMaximized}
            hideStats={viewType === 'monthly'}
        >
            <div className="header-flex-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <img src={logoBase64} alt="ภัทธา ทรานสปอร์ต Logo" style={{ height: '100px', width: 'auto', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.1)', display: 'block' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 className="brand-logo" style={{ fontSize: '1.6rem', margin: 0, lineHeight: '1.2', fontWeight: '900' }}>ภัทธา ทรานสปอร์ต</h1>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: '3px', fontWeight: '800' }}>PATTA TRANSPORT</span>
                        </div>
                    </div>

                    <div className="title-section">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                            ตารางสรุปงานขนส่ง
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                            การจัดการกองรถและผลประกอบการ
                        </p>
                    </div>

                    {/* Status Pill moved from FleetDashboard */}
                    <div className={`status-pill ${isSupabaseReady ? 'online' : 'offline'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: '700' }}>
                        <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSupabaseReady ? '#2dd4bf' : '#f43f5e', boxShadow: isSupabaseReady ? '0 0 10px #2dd4bf' : 'none' }} />
                        <span style={{ color: isSupabaseReady ? '#2dd4bf' : '#f43f5e' }}>
                            {isSupabaseReady ? `คลาวด์ออนไลน์ (${trips.length})` : 'ออฟไลน์'}
                        </span>
                    </div>

                    {/* Monthly/Yearly Switcher moved from FleetDashboard */}

                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn-primary-premium"
                        onClick={() => {
                            setEditingTrip(null);
                            setIsModalOpen(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        <Plus size={20} />
                        <span>เพิ่มรายการใหม่</span>
                    </button>
                </div>
            </div>

            <div className="admin-main-grid" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div className="admin-table-col" style={{ flex: '1', minWidth: '0' }}>
                    {viewMode === 'monthly' ? (
                        <MonthlyTable
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            trips={currentMonthTripsEnriched}
                            onMonthChange={handleMonthChange}
                            onExport={handleExport}
                            onSelectDate={handleSelectDate}
                            onEditTrip={handleEditTrip}
                            onDeleteTrip={deleteTrip}
                            cnDeductions={cnDeductions}
                            setCnDeductions={setCnDeductions}
                            showSlips={false} // Don't show slips inside table component
                        />
                    ) : (
                        <TripTable
                            trips={tripsArray}
                            onDelete={deleteTrip}
                            onEdit={handleEditTrip}
                            onExport={handleExport}
                        />
                    )}
                </div>

                {/* Right Column: Salary Slips & Stats (Only visible in Monthly View) */}
                {viewMode === 'monthly' && (
                    <div className="admin-slips-col" style={{
                        flex: '0 0 380px',
                        position: 'sticky',
                        top: '20px',
                        height: 'fit-content',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>

                        {/* 1. สรุปผลประกอบการ (Stats Section) */}
                        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-card)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <ShoppingCart size={18} /> สรุปผลประกอบการ
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {/* รายได้รวม (Full Width) */}
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: '600' }}>รายได้รวม</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8' }}>฿{stats.totalRevenue.toLocaleString()}</div>
                                </div>

                                {/* Row 1: จำนวนเที่ยว - ค่าเที่ยว */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>จำนวนเที่ยว</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>{stats.totalTrips} เที่ยว</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>ค่าเที่ยว</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>฿{stats.totalPrice.toLocaleString()}</div>
                                </div>

                                {/* Row 2: ค่าแรง - ค่าตะกร้า */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>ค่าแรง</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>฿{stats.totalWage.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>ค่าตะกร้า</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>฿{stats.totalBasket.toLocaleString()}</div>
                                </div>

                                {/* Row 3: ส่วนแบ่งตะกร้า - น้ำมัน */}
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px', color: '#f43f5e' }}>ส่วนแบ่งตะกร้า</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f43f5e' }}>฿{stats.totalBasketShare.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px', color: '#f43f5e' }}>ค่าน้ำมัน</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f43f5e' }}>฿{stats.totalFuel.toLocaleString()}</div>
                                </div>

                                {/* Row 4: ค่าซ่อม - ยอดเบิก */}
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px', color: '#f43f5e' }}>ค่าซ่อม</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f43f5e' }}>฿{stats.totalMaintenance.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px', color: '#f59e0b' }}>ยอด.เบิก</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b' }}>฿{stats.totalStaffAdvance.toLocaleString()}</div>
                                </div>

                                {/* Row 5: คงเหลือลูกน้อง */}
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#a855f7', fontWeight: '600' }}>คงเหลือลูกน้อง</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#a855f7' }}>฿{stats.totalNetPay.toLocaleString()}</div>
                                </div>

                                {/* กำไรสุทธิ (Full Width) */}
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '1rem', color: '#22c55e', fontWeight: '600' }}>กำไรสุทธิ</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#22c55e' }}>฿{stats.totalProfit.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ออกสลิปเงินเดือน (Slips Section) */}
                        <div style={{ flex: 1 }}>
                            <MonthlyTable
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                trips={currentMonthTripsEnriched}
                                onMonthChange={handleMonthChange}
                                cnDeductions={cnDeductions}
                                setCnDeductions={setCnDeductions}
                                showSlips={true} // Only show slips here
                                onlySlips={true} // Helper prop to render ONLY the slips section
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Maximized View Editing/Adding */}
            <TripEditModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTrip(null);
                }}
                onAdd={handleAddTrip}
                onUpdate={handleUpdateTrip}
                uploadFile={uploadFile}
                routePresets={routePresets}
                fetchPresets={fetchPresets}
                externalDate={formDate}
                onDateChange={(val) => setFormDate({ value: val, ts: Date.now() })}
                editingTrip={editingTrip}
            />

            {/* Billing Summary grouped by Driver at the bottom */}
            {Object.entries(
                currentMonthTripsEnriched.reduce((acc, trip) => {
                    let rawName = trip.driverName || trip.driver_name || 'ไม่ระบุชื่อ';
                    let name = rawName.trim().replace(/\s+/g, ' ');
                    // User Request: Specific change for Patta's display name
                    if (name.includes('ภัทธา')) name = 'นางสาว ภัทธา เรืองวิลัย';

                    if (!acc[name]) acc[name] = [];
                    acc[name].push(trip);
                    return acc;
                }, {})
            ).map(([driverName, driverTrips]) => (
                <div key={driverName} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '4rem', borderTop: '2px dashed #6366f1', paddingTop: '2rem' }}>
                    <div style={{ padding: '0 2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#6366f1', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            📊 รายละเอียดงานและสรุปยอด: {driverName}
                        </h2>
                    </div>

                    {/* 1. Daily Trip Log - Notebook Style Breakdown */}
                    <DriverTripLog
                        trips={driverTrips}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        driverName={driverName}
                        isDriverCopy={true}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#000', fontWeight: '800', margin: '1rem 0' }}>
                                🧾 ใบแจ้งยอด (สรุปตามเส้นทาง)
                            </h3>
                        </div>

                        {/* 2. Office Copy - Always Patta's name for billing */}
                        <BillingSummary
                            trips={driverTrips}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            driverName="นางสาว ภัทธา เรืองวิลัย"
                            address="เลขที่ 246 หมู่ 6 ต.เวียงตาล อ.ห้างฉัตร ลำปาง 52190"
                            isDriverCopy={false}
                            cnDeduction={cnDeductions['นางสาว ภัทธา เรืองวิลัย'] || 0}
                        />
                        {/* 3. Driver Copy - Shows actual driver's name */}
                        <BillingSummary
                            trips={driverTrips}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            driverName={driverName}
                            address={driverName.includes("สมชาย") ? "279 ม.7 ต.ป่าสัก อ.เมือง ลำพูน 51000" : "เลขที่ 246 หมู่ 6 ต.เวียงตาล อ.ห้างฉัตร ลำปาง 52190"}
                            isDriverCopy={true}
                            cnDeduction={cnDeductions[driverName] || 0}
                        />
                    </div>
                </div>
            ))}

            {/* Floating Action Button for Adding in Maximized Mode */}
            {/* Floating Action Button - Always visible now */}
            <button
                onClick={() => {
                    setEditingTrip(null);
                    setIsModalOpen(true);
                }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                className="fab-add"
                title="เพิ่มรายการใหม่"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-main-grid {
                    display: flex;
                    gap: 1.25rem;
                    align-items: start; /* Changed from stretch to start for sticky to work */
                    margin-top: 0.5rem;
                    flex: ${isMaximized ? 'none' : '1'};
                    height: ${isMaximized ? 'auto' : 'initial'};
                    min-height: 0;
                }
                .admin-form-col {
                    display: ${isMaximized ? 'none' : 'flex'};
                    flex: 0 0 380px;
                    min-height: 0;
                    position: sticky;
                    top: 1rem;
                    height: calc(100vh - 2rem);
                    overflow: hidden;
                }
                @media (max-width: 1200px) {
                    .admin-main-grid {
                        flex-direction: column;
                        height: auto;
                        flex: none;
                    }
                    .admin-form-col { 
                        display: flex !important;
                        width: 100%; 
                        flex: none; 
                        order: 1; /* Form top */
                        height: auto; 
                        padding: 0; 
                    }
                    .admin-table-col {
                        order: 2; /* Table bottom */
                        width: 100%;
                        flex: none;
                        overflow: visible;
                    }
                }
                .admin-form-col > form {
                    flex: 1;
                    height: 100%;
                    overflow-y: auto;
                    padding: 0.8rem!important;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                }
                .admin-form-col > form:hover {
                    transform: translateZ(5px) rotateY(1deg);
                    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.7);
                }
                /* Custom Scrollbar */
                .admin-form-col > form::-webkit-scrollbar { width: 4px; }
                .admin-form-col > form::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }

                .admin-table-col {
                    flex: 1;
                    min-width: 0;
                    background: var(--glass-bg);
                    border-radius: 2rem;
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                    padding: 1.25rem;
                    box-shadow: 
                        0 20px 50px -10px rgba(0,0,0,0.5),
                        inset 0 1px 1px rgba(255,255,255,0.05);
                    height: auto;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                }
                .admin-table-col:hover {
                    transform: translateZ(8px) rotateY(-0.5deg);
                    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
                }
                .admin-table-col .table-container {
                    flex: 1;
                    /* Remove overflow-y auto to let window handle scroll */
                    overflow-y: visible;
                    height: auto;
                }
                .summary-horizontal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
                    gap: 0.75rem;
                }
                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 0.8rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .summary-item .label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: var(--text-dim);
                    text-transform: uppercase;
                }
                .summary-item .val {
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                }
                .summary-item.highlight-green {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.4);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
                }
                .summary-item.highlight-blue {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .summary-item.highlight-red {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.4);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }
                .summary-item.total {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.08));
                    border-color: rgba(168, 85, 247, 0.3);
                    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
                }
                .text-safe { color: var(--safe)!important; }
                .text-danger { color: var(--danger)!important; }
                .text-warning { color: var(--warning)!important; }

                .view-mode-toggle { border: 1px solid var(--glass-border); }
                .toggle-btn { 
                    border: none; 
                    background: transparent; 
                    color: var(--text-dim); 
                    padding: 6px 15px; 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 600; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .toggle-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(129, 140, 248, 0.3); }
                
                .btn-icon-refresh {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-refresh:hover { background: var(--primary); border-color: var(--primary); color: white; }
                
                @media (max-width: 1200px) {
                    .admin-main-grid { 
                        flex-direction: column !important; 
                        height: auto !important; 
                        display: flex !important; 
                        overflow: visible !important;
                    }
                    .admin-form-col { 
                        width: 100% !important; 
                        flex: none !important; 
                        order: 1 !important; 
                        height: auto !important; 
                        padding: 0 !important; 
                        display: flex !important;
                    }
                    .admin-form-col > form { 
                        height: auto !important; 
                        overflow: visible !important; 
                        border-radius: 1.5rem !important; 
                        padding: 1.2rem !important; 
                        margin-bottom: 1.5rem !important;
                    }
                    .admin-table-col { 
                        width: 100% !important; 
                        flex: none !important; 
                        order: 2 !important; 
                        height: auto !important; 
                        overflow-x: auto !important; 
                        -webkit-overflow-scrolling: touch !important; 
                        margin-top: 0 !important;
                    }
                    .header-flex-premium { padding: 0.5rem; }
                    .logo-group img { height: 60px !important; }
                    .brand-logo { font-size: 1.2rem !important; }
                }
                @media (max-width: 1200px) {
                    html, body, #root { height: auto !important; overflow: auto !important; }
                    .dashboard-premium { height: auto !important; overflow: visible !important; min-height: 100vh; }
                }

            `}} />
        </FleetDashboard>
    );
};

export default Dashboard;