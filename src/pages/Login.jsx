import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Layers, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, bounce away
    useEffect(() => {
        if (isAuthenticated) navigate(from, { replace: true });
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(username.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.detail || 'Unable to log in. Please try again.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-6 overflow-hidden">
            {/* Background gradient + soft blobs */}
            <div className="absolute inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg,#1A1A2E 0%,#0F1729 45%,#2D1810 100%)',
                }} />
            <div className="absolute -z-10 top-[-15%] left-[-10%] w-[480px] h-[480px] rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle,#C8963E,transparent 65%)' }} />
            <div className="absolute -z-10 bottom-[-15%] right-[-10%] w-[520px] h-[520px] rounded-full opacity-25 blur-3xl"
                style={{ background: 'radial-gradient(circle,#E8B86D,transparent 65%)' }} />

            {/* Glass card */}
            <div className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/15"
                style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                }}>
                {/* Brand */}
                <div className="flex flex-col items-center mb-7">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: 'linear-gradient(135deg,#C8963E,#E8B86D)' }}>
                        <Layers size={28} color="#fff" />
                    </div>
                    <h1 className="text-white font-bold text-xl tracking-tight">Worker Management</h1>
                    <div className="w-12 h-px bg-white/30 mt-3" />
                </div>

                <h2 className="text-white text-3xl font-bold text-center mb-7">Log In</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-white/70 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            autoComplete="username"
                            className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40
                                       focus:outline-none focus:bg-white/15 focus:border-[#C8963E] transition-colors"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-white/70 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40
                                           focus:outline-none focus:bg-white/15 focus:border-[#C8963E] transition-colors"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1"
                                tabIndex={-1}
                                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember me */}
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-4 h-4 rounded accent-[#C8963E]"
                        />
                        Remember me
                    </label>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-300 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !username || !password}
                        className="w-full h-12 rounded-xl font-bold text-white tracking-wide flex items-center justify-center gap-2
                                   bg-gradient-to-r from-[#1E2A4A] to-[#2D3F6B] hover:from-[#2D3F6B] hover:to-[#3D5285]
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                        {submitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Logging in...</>
                        ) : 'LOGIN'}
                    </button>
                </form>

                <p className="text-center text-[11px] text-white/40 mt-7 tracking-wider">
                    AUTHORIZED PERSONNEL ONLY
                </p>
            </div>
        </div>
    );
};

export default Login;
