import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else if (!isSidebarOpen) setSidebarOpen(false); // keep closed if already closed on resize
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname, isMobile]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: 'mdi-view-dashboard' },
        { name: 'Users', path: '/users', icon: 'mdi-account-group', adminOnly: true },
        { name: 'Customers', path: '/customers', icon: 'mdi-account-details' },
        { name: 'Suppliers', path: '/suppliers', icon: 'mdi-truck' },
        { name: 'Transactions', path: '/transactions', icon: 'mdi-swap-horizontal' },
        { name: 'Payments', path: '/payments', icon: 'mdi-cash' },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || user.role === 'Admin');

    return (
        <div className="min-h-screen flex text-slate-800 bg-surface-secondary">
            {/* Sidebar Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-40 
                    ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-9 rounded-lg flex items-center justify-center text-white shrink-0">
                        <i className="mdi mdi-finance text-xl"></i>
                    </div>
                    {(isSidebarOpen || isMobile) && <span className="font-bold text-lg whitespace-nowrap">AMS System</span>}
                </div>

                <nav className="px-4 py-4 overflow-y-auto h-[calc(100%-160px)] no-scrollbar">
                    <ul className="space-y-1">
                        {filteredNavItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}
                                >
                                    <i className={`mdi ${item.icon} text-xl shrink-0`}></i>
                                    {(isSidebarOpen || isMobile) && <span className="truncate">{item.name}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-100 absolute bottom-0 w-full bg-white">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error-main hover:bg-error-main/10 transition-all ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}
                    >
                        <i className="mdi mdi-logout text-xl shrink-0"></i>
                        {(isSidebarOpen || isMobile) && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Topbar */}
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
                    >
                        <i className="mdi mdi-menu text-2xl"></i>
                    </button>

                    <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-sm lg:text-base leading-tight">{user?.name}</p>
                            <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-9/10 rounded-full flex items-center justify-center border border-primary-9/20 shadow-sm font-bold text-primary-9 text-xs lg:text-base">
                            {user?.name?.[0]}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
