import React from 'react';
import { RiCloseLine, RiCheckLine } from 'react-icons/ri';
import { useStore } from '../store';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }: any) => {
  const base = "px-4 py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-50 disabled:shadow-none",
    secondary: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-slate-500 hover:bg-slate-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, className = "", ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
    <input
      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-[390px] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl transform transition-transform animate-slide-up pointer-events-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <RiCloseLine size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Avatar = ({ name, color, size = 'md', src }: any) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-20 h-20 text-2xl' };
  return (
    <div className={`${sizes[size as keyof typeof sizes]} ${color || 'bg-slate-400'} rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden`}>
       {src ? <img src={src} className="w-full h-full object-cover" /> : name.substring(0, 2).toUpperCase()}
    </div>
  );
};

export const Toast = () => {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  return (
    <div className="absolute bottom-24 left-4 right-4 z-[60] flex justify-center pointer-events-none animate-slide-up">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium pointer-events-auto">
        <RiCheckLine className="text-teal-400" size={18} />
        {toastMessage}
      </div>
    </div>
  );
};
