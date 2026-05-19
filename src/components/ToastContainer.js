// ToastContainer — renders floating toast notifications.
// Receives toasts array from useToast hook.
// Uses lucide-react icons.

import { CheckCircle, XCircle, Info } from "lucide-react";

function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle size={16} />,
    error:   <XCircle size={16} />,
    info:    <Info size={16} />,
  };

  return (
    <div className="otp-toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`otp-toast otp-toast--${toast.type}`}
          role="alert"
        >
          <span className="otp-toast__icon">
            {iconMap[toast.type] || <Info size={16} />}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
