import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getFileUrl } from '../utils/fileUrl';
import Button from '../components/ui/Button';
import ShareModal from '../components/ShareModal';
import Navbar from '../components/Navbar';
import { Upload, FileText, Share2, Trash2, File, Image, Music, Video, Archive, MoreVertical, Search, Download, Clock, ExternalLink } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [isShareAll, setIsShareAll] = useState(false);
    const [filesToShare, setFilesToShare] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            await uploadFiles(droppedFiles);
        }
    };

    const [nextCursor, setNextCursor] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async (cursor = null) => {
        try {
            const url = cursor ? cursor : 'files/list/';
            // If it's a cursor URL (absolute), we might need to handle it, but axios baseURL handles 'files/list/'
            // The cursor returned by backend usually is full URL. We should use it carefully.
            // If using axios with baseURL, full URL might be issues if duplicates. 
            // Better to strip baseURL if present or just use the path.

            // Actually, cursor returned by DRF is usually absolute URL. 
            // api.get(url) might append baseURL if url is not absolute.
            // If cursor is absolute, axios handles it?

            const res = await api.get(url);

            // Checks if paginated response
            if (res.data.results) {
                if (cursor) {
                    setFiles(prev => [...prev, ...res.data.results]);
                } else {
                    setFiles(res.data.results);
                }
                setNextCursor(res.data.next);
            } else {
                // Fallback for non-paginated
                setFiles(res.data);
                setNextCursor(null);
            }
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setLoading(false);
        }
    };

    const uploadFiles = async (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i]);
            }

            const res = await api.post('files/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.files) {
                setFiles(prev => [...res.data.files, ...prev]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = async (e) => {
        await uploadFiles(e.target.files);
    };

    const handleShareClick = (file) => {
        setFilesToShare([file]);
        setIsShareAll(false);
        setShareModalOpen(true);
    };

    const handleShareAll = () => {
        if (files.length === 0) return;
        setFilesToShare([]);
        setIsShareAll(true);
        setShareModalOpen(true);
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`files/delete/${fileId}/`);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete ALL files? This cannot be undone.")) return;
        try {
            await api.delete('files/delete-all/');
            setFiles([]);
        } catch (err) {
            console.error("Delete all failed", err);
            alert("Failed to delete all files");
        }
    };



    // Component for handling file previews to manage image state properly
    const FilePreview = ({ file }) => {
        const [imgError, setImgError] = useState(false);
        const ext = file.original_filename.split('.').pop().toLowerCase();

        const fileSrc = getFileUrl(file.file);
        const fileUrl = `${fileSrc}?t=${new Date(file.uploaded_at).getTime()}`;

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) && !imgError) {
            return (
                <div className="w-full h-full relative group-hover:scale-105 transition-transform">
                    <img
                        src={fileUrl}
                        alt={file.original_filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error("Image load error:", fileUrl);
                            setImgError(true);
                        }}
                    />
                </div>
            );
        }

        // Fallback Icons
        if (['mp4', 'mov', 'avi'].includes(ext)) return <Video size={32} className="text-red-400 opacity-80" />;
        if (['mp3', 'wav'].includes(ext)) return <Music size={32} className="text-yellow-400 opacity-80" />;
        if (['zip', 'rar', '7z'].includes(ext)) return <Archive size={32} className="text-orange-400 opacity-80" />;
        return <FileText size={32} className="text-blue-400 opacity-80" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(f => f.original_filename.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen p-6 container relative z-10 mx-auto max-w-7xl">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user} />

            {/* Upload Area */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
            />





            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`glass-panel p-10 border-dashed border-2 ${isDragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10'} hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group mb-10 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className="p-4 bg-violet-500/10 rounded-full text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300 shadow-lg shadow-violet-500/10">
                    <Upload size={32} className={uploading ? "animate-bounce" : ""} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors">{uploading ? "Uploading..." : "Upload Files"}</h3>
                    <p className="text-gray-400">Drag & drop files here or click to browse</p>
                </div>
            </div>

            {/* File List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        Your Files
                        <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-gray-400">{filteredFiles.length}</span>
                    </h2>
                    {files.length > 0 && (
                        <div className="flex gap-3 w-full sm:w-auto justify-end">
                            <Button
                                onClick={() => handleDeleteAll()}
                                variant="secondary"
                                className="flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400 border-red-500/20 text-sm"
                            >
                                <Trash2 size={16} />
                                Delete All
                            </Button>
                            <Button
                                onClick={handleShareAll}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Share2 size={16} />
                                Share All
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading your library...</div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center gap-6 border border-dashed border-white/5 rounded-2xl bg-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                            <File size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-300">No files yet</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Upload your first file to get started sharing securely.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                        {filteredFiles.map(file => {
                            // IMPROVED LOGIC: Check content_type OR extension
                            const isImage = (file.content_type && file.content_type.startsWith('image/')) ||
                                ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.original_filename.split('.').pop().toLowerCase());

                            return (
                                <div
                                    key={file.id}
                                    className="glass-panel p-3 flex flex-col gap-3 group hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 border border-white/10 hover:border-violet-500/30 relative overflow-hidden cursor-pointer h-[240px]"
                                    onClick={() => {
                                        let fileSrc = file.file;
                                        if (!fileSrc.startsWith('http')) {
                                            const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
                                            const rootUrl = apiBase.replace(/\/api\/?$/, '');
                                            fileSrc = `${rootUrl}${file.file}`;
                                        }
                                        window.open(fileSrc, '_blank');
                                    }}
                                >
                                    {/* Preview Area */}
                                    <div className="relative w-full flex-1 bg-white/5 rounded-lg overflow-hidden group-hover:bg-violet-500/10 transition-colors flex items-center justify-center">
                                        <FilePreview file={file} />
                                    </div>

                                    {/* Info Area */}
                                    <div className="space-y-1 w-full shrink-0">
                                        <h4 className="font-medium text-gray-200 truncate text-sm" title={file.original_filename}>{file.original_filename}</h4>

                                        <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                                                    {formatSize(file.file_size)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(file.id);
                                                }}
                                                className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors border border-white/5"
                                                title="Delete file"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {nextCursor && (
                    <div className="flex justify-center pb-10 mt-4">
                        <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => fetchFiles(nextCursor)}
                            className="bg-white/5 hover:bg-white/10 text-white min-w-[150px]"
                        >
                            {loading ? "Loading..." : "Load More"}
                        </Button>
                    </div>
                )}
            </div>




            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                files={filesToShare}
                isShareAll={isShareAll}
            />
        </div >
    );
};

export default Dashboard;
