import { useRef, useEffect } from "react";

/**
 * OtpInput — Reusable 6-digit OTP input component.
 * - Auto-advances to next box on digit entry
 * - Backspace moves to previous box
 * - Paste support (pastes across all boxes)
 * - Fully accessible with aria labels
 */
function OtpInput({ value = [], onChange, disabled = false, hasError = false }) {
  const LENGTH = 6;
  const inputRefs = useRef([]);

  // Normalize value to array of LENGTH strings
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || "");

  useEffect(() => {
    // Auto-focus first empty box on mount
    const firstEmpty = digits.findIndex((d) => d === "");
    const focusIndex = firstEmpty === -1 ? LENGTH - 1 : firstEmpty;
    inputRefs.current[focusIndex]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index, e) => {
    const raw = e.target.value;
    // Only accept digits
    const digit = raw.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;
    onChange(next);

    // Move to next box if a digit was entered
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current box
        const next = [...digits];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        // Move to previous box and clear it
        const next = [...digits];
        next[index - 1] = "";
        onChange(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;

    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] || "");
    onChange(next);

    // Focus the box after the last pasted digit
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <div className="otp-input-group" role="group" aria-label="OTP input">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          className={`otp-box${digit ? " otp-box--filled" : ""}${hasError ? " otp-box--error" : ""}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

export default OtpInput;
