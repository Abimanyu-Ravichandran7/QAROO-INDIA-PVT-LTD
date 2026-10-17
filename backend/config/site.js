/**
 * The site's public origin as the backend knows it.
 *
 * The seeds write canonicalUrl onto records, so the value has to exist on this
 * side too. It is overridable with SITE_URL because a staging deploy needs its
 * own canonicals, and kept in step with src/data/site.js on the frontend.
 */
export const SITE_URL = (process.env.SITE_URL || 'https://www.qaroo.in').replace(/\/+$/, '');

/** An absolute URL for a site-relative path. */
export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
