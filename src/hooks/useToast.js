import { useState, useCallback } from "react";

/**
 * useToast — lightweight toast notification hook.
 * Returns { toasts, showToast, removeToast }
 * type: "success" | "error" | "info"
 */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return { toasts, showToast, removeToast };
}

export default useToast;
