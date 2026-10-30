import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { INFLUENCER_PROFILE, Language } from '../data/influencerData';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, lang = 'ar' }) => {
  const [copied, setCopied] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const currentPath = window.location.pathname;
  const publicPath = currentPath.toLowerCase().endsWith('/pitadmin')
    ? currentPath.slice(0, -'pitadmin'.length)
    : currentPath;
  const profileUrl = new URL(publicPath || '/', window.location.origin).href;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#0c0a22] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
            {INFLUENCER_PROFILE.name} QR Code
          </span>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-xl hover:bg-purple-950 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-5 my-5 bg-white rounded-2xl shadow-inner mx-auto inline-block">
          <QRCodeSVG
            value={profileUrl}
            size={192}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#09090b"
            title={isAr ? 'رمز QR للموقع الرسمي MEHDI PITA' : 'QR code for the official MEHDI PITA website'}
          />
        </div>

        <h4 className="font-display text-xl font-black text-white font-mono">
          {INFLUENCER_PROFILE.name}
        </h4>
        <p className="text-xs text-zinc-400 font-mono mb-4 mt-1">
          {isAr ? 'امسح الباركود لفتح جميع الحسابات الرسمية' : 'Scannez pour ouvrir les comptes officiels'}
        </p>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? 'تم نسخ الرابط' : 'Lien copié'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{isAr ? 'نسخ رابط المشاركة' : 'Copier le lien'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
