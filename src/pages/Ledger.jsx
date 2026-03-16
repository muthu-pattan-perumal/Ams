import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Ledger = () => {
    const { type, id } = useParams();
    const [entity, setEntity] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type, id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [entityRes, transRes] = await Promise.all([
                api.get(`/${type}s/${id}`),
                api.get(`/transactions?${type}Id=${id}`)
            ]);
            setEntity(entityRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error('Error fetching ledger', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading ledger...</div>;
    if (!entity) return <div className="text-center py-20 text-error-main font-bold">Entity not found</div>;

    // Calculate Ledger
    let runningBalance = entity.openingBalance;
    const ledgerEntries = transactions.slice().reverse().map(t => {
        const debit = t.type === 'Pay' ? t.amount : 0;
        const credit = t.type === 'Receive' ? t.amount : 0;
        runningBalance = runningBalance + (type === 'customer' ? (debit - credit) : (credit - debit));
        return {
            ...t,
            debit,
            credit,
            balance: runningBalance
        };
    }).reverse();

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${type === 'customer' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        <i className={`mdi ${type === 'customer' ? 'mdi-account' : 'mdi-truck'} text-3xl lg:text-5xl`}></i>
                    </div>
                    <div>
                        <span className="text-[10px] lg:text-xs font-black text-primary-9 uppercase tracking-widest">{type} Statment</span>
                        <h1 className="text-2xl lg:text-5xl font-black mt-1 tracking-tight text-slate-900">{entity.name}</h1>
                        <p className="text-slate-500 mt-1 font-bold text-xs lg:text-base opacity-60"><i className="mdi mdi-phone mr-1"></i> {entity.phone}</p>
                    </div>
                </div>
                <div className="w-full lg:w-auto p-4 lg:p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Current Balance</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl lg:text-4xl font-black tabular-nums">
                            ${Math.abs((Number(runningBalance) || 0)).toFixed(2)}
                        </h2>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${runningBalance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {Number(runningBalance) >= 0 ? 'DR' : 'CR'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden shadow-lg border-slate-100">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/80">
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Debit (+)</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Credit (-)</th>
                                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <tr className="bg-slate-50/30">
                                <td className="px-6 py-5">
                                    <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Opening</p>
                                    <p className="text-xs text-slate-400 italic">Account started</p>
                                </td>
                                <td className="px-6 py-5 text-right">-</td>
                                <td className="px-6 py-5 text-right">-</td>
                                <td className="px-6 py-5 text-right font-black text-slate-400 tabular-nums">${entity.openingBalance.toFixed(2)}</td>
                            </tr>
                            {ledgerEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">{new Date(entry.date).toLocaleDateString()}</p>
                                        <p className="font-bold text-slate-900 group-hover:text-primary-9 transition-all text-sm">{entry.notes || 'Transaction'}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-rose-600 tabular-nums">
                                        {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-emerald-600 tabular-nums">
                                        {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                                    </td>
                                    <td className={`px-6 py-5 text-right font-black tabular-nums lg:text-lg ${entry.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                        ${Math.abs(entry.balance).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 no-print">
                <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                    <i className="mdi mdi-printer text-lg text-primary-9"></i> Print Ledger
                </button>
            </div>
        </div>
    );
};

export default Ledger;
