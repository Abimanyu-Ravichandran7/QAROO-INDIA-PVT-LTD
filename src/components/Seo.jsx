import { useEffect } from 'react';

const DEFAULT_TITLE = 'Qaroo India Private Limited — Business Solutions & Career-Ready Learning';
const DEFAULT_DESC =
  'Qaroo India Private Limited builds digital solutions for businesses — CRM, marketing, design, software, strategy — and career-ready IT learning programs. Coimbatore & Chennai.';

function setMeta(attrName, attrKey, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrKey}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrKey);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description, path }) {
  useEffect(() => {
    const t = title || DEFAULT_TITLE;
    const d = description || DEFAULT_DESC;
    const url = `https://www.qarootech.in${path || '/'}`;

    document.title = t;
    setMeta('name', 'description', d);
    setMeta('property', 'og:title', t);
    setMeta('property', 'og:description', d);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', t);
    setMeta('name', 'twitter:description', d);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, path]);

  return null;
}
