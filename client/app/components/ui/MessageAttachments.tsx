// app/components/ui/MessageAttachments.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

import { MessageAttachment } from '@/app/interfaces/messaging';

import Button from './Button';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getFileIcon(att: MessageAttachment) {
      if (att.mime_type === 'application/pdf') return '/images/pdf.png';
      if (att.mime_type.startsWith('image/')) return att.url;
      if (att.mime_type.includes('word')) return '/images/doc.png';
      if (att.mime_type.includes('excel')) return '/images/xls.png';
      return '/images/text.png';
}

interface Props {
  attachments: MessageAttachment[];
  isMine: boolean;
}

export default function MessageAttachments({ attachments, isMine }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-2">
        {attachments.map((att: MessageAttachment) => (
          att.mime_type.startsWith('image/') 
          ? <button
                key={att.id}
                onClick={() => setLightbox(`${API}${att.url}`)}
                className="relative rounded-[8px] overflow-hidden border border-white/30 hover:opacity-90 transition"
                title={att.original_name}
              >
                <img
                  src={`${API}${att.url}`}
                  alt={att.original_name}
                  className="w-[120px] h-[90px] object-cover cursor-pointer"
                />
              </button>
          : <a key={att.id} href={`${API}${att.url}`} download={att.original_name} target="_blank"
              rel="noopener noreferrer"
              className={
                'flex items-center gap-6 px-10 py-6 rounded-[8px] text-sm border border-white/30 ' +
                'hover:opacity-80 transition ' +
                (isMine ? 'bg-[#7a1f63] text-white' : 'bg-[#f0e6f6] text-(--primary)')
              }
              title={`Télécharger ${att.original_name}`}>
              <img src={getFileIcon(att)} className="w-[60px] h-[50px] object-cover rounded" alt={att.original_name} />
              <div className="flex flex-col leading-tight max-w-[120px]">
                <span className="truncate font-medium">{att.original_name}</span>
                <span className="text-xs opacity-70">{formatSize(att.size)}</span>
              </div>
              <span className="text-xs opacity-70">↓</span>
            </a>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && createPortal(
        <div
          className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Aperçu"
            className="max-w-[90vw] max-h-[90vh] rounded-[8px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-6 text-white text-3xl font-bold hover:opacity-80 cursor-pointer"
            text="✕"
          />
        </div>,
        document.body
      )}
    </>
  );
}