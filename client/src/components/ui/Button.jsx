import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-accent text-white border-2 border-accent hover:bg-transparent hover:text-accent",
  ghost: "bg-transparent text-text border-2 border-border hover:border-text",
  danger:
    "bg-danger text-white border-2 border-danger hover:bg-transparent hover:text-danger",
};

const Button = forwardRef(function Button(
  { variant = "primary", className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "font-sub font-bold tracking-widest uppercase px-8 py-3 text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
