import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import Button from './ui/Button';
import Input from './ui/Input';
import { X, Copy, Check, Link as LinkIcon, Lock, Clock, Download, Globe } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, files, isShareAll }) => {
    const [password, setPassword] = useState('');
    const [maxDownloads, setMaxDownloads] = useState('');
    const [expiryHours, setExpiryHours] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [linkDetails, setLinkDetails] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setMaxDownloads('');
            setExpiryHours('');
            setGeneratedLink('');
            setCopied(false);
            setError('');
            setLinkDetails(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreateLink = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = {};

            if (isShareAll) {
                payload.share_all = true;
                // Don't send files array when sharing all
            } else {
                payload.files = files.map(f => f.id);
            }

            if (password) payload.password = password;
            if (maxDownloads) payload.max_downloads = parseInt(maxDownloads);

            // Calculate expiry datetime if hours provided
            if (expiryHours) {
                const date = new Date();
                date.setHours(date.getHours() + parseInt(expiryHours));
                payload.expires_at = date.toISOString();
            }

            const res = await api.post('share/create/', payload);
            const linkId = res.data.id;
            setLinkDetails(res.data);
            const fullLink = `${window.location.origin}/share/download/${linkId}`;
            setGeneratedLink(fullLink);
        } catch (err) {
            console.error(err);
            setError("Failed to create link");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel w-full max-w-lg p-6 space-y-6 relative border border-white/10 shadow-2xl animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="space-y-1 pr-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Globe className="text-violet-400" size={20} />
                        </div>
                        Create Share Link
                    </h2>
                    <p className="text-sm text-gray-400">
                        Generate a secure link for <span className="text-white font-medium">
                            {isShareAll ? 'all files' : `${files.length} file${files.length !== 1 ? 's' : ''}`}
                        </span>
                    </p>
                </div>

                {!generatedLink ? (
                    <div className="space-y-6">
                        <div className="space-y-5">
                            <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock size={14} /> Security Settings
                                </h3>
                                <Input
                                    label="Password Protection (Optional)"
                                    type="password"
                                    placeholder="Set a password to protect files"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                // icon={<Lock size={16} />}
                                />
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Clock size={14} /> Limits (Optional)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Max Downloads"
                                        type="number"
                                        placeholder="e.g. 5"
                                        value={maxDownloads}
                                        onChange={(e) => setMaxDownloads(e.target.value)}
                                        icon={<Download size={16} />}
                                    />
                                    <Input
                                        label="Expires In (Hours)"
                                        type="number"
                                        placeholder="e.g. 24"
                                        value={expiryHours}
                                        onChange={(e) => setExpiryHours(e.target.value)}
                                        icon={<Clock size={16} />}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                            <Button onClick={handleCreateLink} disabled={loading} className="flex-1">
                                {loading ? "Creating Link..." : "Create Secure Link"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center flex items-center justify-center gap-2">
                            <Check size={16} />
                            Link created successfully
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Share Link</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-sm font-mono text-gray-300 truncate">
                                    {generatedLink}
                                </div>
                                <Button onClick={copyToClipboard} variant="secondary" className="px-3 shrink-0">
                                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </Button>
                            </div>
                        </div>

                        {linkDetails && (
                            <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
                                <h3 className="text-sm font-medium text-gray-300">Link Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                                    {linkDetails.expires_at && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-500 uppercase tracking-wider text-[10px]">Expires</span>
                                            <div className="flex items-center gap-1.5 text-gray-300">
                                                <Clock size={12} />
                                                {new Date(linkDetails.expires_at).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                    {linkDetails.max_downloads && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-500 uppercase tracking-wider text-[10px]">Downloads</span>
                                            <div className="flex items-center gap-1.5 text-gray-300">
                                                <Download size={12} />
                                                {linkDetails.max_downloads} max
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ShareModal;
