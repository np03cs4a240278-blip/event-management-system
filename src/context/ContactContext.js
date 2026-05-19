// ContactContext.js
// Provides unread contact message count to the whole admin UI.
// Sidebar and Navbar both read from this to show the notification badge.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import API from "../services/api";

const ContactContext = createContext({ unreadCount: 0, refreshUnread: () => {} });

export function ContactProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count — only when logged in as admin
  const refreshUnread = useCallback(async () => {
    if (!user || user.role !== "admin") {
      setUnreadCount(0);
      return;
    }
    try {
      // GET /api/contact-messages/unread-count
      const res = await API.get("/contact-messages/unread-count");
      setUnreadCount(Number(res.data.unread) || 0);
    } catch {
      // Silently ignore — badge just won't show if backend unreachable
    }
  }, [user]);

  // Fetch on mount and whenever user changes
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // Poll every 60 seconds while admin is logged in
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const id = window.setInterval(refreshUnread, 60000);
    return () => window.clearInterval(id);
  }, [refreshUnread, user]);

  return (
    <ContactContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </ContactContext.Provider>
  );
}

// useContact() — call this in any component to get unread count + refresh fn
export function useContact() {
  return useContext(ContactContext);
}
