import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Error handled by store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-9 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-primary-9/20">
                        <i className="mdi mdi-finance"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to manage your accounts</p>
                </div>

                {error && (
                    <div className="bg-error-main/10 text-error-main p-4 rounded-lg mb-6 flex items-center gap-3">
                        <i className="mdi mdi-alert-circle text-xl"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                        </label>

                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="mdi mdi-email text-slate-400 text-lg"></i>
                            </span>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="admin@ams.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <div className="relative">
                            {/* 🔒 Left Icon */}
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="mdi mdi-lock text-slate-400 text-lg"></i>
                            </span>

                            {/* 🔑 Input */}
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="password123"
                                required
                            />

                            {/* 👁️ Eye Icon */}
                            <span
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                            >
                                <i
                                    className={`mdi ${showPassword ? "mdi-eye-off" : "mdi-eye"
                                        } text-slate-500 text-lg`}
                                ></i>
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-primary-9/20 disabled:opacity-50"
                    >
                        {loading ? <i className="mdi mdi-loading mdi-spin"></i> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>© 2026 AMS System V1.0</p>
                    <button
                        type="button"
                        onClick={() => alert(`API Base URL: ${import.meta.env.VITE_API_URL || '/api'}`)}
                        className="mt-4 text-[10px] text-slate-400 hover:text-primary-9 underline underline-offset-2"
                    >
                        Show Debug Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
