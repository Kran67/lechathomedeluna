import Link from 'next/link';

// Capture : l'URL, puis optionnellement [texte] collé à l'URL
const URL_REGEX = /(https?:\/\/[^\s<>"'\[]+)(\[[^\]]+\])?/g;

export function parseLinks(text: string, baseUrl: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const [fullMatch, url, labelRaw] = match;
    const matchStart = match.index;

    // Texte brut avant ce match
    if (matchStart > lastIndex) {
      result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, matchStart)}</span>);
    }

    // Libellé : contenu des [] ou l'URL elle-même
    const label = labelRaw ? labelRaw.slice(1, -1) : url;

    let isInternal = false;
    try {
      const parsedUrl = new URL(url);
      const parsedBase = new URL(baseUrl);
      isInternal = parsedUrl.hostname === parsedBase.hostname;
    } catch { /* URL malformée → externe */ }

    if (isInternal) {
      let href = url;
      try {
        const parsedUrl = new URL(url);
        href = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      } catch { /* garder l'URL complète */ }

      result.push(
        <Link
          key={`link-${matchStart}`}
          href={href}
          className="underline underline-offset-2 opacity-90 hover:opacity-100 break-all"
          title={url}
        >
          {label}
        </Link>
      );
    } else {
      result.push(
        <a
          key={`link-${matchStart}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 opacity-90 hover:opacity-100 break-all"
          title={url}
        >
          {label}
        </a>
      );
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Texte restant après le dernier match
  if (lastIndex < text.length) {
    result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return result;
}