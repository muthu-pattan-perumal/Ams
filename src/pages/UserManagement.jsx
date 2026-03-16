import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'Customer' });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        const res = await api.get('/users');
        setUsers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            setModalOpen(false);
            fetchUsers();
            setFormData({ name: '', email: '', phone: '', password: '', role: 'Customer' });
            setEditingUser(null);
        } catch (err) {
            alert('Error saving user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
                    <p className="text-slate-500">Manage system access and permissions</p>
                </div>
                <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="btn-primary w-full sm:w-auto">
                    <i className="mdi mdi-plus text-xl"></i>
                    Add New User
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card p-0 overflow-hidden shadow-lg border-slate-100 mb-8">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/80">
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-9/10 flex items-center justify-center text-primary-9 font-bold shrink-0">
                                                {u.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => { setEditingUser(u); setFormData(u); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-9 hover:bg-primary-9/10 rounded-lg transition-all" title="Edit">
                                                <i className="mdi mdi-pencil text-xl"></i>
                                            </button>
                                            <button onClick={async () => { if (confirm('Delete user?')) { await api.delete(`/users/${u.id}`); fetchUsers(); } }} className="p-2 text-slate-400 hover:text-error-main hover:bg-error-main/10 rounded-lg transition-all" title="Delete">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mb-8">
                {users.map(u => (
                    <div key={u.id} className="card p-5 border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-9/10 flex items-center justify-center text-primary-9 font-bold">
                                    {u.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{u.name}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">{u.role}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {u.role}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{u.email}</p>
                        <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
                            <button onClick={() => { setEditingUser(u); setFormData(u); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-9 transition-all">
                                <i className="mdi mdi-pencil text-xl"></i>
                            </button>
                            <button onClick={async () => { if (confirm('Delete?')) { await api.delete(`/users/${u.id}`); fetchUsers(); } }} className="p-2 text-slate-400 hover:text-error-main transition-all">
                                <i className="mdi mdi-delete text-xl"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 lg:p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'New User'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <i className="mdi mdi-close text-xl text-slate-400"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input-field">
                                        <option value="Admin">Admin</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Customer">Customer</option>
                                        <option value="Supplier">Supplier</option>
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-field" required />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-500 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                    {isSubmitting ? <><i className="mdi mdi-loading mdi-spin text-lg"></i> Saving...</> : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
