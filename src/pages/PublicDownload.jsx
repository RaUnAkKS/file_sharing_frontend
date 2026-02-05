import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Download, Lock, FileArchive, AlertCircle, ShieldCheck, File, HardDrive } from 'lucide-react';

const PublicDownload = () => {
    const { id } = useParams();
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('loading'); // loading, locked, ready, error
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        checkAccess();
    }, [id]);

    const checkAccess = async () => {
        try {
            const res = await api.get(`share/status/${id}/`, {
                withCredentials: true
            });
            const { status: linkStatus, has_password, is_unlocked } = res.data;

            if (linkStatus === 'limit_reached') {
                setStatus('error');
                setError("Download limit reached");
                return;
            } else if (linkStatus === 'expired') {
                setStatus('error');
                setError("Link has expired");
                return;
            } else if (linkStatus === 'inactive') {
                setStatus('error');
                setError("Link is inactive");
                return;
            }

            // If it has password BUT is already unlocked in session, go to ready
            if (has_password && !is_unlocked) {
                setStatus('locked');
            } else {
                setStatus('ready');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setError("Link invalid or expired");
        }
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(`share/access/${id}/`, { password }, { withCredentials: true });
            setStatus('ready');
        } catch (err) {
            setError("Incorrect password");
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await api.get(`share/download/${id}/`, {
                responseType: 'blob',
                withCredentials: true
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'shared_files.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            if (status === 403) {
                setError("Incorrect password required.");
                setStatus('locked');
            } else {
                setError(err.response?.data?.detail || "Download failed. Link may have expired.");
                setStatus('error');
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="w-full max-w-md animate-fade-in relative z-10">
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm mb-6">
                        <ShieldCheck size={16} className="text-green-400" />
                        <span className="text-xs font-medium text-gray-300">Secure File Transfer</span>
                    </div>
                </div>

                {status === 'loading' && (
                    <div className="glass-panel p-8 text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400">Verifying link security...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="glass-panel p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Link Unavailable</h2>
                            <p className="text-gray-400">{error || "This link is invalid or has expired."}</p>
                        </div>
                        <Button variant="secondary" onClick={() => window.location.reload()} className="w-full">
                            Try Again
                        </Button>
                    </div>
                )}

                {status === 'locked' && (
                    <div className="glass-panel p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 mb-4 shadow-lg shadow-violet-500/10">
                                <Lock size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Protected Files</h1>
                            <p className="text-gray-400">Enter the password to access these files</p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-center text-lg tracking-wider"
                            />
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full py-4 text-lg">Unlock Access</Button>
                        </form>
                    </div>
                )}

                {status === 'ready' && (
                    <div className="glass-panel p-8 space-y-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 animate-pulse" />

                        <div className="space-y-4">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-violet-500/30 group">
                                <FileArchive size={48} className="group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white">Files Ready</h1>
                                <p className="text-gray-400">Your secure download is ready.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <HardDrive size={20} className="text-gray-300" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">Shared Bundle</p>
                                    <p className="text-xs text-gray-500">ZIP Archive</p>
                                </div>
                            </div>
                            {/* <div className="text-right">
                                <p className="text-sm font-medium text-white">-- MB</p>
                            </div> */}
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full py-4 text-lg shadow-xl shadow-violet-500/20 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {downloading ? "Downloading..." : "Download Files"}
                                    {!downloading && <Download size={20} className="group-hover:translate-y-1 transition-transform" />}
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Button>

                            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                <ShieldCheck size={12} />
                                scanned for viruses & malware
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">Powered by FileShare</p>
                </div>
            </div>
        </div>
    );
};

export default PublicDownload;
