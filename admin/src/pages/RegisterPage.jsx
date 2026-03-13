// admin/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminRegister } from '../store/authThunks';
import { clearError } from '../store/authSlice';
import { UserPlus, AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        secretCode: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.secretCode) {
            return;
        }

        const result = await dispatch(adminRegister(formData));
        if (result.payload) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Admin Account</h1>
                    <p className="text-gray-400 mt-2">Join the Quote Text Analysis Team</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                disabled={loading}
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Admin Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@example.com"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Secure password"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 pr-10"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Secret Code */}
                    <div className="mb-8">
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-1.5">
                            <ShieldCheck className="w-4 h-4 text-orange-600" />
                            Admin Activation Secret
                        </label>
                        <input
                            type="password"
                            name="secretCode"
                            value={formData.secretCode}
                            onChange={handleChange}
                            placeholder="Enter special admin code"
                            className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            disabled={loading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.secretCode}
                        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Register Account
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Enterprise Security Protocols Active
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
