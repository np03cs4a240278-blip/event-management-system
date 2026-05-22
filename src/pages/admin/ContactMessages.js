// admin/ContactMessages.js
// Admin module to view, manage, and respond to contact form submissions.
// Fetches from GET /contact-messages, supports status update and delete.

import { useCallback, useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCheck,
  Mail,
  User,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  Inbox,
  Clock,
  Reply,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { useContact } from "../../context/ContactContext";

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:     { label: "New",     bg: "#EDE9FE", color: "#5B21B6", border: "#C4B5FD", Icon: Inbox },
  read:    { label: "Read",    bg: "#DBEAFE", color: "#1D4ED8", border: "#93C5FD", Icon: Eye },
  replied: { label: "Replied", bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7", Icon: Reply },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const { Icon } = cfg;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Message detail modal ──────────────────────────────────────────────────────
function MessageModal({ message, onClose, onStatusChange, onDelete, saving }) {
  if (!message) return null;

  const formatDate = (val) => {
    if (!val) return "—";
    return new Date(val).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(30,27,75,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "2rem",
          width: "min(100%, 560px)",
          boxShadow: "0 20px 60px rgba(165,180,252,0.3)",
          border: "1px solid #EDE9FE",
          animation: "slideUp 0.22s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #FBCFE8, #A5B4FC)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#1E1B4B", flexShrink: 0,
            }}>
              {message.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1E1B4B" }}>
                {message.name}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                <Mail size={12} /> {message.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, borderRadius: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
          <StatusBadge status={message.status || "new"} />
          <span style={{ fontSize: 12, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={12} />
            {formatDate(message.created_at)}
          </span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>ID #{message.id}</span>
        </div>

        {/* Message body */}
        <div style={{
          background: "#F8F9FD",
          border: "1px solid #EDE9FE",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          fontSize: 14,
          color: "#1E1B4B",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {message.message}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {message.status !== "read" && (
            <button
              className="theme-btn"
              disabled={saving}
              onClick={() => onStatusChange(message.id, "read")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 16px" }}
            >
              <Eye size={14} />
              Mark as Read
            </button>
          )}
          {message.status !== "replied" && (
            <button
              className="theme-btn"
              disabled={saving}
              onClick={() => onStatusChange(message.id, "replied")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 16px", background: "linear-gradient(135deg, #D1FAE5, #6EE7B7)", color: "#065F46" }}
            >
              <Reply size={14} />
              Mark as Replied
            </button>
          )}
          {message.status !== "new" && (
            <button
              className="theme-btn"
              disabled={saving}
              onClick={() => onStatusChange(message.id, "new")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 16px", background: "#EDE9FE", color: "#5B21B6" }}
            >
              <Inbox size={14} />
              Mark as New
            </button>
          )}
          <button
            disabled={saving}
            onClick={() => onDelete(message.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, padding: "8px 16px",
              background: "#FEE2E2", color: "#B91C1C",
              border: "1px solid #FECACA", borderRadius: 999,
              cursor: "pointer", fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ContactMessages page ─────────────────────────────────────────────────
function ContactMessages() {
  const { refreshUnread } = useContact();

  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [feedback, setFeedback]       = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  // Filters
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder]     = useState("newest");

  // Modal
  const [viewMessage, setViewMessage] = useState(null);
  const [saving, setSaving]           = useState(false);

  // ── Load messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/contact-messages");
      setMessages(res.data.messages ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load contact messages."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // ── Show feedback toast ────────────────────────────────────────────────────
  const showFeedback = (text, type = "success") => {
    setFeedback(text);
    setFeedbackType(type);
    setTimeout(() => setFeedback(""), 3500);
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setSaving(true);
    try {
      const res = await API.put(`/contact-messages/${id}/status`, { status: newStatus });
      const updated = res.data.contact_message;

      // Update in local state
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: updated.status ?? newStatus } : m))
      );

      // Update modal if open
      if (viewMessage?.id === id) {
        setViewMessage((prev) => ({ ...prev, status: updated.status ?? newStatus }));
      }

      showFeedback(`Message marked as "${newStatus}".`);
      refreshUnread();
    } catch (err) {
      showFeedback(getErrorMessage(err, "Could not update status."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete message ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message permanently? This cannot be undone.")) return;
    setSaving(true);
    try {
      await API.delete(`/contact-messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (viewMessage?.id === id) setViewMessage(null);
      showFeedback("Message deleted successfully.");
      refreshUnread();
    } catch (err) {
      showFeedback(getErrorMessage(err, "Could not delete message."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Open modal and auto-mark as read ──────────────────────────────────────
  const handleView = async (message) => {
    setViewMessage(message);
    // Auto-mark as read if it's new
    if ((message.status || "new") === "new") {
      await handleStatusChange(message.id, "read");
    }
  };

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = messages
    .filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || (m.status || "new") === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

  // ── Summary counts ─────────────────────────────────────────────────────────
  const totalNew     = messages.filter((m) => (m.status || "new") === "new").length;
  const totalRead    = messages.filter((m) => m.status === "read").length;
  const totalReplied = messages.filter((m) => m.status === "replied").length;

  // ── Date formatter ─────────────────────────────────────────────────────────
  const formatDate = (val) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  // ── Truncate long messages ─────────────────────────────────────────────────
  const truncate = (text, max = 80) =>
    text && text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <AppShell
        title="Contact Messages"
        subtitle="View and manage messages submitted through the public contact form."
      >
        {/* ── Feedback toast ── */}
        {feedback && (
          <div
            className={`message ${feedbackType === "error" ? "message-error" : "message-success"}`}
            style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}
          >
            {feedbackType === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {feedback}
          </div>
        )}

        {error && (
          <div className="message message-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* ── Stats row ── */}
        <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {[
            { label: "Total Messages", value: messages.length, Icon: MessageSquare, color: "#7c3aed", bg: "#EDE9FE" },
            { label: "Unread (New)",   value: totalNew,         Icon: Inbox,         color: "#5B21B6", bg: "#EDE9FE" },
            { label: "Read",           value: totalRead,        Icon: Eye,           color: "#1D4ED8", bg: "#DBEAFE" },
            { label: "Replied",        value: totalReplied,     Icon: Reply,         color: "#065F46", bg: "#D1FAE5" },
          ].map(({ label, value, Icon, color, bg }) => (
            <article
              key={label}
              className="stat-card"
              style={{ borderTop: `4px solid ${color}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="stat-card__label">{label}</span>
                <span style={{ background: bg, borderRadius: 8, padding: "4px 6px", display: "flex" }}>
                  <Icon size={16} color={color} />
                </span>
              </div>
              <strong style={{ color }}>{value}</strong>
            </article>
          ))}
        </section>

        {/* ── Filters panel ── */}
        <section className="panel">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "end", flexWrap: "wrap" }}>

            {/* Search */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Search size={12} /> Search
              </label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                <input
                  className="theme-input"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or message…"
                  style={{ paddingLeft: 36 }}
                  type="text"
                  value={search}
                />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Filter size={12} /> Status
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="theme-input"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ paddingRight: 32, appearance: "none", cursor: "pointer", minWidth: 130 }}
                  value={statusFilter}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Clock size={12} /> Sort
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="theme-input"
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ paddingRight: 32, appearance: "none", cursor: "pointer", minWidth: 130 }}
                  value={sortOrder}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Refresh */}
            <button
              className="theme-btn"
              disabled={loading}
              onClick={loadMessages}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 42, padding: "0 16px", fontSize: 13 }}
              type="button"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Active filter chips */}
          {(search || statusFilter !== "all") && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>Active filters:</span>
              {search && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EDE9FE", color: "#5B21B6", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  <Search size={11} /> "{search}"
                  <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#5B21B6", padding: 0, display: "flex" }}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#DBEAFE", color: "#1D4ED8", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  <Filter size={11} /> {statusFilter}
                  <button onClick={() => setStatusFilter("all")} style={{ background: "none", border: "none", cursor: "pointer", color: "#1D4ED8", padding: 0, display: "flex" }}>
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Messages table ── */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquare size={18} color="#818CF8" />
                All Messages
              </h2>
            </div>
            <span className="pill">{filtered.length} shown</span>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>
              <RefreshCw size={24} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
              <p style={{ margin: 0 }}>Loading messages…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={40} color="#C4B5FD" style={{ margin: "0 auto 12px", display: "block" }} />
              <h3>No messages found</h3>
              <p>
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Contact form submissions will appear here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  className="theme-btn"
                  onClick={() => { setSearch(""); setStatusFilter("all"); }}
                  style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                  <X size={13} /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <User size={12} /> Sender
                      </span>
                    </th>
                    <th>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Mail size={12} /> Email
                      </span>
                    </th>
                    <th>Message Preview</th>
                    <th>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={12} /> Date
                      </span>
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((msg) => {
                    const isNew = (msg.status || "new") === "new";
                    return (
                      <tr
                        key={msg.id}
                        style={{
                          background: isNew ? "#FDFBFF" : "transparent",
                          fontWeight: isNew ? 600 : 400,
                        }}
                      >
                        <td style={{ color: "#9CA3AF", fontSize: 12 }}>{msg.id}</td>

                        {/* Sender */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "linear-gradient(135deg, #FBCFE8, #A5B4FC)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 800, color: "#1E1B4B", flexShrink: 0,
                            }}>
                              {msg.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontWeight: isNew ? 700 : 500 }}>{msg.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ fontSize: 13, color: "#4B5563" }}>{msg.email}</td>

                        {/* Message preview */}
                        <td style={{ fontSize: 13, color: "#6B7280", maxWidth: 260 }}>
                          {truncate(msg.message)}
                        </td>

                        {/* Date */}
                        <td style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                          {formatDate(msg.created_at)}
                        </td>

                        {/* Status */}
                        <td><StatusBadge status={msg.status || "new"} /></td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {/* View */}
                            <button
                              onClick={() => handleView(msg)}
                              title="View full message"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "5px 10px", borderRadius: 999,
                                background: "#EDE9FE", color: "#5B21B6",
                                border: "none", cursor: "pointer",
                                fontSize: 12, fontWeight: 700,
                                transition: "all 0.18s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#DDD6FE"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#EDE9FE"}
                            >
                              <Eye size={12} /> View
                            </button>

                            {/* Mark as Read */}
                            {(msg.status || "new") !== "read" && (
                              <button
                                disabled={saving}
                                onClick={() => handleStatusChange(msg.id, "read")}
                                title="Mark as read"
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  padding: "5px 10px", borderRadius: 999,
                                  background: "#DBEAFE", color: "#1D4ED8",
                                  border: "none", cursor: "pointer",
                                  fontSize: 12, fontWeight: 700,
                                  transition: "all 0.18s",
                                  opacity: saving ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#BFDBFE"; }}
                                onMouseLeave={(e) => e.currentTarget.style.background = "#DBEAFE"}
                              >
                                <CheckCheck size={12} /> Read
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              disabled={saving}
                              onClick={() => handleDelete(msg.id)}
                              title="Delete message"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "5px 10px", borderRadius: 999,
                                background: "#FEE2E2", color: "#B91C1C",
                                border: "none", cursor: "pointer",
                                fontSize: 12, fontWeight: 700,
                                transition: "all 0.18s",
                                opacity: saving ? 0.6 : 1,
                              }}
                              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#FECACA"; }}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#FEE2E2"}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AppShell>

      {/* ── Message detail modal ── */}
      {viewMessage && (
        <MessageModal
          message={viewMessage}
          onClose={() => setViewMessage(null)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          saving={saving}
        />
      )}
    </>
  );
}

export default ContactMessages;
