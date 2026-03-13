import React, { useState } from 'react';
import {
    X,
    CheckCircle,
    Zap,
    Crown,
    ArrowRight,
    Tag,
    AlertCircle,
    LogIn
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DiscountRedemptionModal = ({ isOpen, onClose, discount, onSelectPlan }) => {
    const { user, requestLogin } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('Standard');

    if (!isOpen || !discount) return null;

    // Plans data (simplified for this modal)
    const plans = [
        {
            name: 'Standard',
            price: 7.99,
            icon: <Zap className="w-5 h-5 text-orange-600" />,
            color: 'bg-orange-50 border-orange-200',
            originalPrice: 7.99
        },
        {
            name: 'Premium',
            price: 9.99,
            icon: <Crown className="w-5 h-5 text-black" />,
            color: 'bg-black text-white',
            originalPrice: 9.99
        }
    ];

    const calculateDiscountedPrice = (price) => {
        if (discount.type === 'percentage') {
            return Math.max(0, price * (1 - discount.value / 100)).toFixed(2);
        }
        return Math.max(0, price - discount.value).toFixed(2);
    };

    const handleConfirm = () => {
        if (!user) {
            // If user is not logged in, trigger login request
            requestLogin(window.location.pathname);
            return;
        }
        onSelectPlan(selectedPlan, discount.code);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-orange-600" />
                            Redeem Offer
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Choose a plan to apply <span className="font-bold text-orange-600">{discount.code}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        {plans.map((plan) => (
                            <button
                                key={plan.name}
                                onClick={() => setSelectedPlan(plan.name)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedPlan === plan.name
                                    ? 'bg-white shadow-md text-gray-900 scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {plan.icon}
                                {plan.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Comparison Card (Left Side - What you get) */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Included in {selectedPlan}</h4>
                            <ul className="space-y-3">
                                {selectedPlan === 'Standard' ? (
                                    <>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Complete AI Analysis</li>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Cost Breakdown</li>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Red Flag Detection</li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> All Standard Features</li>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> 3 Quote Comparisons</li>
                                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> 24h Priority Processing</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Price Card (Right Side - The Deal) */}
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex flex-col justify-center items-center text-center">
                            <div className="text-sm font-semibold text-gray-500 mb-1">Standard Price</div>
                            <div className="text-lg text-gray-400 line-through decoration-red-500 font-medium mb-4">
                                ${plans.find(p => p.name === selectedPlan).originalPrice}
                            </div>

                            <div className="bg-white px-4 py-1 rounded-full text-xs font-bold text-green-600 mb-2 border border-green-100 shadow-sm">
                                SAVE {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                            </div>

                            <div className="text-sm font-bold text-gray-900 mb-1">Your Price</div>
                            <div className="text-4xl font-extrabold text-orange-600 mb-2">
                                ${calculateDiscountedPrice(plans.find(p => p.name === selectedPlan).originalPrice)}
                            </div>
                            <div className="text-xs text-gray-500">One-time payment</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        {user ? (
                            <>
                                Review & Pay
                                <ArrowRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign in to Redeem
                            </>
                        )}
                    </button>
                    {(discount.minPurchaseAmount > 0 && selectedPlan === 'Standard' && discount.minPurchaseAmount > 7.99) && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-red-500 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Minimum purchase of ${discount.minPurchaseAmount} required for this code.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscountRedemptionModal;
