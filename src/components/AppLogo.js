// AppLogo.js — Reusable logo component used across all pages.
// Displays the Event Management System logo image.
// Props:
//   size    — "sm" | "md" | "lg" | "xl"  (controls height)
//   onClick — optional click handler (e.g. navigate to home)
//   style   — optional extra inline styles

import logo from "../assets/mylogo.png";

// Height map for each size variant
const SIZE_MAP = {
  sm:  44,   // navbar (compact)
  md:  60,   // auth page headers
  lg:  80,   // login / register cards
  xl:  100,  // hero sections
};

function AppLogo({ size = "md", onClick, style = {} }) {
  const height = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <img
      src={logo}
      alt="Event Management System"
      onClick={onClick}
      style={{
        height,
        width: "auto",
        display: "block",
        objectFit: "contain",
        cursor: onClick ? "pointer" : "default",
        // Drop shadow to make it pop on gradient backgrounds
        filter: "drop-shadow(0 2px 8px rgba(30,27,75,0.15))",
        ...style,
      }}
    />
  );
}

export default AppLogo;
