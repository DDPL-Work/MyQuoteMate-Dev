import React from 'react';
import { X } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/20 relative">
                    {children}
                </div>
            </div>

            {/* Background click handler */}
            <div
                className="absolute inset-0 z-[-1]"
                onClick={onClose}
                aria-hidden="true"
            />
        </div>
    );
};

export default LegalModal;
