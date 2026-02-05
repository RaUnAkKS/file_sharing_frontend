export const getFileUrl = (filePath) => {
    if (!filePath) return '';

    // If it's already an absolute URL (Cloudinary or other), return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    // Otherwise, assume it's relative to the API root
    // We need to strip '/api' from the end of VITE_API_URL to get the base domain
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
    const rootUrl = apiBase.replace(/\/api\/?$/, ''); // Remove trailing /api or /api/

    // Ensure filePath starts with a slash if needed
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

    return `${rootUrl}${cleanPath}`;
};
