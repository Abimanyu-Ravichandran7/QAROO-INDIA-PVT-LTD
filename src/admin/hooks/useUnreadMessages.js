import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { contactApi } from '../../api/contactApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useUnreadMessages(refreshMs = 30000) {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!hasPermission('contact.read')) return;
    try {
      const res = await contactApi.list({ status: 'new' });
      setCount(res?.count || 0);
    } catch (err) {
      if (err?.status !== 403) setCount(0);
    }
  }, [hasPermission]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [refresh, refreshMs]);

  // Refresh immediately when the admin lands on the Messages page,
  // so the badge clears as soon as they view the new messages.
  // (Do a quick follow-up refresh too, since the Messages page auto-marks
  // them read after mounting.)
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (prevPath.current !== location.pathname && location.pathname === '/admin/messages') {
      refresh();
      const t = setTimeout(refresh, 1200);
      prevPath.current = location.pathname;
      return () => clearTimeout(t);
    }
    prevPath.current = location.pathname;
  }, [location.pathname, refresh]);

  return { unread: count, refresh };
}
