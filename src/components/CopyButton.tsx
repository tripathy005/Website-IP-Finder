import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  onCopySuccess?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label,
  onCopySuccess,
  className = '',
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (onCopySuccess) {
        onCopySuccess(textToCopy);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      if (onCopySuccess) onCopySuccess(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      title={`Copy "${textToCopy}"`}
      className={`inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all duration-200 border ${
        copied
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80 hover:border-cyan-500/50 active:scale-95'
      } ${sizeStyles[size]} ${className}`}
    >
      {copied ? (
        <>
          <Check className={`${iconSizes[size]} text-emerald-400 animate-bounce`} />
          <span>{label ? 'Copied!' : 'Copied'}</span>
        </>
      ) : (
        <>
          <Copy className={`${iconSizes[size]} text-slate-400 group-hover:text-cyan-400`} />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
