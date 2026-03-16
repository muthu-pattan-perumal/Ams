import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalSuppliers: 0,
        customerReceived: 0,
        customerPending: 0,
        supplierPaid: 0,
        supplierPending: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [cust, supp, trans, pay] = await Promise.all([
                api.get('/customers'),
                api.get('/suppliers'),
                api.get('/transactions'),
                api.get('/payments')
            ]);

            const customerReceived = pay.data
                .filter(p => !p.entityType || p.entityType === 'Customer')
                .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

            const supplierPaid = pay.data
                .filter(p => p.entityType === 'Supplier')
                .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

            const customerPending = cust.data.reduce((acc, c) => acc + (Number(c.balance) || 0) + (Number(c.openingBalance) || 0), 0);
            const supplierPending = supp.data.reduce((acc, s) => acc + (Number(s.balance) || 0) + (Number(s.openingBalance) || 0), 0);

            setStats({
                totalCustomers: cust.data.length,
                totalSuppliers: supp.data.length,
                customerReceived,
                customerPending,
                supplierPaid,
                supplierPending
            });
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className="card flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
                <i className={`mdi ${icon} text-xl lg:text-2xl`}></i>
            </div>
            <div className="min-w-0">
                <p className="text-slate-500 text-xs lg:text-sm font-medium truncate uppercase tracking-wider">{title}</p>
                <h3 className="text-lg lg:text-xl font-bold truncate">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 lg:mb-10">
                <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 truncate">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
                <p className="text-slate-500 mt-1 lg:mt-2 lg:text-lg">Here's what's happening with your business today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
                <StatCard title="Total Customers" value={stats.totalCustomers} icon="mdi-account-group" color="bg-blue-500" />
                <StatCard title="Received from Customers" value={`$${stats.customerReceived.toFixed(2)}`} icon="mdi-cash-check" color="bg-emerald-500" />
                <StatCard title="Customer Pending" value={`$${Math.abs(stats.customerPending).toFixed(2)} ${stats.customerPending >= 0 ? '' : '(Cr)'}`} icon="mdi-account-clock-outline" color="bg-rose-500" />

                <StatCard title="Total Suppliers" value={stats.totalSuppliers} icon="mdi-truck-delivery" color="bg-purple-500" />
                <StatCard title="Paid to Suppliers" value={`$${stats.supplierPaid.toFixed(2)}`} icon="mdi-cash-minus" color="bg-indigo-500" />
                <StatCard title="Supplier Pending" value={`$${Math.abs(stats.supplierPending).toFixed(2)} ${stats.supplierPending >= 0 ? '' : '(Cr)'}`} icon="mdi-truck-fast-outline" color="bg-amber-500" />
            </div>

            <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="card bg-gradient-to-br from-primary-9 to-indigo-700 text-white p-6 lg:p-10 border-0 shadow-xl shadow-primary-9/20">
                    <h3 className="text-xl lg:text-2xl font-bold mb-2">Quick Actions</h3>
                    <p className="text-white/70 mb-6 lg:mb-8 font-medium">Streamline your workflow with these shortcuts.</p>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex flex-col items-center gap-2 border border-white/10">
                            <i className="mdi mdi-plus-circle-outline text-2xl lg:text-3xl"></i>
                            <span className="text-xs lg:text-sm font-bold uppercase tracking-wider">New Sale</span>
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex flex-col items-center gap-2 border border-white/10">
                            <i className="mdi mdi-file-document-outline text-2xl lg:text-3xl"></i>
                            <span className="text-xs lg:text-sm font-bold uppercase tracking-wider">Invoices</span>
                        </button>
                    </div>
                </div>

                <div className="card p-6 lg:p-10 flex flex-col justify-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="mdi mdi-chart-bell-curve-cumulative text-3xl text-slate-400"></i>
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 uppercase tracking-tight">Business Insights</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm lg:text-base">Reports and advanced analytics are coming soon to help you grow faster.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
