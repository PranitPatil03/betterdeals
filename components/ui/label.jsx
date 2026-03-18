import * as React from "react";

export const Label = React.forwardRef(
  /**
   * @param {React.LabelHTMLAttributes<HTMLLabelElement>} props
   * @param {React.ForwardedRef<HTMLLabelElement>} ref
   */
  ({ htmlFor, children, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className="text-xs font-medium text-slate-700"
      {...props}
    >
      {children}
    </label>
  )
);

Label.displayName = "Label";
