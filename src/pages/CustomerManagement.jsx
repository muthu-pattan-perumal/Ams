import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', email: '', openingBalance: 0 });
    const navigate = useNavigate();

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        const res = await api.get('/customers');
        setCustomers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setModalOpen(false);
            fetchCustomers();
            setFormData({ name: '', phone: '', address: '', email: '', openingBalance: 0 });
            setEditingCustomer(null);
        } catch (err) {
            alert('Error saving customer');
        } finally {
            setIsSubmitting(false);
        }
    };
    console.log('customers', customers);
    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Customer Management</h1>
                    <p className="text-slate-500">Manage business clients and ledgers</p>
                </div>
                <button onClick={() => { setEditingCustomer(null); setFormData({ name: '', phone: '', address: '', email: '', openingBalance: 0 }); setModalOpen(true); }} className="btn-primary w-full sm:w-auto">
                    <i className="mdi mdi-plus text-xl"></i>
                    Add New Customer
                </button>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block card p-0 overflow-hidden shadow-lg border-slate-100 mb-8">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/80">
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Balance</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                                <i className="mdi mdi-account text-xl"></i>
                                            </div>
                                            <div className="min-w-0">
                                                <button onClick={() => navigate(`/ledger/customer/${c.id}`)} className="font-bold text-slate-900 truncate hover:text-primary-9 hover:underline transition-all block">
                                                    {c.name}
                                                </button>
                                                <p className="text-xs text-slate-500 truncate">{c.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <p className={`font-black tracking-tight text-lg ${c.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                            ${Math.abs((Number(c.balance) || 0) + (Number(c.openingBalance) || 0)).toFixed(2)}
                                            <span className="ml-1 text-[10px] uppercase font-bold opacity-50">
                                                {(c.balance + c.openingBalance) >= 0 ? 'Dr' : 'Cr'}
                                            </span>
                                        </p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => navigate(`/ledger/customer/${c.id}`)} className="p-2 text-slate-400 hover:text-primary-9 hover:bg-primary-9/10 rounded-lg transition-all" title="View Ledger">
                                                <i className="mdi mdi-book-open-variant text-xl"></i>
                                            </button>
                                            <button onClick={() => { setEditingCustomer(c); setFormData(c); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-all" title="Edit">
                                                <i className="mdi mdi-pencil text-xl"></i>
                                            </button>
                                            <button onClick={async () => { if (confirm('Delete customer?')) { await api.delete(`/customers/${c.id}`); fetchCustomers(); } }} className="p-2 text-slate-400 hover:text-error-main hover:bg-error-main/10 rounded-lg transition-all" title="Delete">
                                                <i className="mdi mdi-delete text-xl"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4 mb-8">
                {customers.map(c => (
                    <div key={c.id} className="card p-5 border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${c.balance >= 0 ? 'bg-primary-9' : 'bg-rose-500'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    {c.name[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate leading-tight">{c.name}</h3>
                                    <p className="text-xs text-slate-500">{c.phone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black text-lg leading-tight ${(c.balance + c.openingBalance) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                    ${Math.abs(c.balance + c.openingBalance).toFixed(2)}
                                </p>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4">
                            <button onClick={() => navigate(`/ledger/customer/${c.id}`)} className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-primary-9 transition-all">
                                <i className="mdi mdi-book-open-variant text-xl"></i>
                                <span className="text-[10px] font-bold uppercase">Ledger</span>
                            </button>
                            <button onClick={() => { setEditingCustomer(c); setFormData(c); setModalOpen(true); }} className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-indigo-600 transition-all">
                                <i className="mdi mdi-pencil text-xl"></i>
                                <span className="text-[10px] font-bold uppercase">Edit</span>
                            </button>
                            <button onClick={async () => { if (confirm('Delete?')) { await api.delete(`/customers/${c.id}`); fetchCustomers(); } }} className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-error-main transition-all">
                                <i className="mdi mdi-delete text-xl"></i>
                                <span className="text-[10px] font-bold uppercase">Delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 lg:p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <i className="mdi mdi-close text-xl text-slate-400"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company / Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opening Balance</label>
                                <input type="number" step="0.01" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input-field h-24 resize-none" required />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-500 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                    {isSubmitting ? <><i className="mdi mdi-loading mdi-spin text-lg"></i> Saving...</> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
