import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-[480px]' }) => {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl modal-animate overflow-hidden border border-[#E5E0D4]`}>
                {/* Gold top stripe */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#C8963E,#E8B86D,#C8963E)' }} />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EDE4]">
                    <div>
                        <div className="gold-divider" />
                        <h3 className="text-[17px] font-semibold text-[#1A1A2E] leading-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0EDE4] transition-colors text-[#6B7280] hover:text-[#1A1A2E]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
