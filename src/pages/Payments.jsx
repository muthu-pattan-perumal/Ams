import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        file: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [p, c, s] = await Promise.all([
                api.get('/payments'),
                api.get('/customers'),
                api.get('/suppliers')
            ]);
            setPayments(p.data);
            setCustomers(c.data);
            setSuppliers(s.data);
        } catch (err) {
            console.error('Error fetching data', err);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result.split(',')[1];
                try {
                    const payload = {
                        fileName: file.name,
                        mimeType: file.type,
                        size: file.size,
                        base64: base64String
                    };
                    const res = await api.post('/files/upload', payload);
                    resolve(res.data.id);
                } catch (err) {
                    console.error('Upload JSON error', err);
                    reject(err);
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleViewFile = async (fileId) => {
        try {
            const res = await api.get(`/files/${fileId}`);
            // Convert Base64 back to Blob URL for robust browser compatibility
            const dataUrl = `data:${res.data.mimeType};base64,${res.data.base64}`;
            const fetchRes = await fetch(dataUrl);
            const blob = await fetchRes.blob();
            const url = URL.createObjectURL(blob);
            setViewingFile({ url, type: res.data.mimeType });
        } catch (err) {
            console.error('Error viewing file', err);
            alert('Failed to load document');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const isCustomer = customers.some(c => c.id === formData.userId);
        const entityList = isCustomer ? customers : suppliers;
        const selectedEntity = entityList.find(e => e.id === formData.userId);

        if (selectedEntity) {
            const pendingBalance = (Number(selectedEntity.balance) || 0) + (Number(selectedEntity.openingBalance) || 0);
            console.log(entityList, pendingBalance, 'pendingBalance', selectedEntity.balance, 'selectedEntity.balance', selectedEntity.openingBalance, 'selectedEntity.openingBalance');
            if (Number(formData.amount) > pendingBalance) {
                alert(`Amount cannot exceed the pending balance of $${pendingBalance}.`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const fileId = await handleFileUpload(formData.file);
            const { file, ...dataToSend } = formData;
            dataToSend.fileId = fileId;
            dataToSend.entityType = isCustomer ? 'Customer' : 'Supplier';

            await api.post('/payments', dataToSend);
            setModalOpen(false);
            fetchData();
            setFormData({ userId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'UPI', file: null });
        } catch (err) {
            console.error('Payment creation error:', err.response?.data || err);
            alert('Error saving payment: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUserName = (id) => {
        const entity = customers.find(c => c.id === id) || suppliers.find(s => s.id === id);
        return entity?.name || 'Unknown';
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Payments</h1>
                    <p className="text-slate-500">Track and manage financial settlements</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary w-full sm:w-auto">
                    <i className="mdi mdi-cash-multiple text-xl"></i>
                    Record Payment
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block card p-0 overflow-hidden shadow-lg border-slate-100 mb-8">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/80">
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Payment</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{getUserName(p.userId)}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="font-black text-primary-9 tracking-tight text-lg">${p.amount.toFixed(2)}</p>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">{p.paymentMode}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {p.fileId ? (
                                            <button type="button" onClick={() => handleViewFile(p.fileId)} className="p-2 text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-all">
                                                <i className="mdi mdi-receipt-outline text-xl"></i>
                                            </button>
                                        ) : (
                                            <span className="text-slate-300 p-2"><i className="mdi mdi-receipt-outline text-xl opacity-20"></i></span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 mb-8">
                {payments.map(p => (
                    <div key={p.id} className="card p-5 border-slate-100 shadow-sm relative">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight mb-1">{getUserName(p.userId)}</h3>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-primary-9 text-lg leading-tight">${p.amount.toFixed(2)}</p>
                                <span className="text-[10px] uppercase font-bold text-slate-500">{p.paymentMode}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Settlement Receipt</span>
                            {p.fileId ? (
                                <button type="button" onClick={() => handleViewFile(p.fileId)} className="text-indigo-600 font-bold text-xs uppercase flex items-center gap-1">
                                    <i className="mdi mdi-receipt-outline text-lg"></i> View
                                </button>
                            ) : (
                                <span className="text-slate-300 text-[10px] font-bold uppercase">No Doc</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 lg:p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Record Payment</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <i className="mdi mdi-close text-xl text-slate-400"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Person</label>
                                <select value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} className="input-field" required>
                                    <option value="">Select Customer/Supplier</option>
                                    <optgroup label="Customers">
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </optgroup>
                                    <optgroup label="Suppliers">
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="0.00" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Method</label>
                                <select value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} className="input-field">
                                    <option value="UPI">UPI / Digital</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proof Document</label>
                                <input type="file" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-primary-9/10 file:text-primary-9 hover:file:bg-primary-9/20 cursor-pointer" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-500 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                    {isSubmitting ? <><i className="mdi mdi-loading mdi-spin text-lg"></i> Saving...</> : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingFile && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex flex-col p-4 animate-in fade-in">
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setViewingFile(null)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
                            <i className="mdi mdi-close text-2xl"></i>
                        </button>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center p-4">
                        {viewingFile.type.startsWith('image/') ? (
                            <img src={viewingFile.url} alt="Document" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <iframe src={viewingFile.url} className="w-full h-full border-0" title="Document Viewer"></iframe>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
