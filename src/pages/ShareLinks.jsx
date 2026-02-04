import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { Clock, Download, Globe, Lock, Trash2, ExternalLink, Copy, Check } from 'lucide-react';

const ShareLinks = () => {
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [filter, setFilter] = useState('all');

    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        setLinks([]); // Clear links on filter change to avoid stale data
        fetchLinks();
    }, [filter]);

    const fetchLinks = async (nextCursor = null) => {
        try {
            setLoading(true);
            let url = `share/list/`;
            if (nextCursor) {
                url = nextCursor;
                // Cursor URL from backend is usually full URL (e.g. http://localhost/api/share/list/?cursor=...), 
                // but axios baseURL is set. 
                // If backend returns absolute URL, axios will double prepend if we are not careful.
                // Usually DRF returns absolute URL.
                // Ideally we just extract the 'cursor' query param or handle it.
                // For simplicity, let's assume standard behavior or just use the query param if possible.
                // Accessing `res.data.next` gives "http://..."
            } else {
                const query = filter === 'all' ? '' : `?search=${filter}`;
                url = `share/list/${query}`;
            }

            // To avoid absolute URL issues with axios instance, we can extract the relative path or just use axios(url) if it detects absolute.
            // But let's refine:
            // If nextCursor is passed, it is the full URL `http://...`.
            // Let's rely on `api.get(url)` handling absolute URLs correct (axios usually does not auto-prepend baseURL if url starts with http).

            const res = await api.get(url);

            // Backend structure: { next: ..., previous: ..., results: { count: ..., results: [...] } }
            const dataPacket = res.data.results; // This contains { count: ..., results: [...] }
            const newLinks = dataPacket.results || [];

            // Set total count from backend response
            setTotalCount(dataPacket.count || 0);

            if (nextCursor) {
                setLinks(prev => [...prev, ...newLinks]);
            } else {
                setLinks(newLinks);
            }

            setCursor(res.data.next);
            setHasMore(!!res.data.next);

        } catch (error) {
            console.error("Failed to fetch links", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (cursor) {
            fetchLinks(cursor);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will disable the link immediately.")) return;
        try {
            await api.delete(`share/delete/${id}/`);
            setLinks(links.filter(l => l.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const copyLink = (id) => {
        const url = `${window.location.origin}/share/download/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredLinks = links.filter(link =>
        link.id.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} hideSearch user={{ username: 'Me' }} />

                <div className="flex items-center justify-between mb-8 mt-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Globe className="text-violet-400" size={24} />
                        </div>
                        Active Shares
                        <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-gray-400">{totalCount}</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-colors cursor-pointer min-w-[140px]"
                            >
                                <option value="all" className="bg-[#1a1a1a]">All Status</option>
                                <option value="active" className="bg-[#1a1a1a]">Active Only</option>
                                <option value="inactive" className="bg-[#1a1a1a]">Inactive Only</option>
                            </select>
                        </div>
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                            Back to Files
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading shared links...</div>
                ) : filteredLinks.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center gap-6 border border-dashed border-white/5 rounded-2xl bg-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                            <Globe size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-300">No active shares</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Create a link from your dashboard to see it here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLinks.map(link => (
                            <div
                                key={link.id}
                                onClick={() => navigate(`/shares/${link.id}`)}
                                className="glass-panel p-5 space-y-4 group hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${link.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${link.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {link.is_active ? 'Active' : 'Expired'}
                                                </span>
                                                {link.has_password && <Lock size={12} className="text-yellow-500" />}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-1 truncate w-32" title={link.id}>
                                                {link.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => copyLink(link.id)}
                                            className="p-1.5 bg-white/5 hover:bg-violet-500/20 rounded-lg text-gray-400 hover:text-violet-400 transition-colors"
                                            title="Copy Link"
                                        >
                                            {copiedId === link.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                        </button>
                                        <button
                                            onClick={() => window.open(`${window.location.origin}/share/download/${link.id}`, '_blank')}
                                            className="p-1.5 bg-white/5 hover:bg-blue-500/20 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                            title="Visit"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                    <div className="bg-white/5 rounded-lg p-2 space-y-1">
                                        <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                            <Download size={10} /> Downloads
                                        </div>
                                        <div className="text-sm font-medium text-gray-200">
                                            {link.download_count} <span className="text-gray-600">/ {link.max_downloads}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 space-y-1">
                                        <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                            <Clock size={10} /> Expires
                                        </div>
                                        <div className="text-xs font-medium text-gray-200">
                                            {new Date(link.expires_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="mt-8 text-center pb-8">
                        <Button variant="secondary" onClick={loadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareLinks;
