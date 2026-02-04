import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        const res = await register(formData.email, formData.username, formData.password, formData.confirmPassword);
        setLoading(false);

        if (res.success) {
            navigate('/login');
        } else {
            const msg = typeof res.error === 'string' ? res.error : Object.values(res.error).flat().join(', ');
            setError(msg);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-primary">
            <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-white-5 rounded-2xl flex items-center justify-center mb-6">
                        <UserPlus size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join our secure file sharing platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Username"
                        name="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        icon={<User size={18} />}
                    />
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={<Mail size={18} />}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Input
                            label="Confirm"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500-10 border border-red-500-20 text-red-400 text-sm flex items-center gap-2">
                            <ShieldCheck size={16} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                        {!loading && <ArrowRight size={18} />}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <Link to="/login" className="text-violet-400 hover-underline font-medium">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
