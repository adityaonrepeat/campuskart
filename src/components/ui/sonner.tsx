"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        error: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ),
      }}
      toastOptions={{
        style: {
          background: "#0f0f0f",
          border: "1px solid #222",
          color: "#f5f5f5",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 500,
          padding: "12px 16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
