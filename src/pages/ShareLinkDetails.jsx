import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import { File, ArrowLeft, Download, Eye, Grid, List } from 'lucide-react';

const ShareLinkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchFiles();
    }, [id]);

    const fetchFiles = async (nextCursor = null) => {
        try {
            const url = nextCursor || `share/${id}/files/`;
            const res = await api.get(url);

            if (nextCursor) {
                setFiles(prev => [...prev, ...res.data.results]);
            } else {
                setFiles(res.data.results);
            }

            setHasMore(!!res.data.next);
            setCursor(res.data.next);
        } catch (error) {
            console.error("Failed to fetch share details", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (hasMore && cursor) {
            fetchFiles(cursor);
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <Navbar hideSearch user={{ username: 'Me' }} />

                <div className="flex items-center justify-between mb-8 mt-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/shares')}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                Shared Files
                                <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-gray-400">{totalCount}</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-mono mt-1">{id}</p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {loading && files.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl bg-white/5">
                        <p className="text-gray-400">No files found in this share link.</p>
                    </div>
                ) : (
                    <>
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}>
                            {files.map(file => (
                                <div key={file.id} className={`glass-panel group relative overflow-hidden transition-all duration-300 ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'aspect-square flex flex-col'}`}>

                                    {/* Preview / Icon Area */}
                                    <div className={viewMode === 'list' ? "w-10 h-10 shrink-0 bg-white/5 rounded-lg flex items-center justify-center" : "flex-1 bg-black/20 flex items-center justify-center relative overflow-hidden"}>
                                        {file.content_type?.startsWith('image/') ? (
                                            <img
                                                src={file.file}
                                                alt={file.original_filename}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <File className="text-violet-400" size={viewMode === 'list' ? 20 : 32} />
                                        )}

                                        {/* Grid View Overlay */}
                                        {viewMode === 'grid' && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                <a
                                                    href={file.file}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                                    title="View Original"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Area */}
                                    <div className={`p-3 ${viewMode === 'grid' ? 'bg-card/50 border-t border-white/5' : 'flex-1 min-w-0 flex items-center justify-between'}`}>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-gray-200 truncate" title={file.original_filename}>{file.original_filename}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.file_size)}</p>
                                        </div>

                                        {/* List View Actions */}
                                        {viewMode === 'list' && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`${api.defaults.baseURL}${file.file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-8 text-center">
                                <Button variant="secondary" onClick={loadMore}>
                                    Load More Files
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShareLinkDetails;
