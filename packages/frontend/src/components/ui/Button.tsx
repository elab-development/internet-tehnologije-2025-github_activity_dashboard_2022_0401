"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-colors";

  const styles =
    variant === "secondary"
      ? "border border-zinc-300 text-zinc-800 hover:bg-zinc-100"
      : "bg-black text-white hover:bg-zinc-800";

  return (
    <button
      {...props}
      className={`${base} ${styles} ${className}`}
    />
  );
}
