/**
 * ToastContainer — renders floating toast notifications.
 * Receives toasts array from useToast hook.
 */
function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  const iconMap = {
    success: "✅",
    error: "❌",
    info: "💜",
  };

  return (
    <div className="otp-toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`otp-toast otp-toast--${toast.type}`}
          role="alert"
        >
          <span className="otp-toast__icon">{iconMap[toast.type] || "ℹ️"}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
