import React, { useState } from 'react';
import {
    X,
    Phone,
    ArrowRight,
    Shield,
    MessageSquare,
    CheckCircle,
    User,
    Mail,
    Lock,
    Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { countries } from '../constants/countries';
import { Search, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

const MobileAuthModal = ({ isOpen, onClose, onSuccess, initialEmail = '', verifyOnly = false }) => {
    const { signup: register, login, sendOtp, verifyOtp } = useAuth();

    const buildFullPhoneNumber = () => {
        const sanitizedCountryCode = String(countryCode || '').replace(/[^\d+]/g, '');
        let sanitizedLocalNumber = String(mobileNumber || '').replace(/\D/g, '');

        if (sanitizedCountryCode.startsWith('+') && sanitizedLocalNumber.startsWith('0')) {
            sanitizedLocalNumber = sanitizedLocalNumber.replace(/^0+/, '');
        }

        return `${sanitizedCountryCode}${sanitizedLocalNumber}`;
    };

    const [step, setStep] = useState('mobile'); // mobile, otp, signup
    const [loading, setLoading] = useState(false);

    // Data State
    const [countryCode, setCountryCode] = useState('+61');
    const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === '+61') || countries[0]);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        email: initialEmail || '',
        password: '',
        confirmPassword: ''
    });

    // UI State for Searchable Dropdown
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Filter countries based on search
    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.includes(searchTerm) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    // --- Step 1: Mobile Input Logic ---
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();

        const fullPhone = buildFullPhoneNumber();
        if (!mobileNumber || mobileNumber.length < 7) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        try {
            const result = await sendOtp(fullPhone);
            if (result.success) {
                toast.success(`OTP sent to ${countryCode} ${mobileNumber}`);
                setStep('otp');
            } else {
                toast.error(result.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Step 2: OTP Verification Logic ---
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        const fullPhone = buildFullPhoneNumber();
        setLoading(true);
        try {
            const result = await verifyOtp(fullPhone, enteredOtp);
            if (result.success) {
                toast.success(result.existingUser ? 'Mobile verified and account signed in.' : 'Mobile verified successfully!');

                if (verifyOnly) {
                    onSuccess({
                        phone: fullPhone,
                        user: result.user || null,
                        existingUser: Boolean(result.existingUser)
                    });
                    onClose();
                } else {
                    setStep('signup');
                }
            } else {
                toast.error(result.error || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get flag URL
    const getFlagUrl = (iso) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;

    // --- Step 3: Signup Logic ---
    const handleSignup = async (e) => {
        e.preventDefault();

        if (userDetails.password !== userDetails.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!userDetails.email || !userDetails.firstName || !userDetails.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Create user object with mobile number included
            const userData = {
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                password: userDetails.password,
                phone: buildFullPhoneNumber(), // Add phone to user profile
                isPhoneVerified: true
            };

            // Call AuthProvider register
            const result = await register(userData);

            if (result.success) {
                toast.success('Account created successfully!');
                if (onSuccess) onSuccess(result.user);
                onClose();
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('Something went wrong during signup');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-in-center animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        {step === 'mobile' ? 'Verify Mobile' : step === 'otp' ? 'Enter Code' : 'Complete Setup'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8">
                        <div className={`h-1 flex-1 rounded-full ${step === 'mobile' ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step === 'otp' ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step === 'signup' ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                    </div>

                    {step === 'mobile' && (
                        <form onSubmit={handleSendOtp} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                    <Phone className="w-10 h-10 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Verify your mobile</h2>
                                <p className="text-gray-500 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">We'll send a secure 6-digit code to your phone to protect your account.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Mobile Number</label>
                                <div className="flex gap-2 relative" ref={dropdownRef}>
                                    {/* Custom Searchable Dropdown */}
                                    <div className="relative flex-shrink-0 w-[110px]">
                                        <button
                                            type="button"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm hover:border-orange-500 transition-all outline-none"
                                        >
                                            <span className="flex items-center gap-2">
                                                <img
                                                    src={getFlagUrl(selectedCountry.country)}
                                                    alt={selectedCountry.name}
                                                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                                />
                                                <span className="font-bold text-gray-900">{selectedCountry.code}</span>
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute top-full left-0 mt-3 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                                    <Search className="w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search country or code..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full bg-transparent text-sm outline-none font-medium placeholder:text-gray-400"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                                                    {filteredCountries.length > 0 ? (
                                                        filteredCountries.map((c) => (
                                                            <button
                                                                key={`${c.country}-${c.code}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setCountryCode(c.code);
                                                                    setSelectedCountry(c);
                                                                    setShowDropdown(false);
                                                                    setSearchTerm('');
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 ${countryCode === c.code && selectedCountry.country === c.country ? 'bg-orange-50' : ''}`}
                                                            >
                                                                <img
                                                                    src={getFlagUrl(c.country)}
                                                                    alt={c.name}
                                                                    className="w-6 h-4 object-cover rounded shadow-sm border border-gray-200"
                                                                />
                                                                <div className="flex flex-1 flex-col items-start">
                                                                    <span className="text-sm font-bold text-gray-900 leading-tight">{c.name}</span>
                                                                    <span className="text-xs text-gray-500">{c.code}</span>
                                                                </div>
                                                                {countryCode === c.code && selectedCountry.country === c.country && (
                                                                    <CheckCircle className="w-4 h-4 text-orange-500" />
                                                                )}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">No countries found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Mobile number"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Send Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-6 text-center animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                    <MessageSquare className="w-10 h-10 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security Check</h2>
                                <p className="text-gray-500 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">
                                    We've sent a code to <span className="font-bold text-gray-900">{countryCode} {mobileNumber}</span>
                                    <br />
                                    <button onClick={() => setStep('mobile')} className="text-orange-600 font-bold hover:underline mt-1 bg-orange-50 px-2 py-0.5 rounded-full inline-block">Change Number</button>
                                </p>
                            </div>

                            <div className="flex justify-center gap-2 my-4">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        value={data}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                e.target.previousSibling.focus();
                                            }
                                        }}
                                        className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                            </button>

                            <div className="text-xs text-gray-400">
                                Did not receive code? <button onClick={handleSendOtp} className="text-gray-600 font-bold hover:text-black">Resend</button>
                            </div>
                        </div>
                    )}

                    {step === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-400">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Aboard!</h2>
                                <p className="text-gray-500 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">Mobile verified. Just a few final details to set up your secure account.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userDetails.firstName}
                                            onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={userDetails.lastName}
                                        onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={userDetails.email}
                                        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={userDetails.password}
                                        onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={userDetails.confirmPassword}
                                        onChange={(e) => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Finish Setup <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                                    By clicking "Finish Setup", you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                                </p>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MobileAuthModal;
