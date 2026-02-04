import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { File, LogOut, Search, User, Globe } from 'lucide-react';
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
        <div className="glass-panel p-4 sticky top-6 z-50 mb-8 flex justify-between items-center bg-card/80 backdrop-blur-md border hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <File className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">FileShare</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center bg-black/20 rounded-lg px-4 py-2.5 border border-white/5 focus-within:border-violet-500/50 transition-colors w-64">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

                <Button
                    variant="ghost"
                    onClick={() => navigate('/shares')}
                    className="hidden sm:flex text-gray-400 hover:text-violet-400 gap-2 text-sm"
                >
                    <Globe size={18} />
                    Shares
                </Button>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                        <User size={14} className="text-violet-400" />
                        <span className="text-gray-300 text-sm font-medium">{user?.username}</span>
                    </div>

                    <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg" title="Logout">
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
