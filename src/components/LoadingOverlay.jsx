import React from 'react';
import useLoadingStore from '../store/loadingStore';

const LoadingOverlay = () => {
    const isLoading = useLoadingStore((state) => state.isLoading);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
            <div className="relative flex flex-col items-center">
                {/* Logo with Pulse Animation */}
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-primary-9/20 rounded-full animate-ping opacity-75"></div>
                    <img 
                        src="/logo.jpg" 
                        alt="Loading Logo" 
                        className="w-full h-full object-contain rounded-2xl shadow-lg relative z-10 animate-pulse"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=AMS';
                        }}
                    />
                </div>

                {/* Loading Text */}
                <h2 className="text-lg font-bold text-slate-900 mb-2">Processing Request</h2>
                <p className="text-slate-500 text-sm mb-6">Please wait a moment...</p>

                {/* Sleek Progress Bar */}
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-9 animate-progress shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 70%; transform: translateX(0%); }
                    100% { width: 100%; transform: translateX(100%); }
                }
                .animate-progress {
                    animation: progress 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingOverlay;
