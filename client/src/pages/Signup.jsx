// src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import Swal from 'sweetalert2';
import LegalModal from '../components/LegalModal';
import Terms from './Terms';
import Privacy from './Privacy';

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin, showForgotPassword = false }) => {
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(showForgotPassword);
  const [legalModalType, setLegalModalType] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setFieldErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordStrength(0);
      setAcceptedTerms(false);
      setShowForgotPasswordForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle phone number formatting
    let formattedValue = value;
    if (name === 'phone') {
      // Remove non-numeric characters except +
      formattedValue = value.replace(/[^\d+]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(formattedValue));
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!showForgotPasswordForm) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      } else if (formData.lastName.trim().length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      }

      if (formData.phone && !/^[\d+\s\-()]{10,}$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!showForgotPasswordForm) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength < 50) {
        errors.password = 'Password is too weak';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!acceptedTerms) {
        errors.terms = 'You must accept the terms and conditions';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showForgotPasswordForm) {
      // Handle forgot password submission
      if (!formData.email.trim()) {
        setFieldErrors({ email: 'Email is required' });
        return;
      }

      // TODO: Implement forgot password API call
      Swal.fire({
        title: 'Check Your Email',
        text: `A password reset link will be sent to ${formData.email}`,
        icon: 'success',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    // Prepare data matching backend User model
    const userData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      ...(formData.phone && { phone: formData.phone.trim() }),
      metadata: {
        registrationSource: 'manual',
        ipAddress: '', // Will be set by backend
        userAgent: navigator.userAgent
      }
    };

    await signup(userData);
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', check: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', check: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', check: /[a-z]/.test(formData.password) },
    { text: 'Contains number', check: /[0-9]/.test(formData.password) },
    { text: 'Contains special character', check: /[^A-Za-z0-9]/.test(formData.password) }
  ];

  const strengthLabels = {
    0: 'Very Weak',
    25: 'Weak',
    50: 'Fair',
    75: 'Good',
    90: 'Strong',
    100: 'Very Strong'
  };

  const getStrengthLabel = (strength) => {
    for (const [threshold, label] of Object.entries(strengthLabels).reverse()) {
      if (strength >= parseInt(threshold)) return label;
    }
    return 'Very Weak';
  };

  const getStrengthColor = (strength) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ animation: 'fade-in 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slide-up 0.25s ease-out' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
          disabled={loading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showForgotPasswordForm ? 'Reset Password' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {showForgotPasswordForm
                  ? 'We\'ll send you a reset link'
                  : 'Join thousands of smart homeowners'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Global error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!showForgotPasswordForm && (
              <>
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${fieldErrors.firstName
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                          } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                        placeholder="John"
                        autoComplete="given-name"
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${fieldErrors.lastName
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                          } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${fieldErrors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${fieldErrors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                    } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {!showForgotPasswordForm && (
              <>
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${fieldErrors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Password strength</span>
                        <span className={`font-medium ${passwordStrength < 25 ? 'text-red-600' :
                          passwordStrength < 50 ? 'text-orange-600' :
                            passwordStrength < 75 ? 'text-yellow-600' :
                              passwordStrength < 90 ? 'text-blue-600' : 'text-green-600'
                          }`}>
                          {getStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>

                      {/* Requirements checklist */}
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            {req.check ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                            )}
                            <span className={`text-xs ${req.check ? 'text-green-600' : 'text-gray-500'
                              }`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${fieldErrors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        } focus:ring-2 focus:ring-opacity-20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and conditions */}
                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      disabled={loading}
                      className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button type="button" onClick={() => setLegalModalType('terms')} className="text-orange-600 hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" onClick={() => setLegalModalType('privacy')} className="text-orange-600 hover:underline">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.terms}</p>
                  )}
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {showForgotPasswordForm ? 'Sending...' : 'Creating Account...'}
                </span>
              ) : (
                showForgotPasswordForm ? 'Send Reset Link' : 'Create Account'
              )}
            </button>
          </form>

          {!showForgotPasswordForm && (
            <>
              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE}/api/${import.meta.env.VITE_API_VERSION}/auth/google`}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
            </>
          )}

          {/* Switch between forms */}
          <div className="mt-6 text-center text-sm">
            {showForgotPasswordForm ? (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => {
                    setShowForgotPasswordForm(false);
                    onSwitchToLogin(false);
                  }}
                  className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Back to login
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => onSwitchToLogin(false)}
                  className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Background click handler */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Legal Modal overlay */}
      {legalModalType && (
        <LegalModal
          isOpen={true}
          onClose={() => setLegalModalType(null)}
          title={legalModalType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        >
          {legalModalType === 'terms' ? (
            <Terms isModal={true} onComplete={() => setLegalModalType('privacy')} />
          ) : (
            <Privacy isModal={true} onComplete={() => setLegalModalType(null)} />
          )}
        </LegalModal>
      )}
    </div>
  );
};

export default SignUpModal;