import * as React from "react";

export function Switch({ id, checked, onCheckedChange }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      style={{ outline: "none", border: "none" }}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}
