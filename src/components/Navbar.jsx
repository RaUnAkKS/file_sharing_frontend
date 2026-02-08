import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { File, LogOut, Search, User, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ searchTerm, setSearchTerm, user }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="glass-panel p-4 sticky top-6 z-50 mb-8 bg-card/80 backdrop-blur-md border hover:border-white/20 transition-all">
            <div className="flex justify-between items-center">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <File className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">FileShare</h1>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center bg-black/20 rounded-lg px-4 py-2.5 border border-white/5 focus-within:border-violet-500/50 transition-colors w-64">
                        <Search size={16} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <Button
                        variant="ghost"
                        onClick={() => navigate('/shares')}
                        className="flex text-gray-400 hover:text-violet-400 gap-2 text-sm"
                    >
                        <Globe size={18} />
                        Shares
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                            <User size={14} className="text-violet-400" />
                            <span className="text-gray-300 text-sm font-medium">{user?.username}</span>
                        </div>

                        <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg" title="Logout">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-2 animate-fade-in">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            navigate('/shares');
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex justify-start items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Globe size={18} className="text-violet-400" />
                        <span className="font-medium">Shared Links</span>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full flex justify-start items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                    </Button>

                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center gap-3 px-4 py-2 text-gray-500 text-xs text-center justify-center">
                        <User size={14} />
                        <span>Logged in as <span className="text-gray-400 font-medium">{user?.username}</span></span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
