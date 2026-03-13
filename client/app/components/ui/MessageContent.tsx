'use client';

import { parseLinks } from '@/app/core/lib/linkParser';

interface Props {
  content: string;
}

export default function MessageContent({ content }: Props) {
  if (!content) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL ?? 
                  (typeof window !== 'undefined' ? window.location.origin : '');

  const nodes = parseLinks(content, baseUrl);

  return (
    <span className="whitespace-pre-line break-words">
      {nodes}
    </span>
  );
}