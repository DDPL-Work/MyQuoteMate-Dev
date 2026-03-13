import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

const CheckoutForm = ({ onCancel, onSuccess, amount, tier }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required but for SPAs we usually handle the result immediately
                return_url: window.location.origin + '/pricing',
            },
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onSuccess?.(paymentIntent);
        } else if (paymentIntent && paymentIntent.status === 'processing') {
            toast.info('Your payment is processing.');
        } else {
            toast.error('Payment status: ' + paymentIntent.status);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>

            <div className="flex flex-col gap-3">
                <button
                    disabled={isProcessing || !stripe || !elements}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)} Securely`}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full py-2 text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
                >
                    Cancel and go back
                </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bank-level Security
            </div>
        </form>
    );
};

export default CheckoutForm;
