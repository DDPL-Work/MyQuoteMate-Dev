import React from 'react';
import { X, Receipt, CheckCircle, Download, Printer, User, Mail, Calendar, CreditCard, DollarSign } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, payment }) => {
    if (!isOpen || !payment) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col text-gray-900 border border-gray-100">

                {/* Header Decorator */}
                <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 w-full" />

                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Payment Receipt
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Content */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] scrollbar-hide printable">

                    {/* Status Badge */}
                    <div className="flex flex-col items-center text-center space-y-2 py-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <p className="text-green-700 font-bold uppercase tracking-widest text-xs">Payment Successful</p>
                        <h2 className="text-4xl font-black text-gray-900">
                            {payment.currency === 'aud' ? 'A$' : '$'}{payment.amount?.toFixed(2)}
                        </h2>
                        <p className="text-gray-400 text-xs font-medium">Transaction ID: {payment.stripePaymentId || payment._id}</p>
                    </div>

                    {/* Details Sections */}
                    <div className="space-y-6">

                        {/* Customer Details */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Customer Information
                            </h4>
                            <div className="grid grid-cols-1 gap-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-bold text-gray-900">{payment.userId?.firstName} {payment.userId?.lastName || ''}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-medium text-gray-700 flex items-center gap-1">
                                        <Mail className="w-3 h-3 opacity-50" /> {payment.userId?.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <CreditCard className="w-3 h-3" /> Transaction Details
                            </h4>
                            <div className="grid grid-cols-1 gap-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Service Plan</span>
                                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-black uppercase tracking-tighter">
                                        {payment.tier || 'N/A'} Plan
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Date & Time</span>
                                    <span className="font-medium text-gray-700">{formatDate(payment.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-medium text-gray-700 capitalize">{payment.paymentMethod || 'Stripe'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Currency</span>
                                    <span className="font-bold text-gray-900 uppercase">{payment.currency || 'USD'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="pt-4 border-t border-dashed border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900 text-sm">Total Paid Amount</span>
                                <span className="text-xl font-black text-orange-600">
                                    {payment.currency === 'aud' ? 'A$' : '$'}{payment.amount?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all text-sm"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all text-sm"
                    >
                        Done
                    </button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
        </div>
    );
};

export default ReceiptModal;
