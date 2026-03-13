import React, { useState } from 'react';
import {
    X,
    CreditCard,
    CheckCircle,
    ShieldCheck,
    Lock,
    Zap,
    ArrowRight
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../hooks/useAuth';
import { paymentApi } from '../services/paymentApi';
import { toast } from 'react-hot-toast';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentModal = ({ isOpen, onClose, plan = 'Standard', price = 7.99, initialDiscountCode = '', onSuccess }) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState('summary'); // summary, payment, success
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [validatingCode, setValidatingCode] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setStep('summary');
            setDiscountCode(initialDiscountCode || '');
            setAppliedDiscount(null);
            setClientSecret('');
        }
    }, [isOpen, initialDiscountCode]);

    const handleValidateCode = async () => {
        const codeToValidate = discountCode || initialDiscountCode;
        if (!codeToValidate.trim()) return;

        setValidatingCode(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/discounts/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: discountCode,
                    tier: plan.toLowerCase(),
                    amount: price
                })
            });

            const result = await response.json();

            if (result.success) {
                setAppliedDiscount(result.data);
                toast.success('Discount applied!');
            } else {
                setAppliedDiscount(null);
                toast.error(result.error || 'Invalid discount code');
            }
        } catch (error) {
            console.error('Validation failed:', error);
            toast.error('Failed to validate code');
        } finally {
            setValidatingCode(false);
        }
    };

    const finalPrice = appliedDiscount
        ? (appliedDiscount.type === 'percentage'
            ? Math.max(0, price * (1 - appliedDiscount.value / 100)).toFixed(2)
            : Math.max(0, price - appliedDiscount.value).toFixed(2))
        : price;

    if (!isOpen) return null;

    const handleInitiatePayment = async () => {
        setIsProcessing(true);
        try {
            const response = await paymentApi.createIntent(null, plan.toLowerCase(), {
                email: user?.email,
                name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                discountCode: appliedDiscount?.code
            });

            if (response.data.success) {
                setClientSecret(response.data.data.clientSecret);
                setStep('payment');
            } else {
                toast.error(response.data.error || 'Failed to initialize payment');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error('Failed to connect to payment server');
        } finally {
            setIsProcessing(false);
        }
    };

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#f97316', // orange-500
        },
    };
    const loader = 'auto';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        Secure Checkout
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'summary' && (
                        <>
                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-8 h-8 text-orange-600 fill-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to {plan}</h2>
                                <p className="text-gray-600">Unlock detailed analysis and premium insights</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">{plan} Report</span>
                                    <span className="font-bold text-gray-900">${price}</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between items-center mb-2 text-green-600">
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            Discount ({appliedDiscount.code})
                                        </span>
                                        <span className="font-bold">
                                            -{appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 my-3"></div>
                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total</span>
                                    <span className={appliedDiscount ? "text-orange-600" : ""}>${parseFloat(finalPrice).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Discount Code Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                    Discount Code
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Zap className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            placeholder="Enter code"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-gray-50 uppercase"
                                            disabled={!!appliedDiscount}
                                        />
                                        {appliedDiscount && (
                                            <button
                                                onClick={() => {
                                                    setAppliedDiscount(null);
                                                    setDiscountCode('');
                                                }}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleValidateCode}
                                        disabled={!discountCode || validatingCode || !!appliedDiscount}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${appliedDiscount
                                            ? 'bg-green-100 text-green-700 cursor-default'
                                            : 'bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {validatingCode ? '...' : appliedDiscount ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleInitiatePayment}
                                disabled={isProcessing}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Securing Link...
                                    </>
                                ) : (
                                    <>
                                        Continue to Payment
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                <Lock className="w-3 h-3" />
                                Payments processed securely by Stripe
                            </div>
                        </>
                    )}

                    {step === 'payment' && clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance, loader }}>
                            <div className="mb-4 text-center">
                                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                                <p className="text-sm text-gray-500">Pay ${parseFloat(finalPrice).toFixed(2)} for {plan} Pack</p>
                            </div>
                            <CheckoutForm
                                amount={parseFloat(finalPrice)}
                                tier={plan}
                                onCancel={() => setStep('summary')}
                                onSuccess={(paymentIntent) => {
                                    setStep('success');
                                    setTimeout(() => {
                                        onSuccess?.(paymentIntent);
                                        onClose();
                                    }, 2500);
                                }}
                            />
                        </Elements>
                    )}

                    {step === 'success' && (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                            <p className="text-gray-600 mb-6">Your credits have been added successfully.</p>
                            <div className="text-sm text-gray-500">Redirecting...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
