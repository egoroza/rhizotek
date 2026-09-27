import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "navigation";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseClasses = [
  "font-heading inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-lg",
  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  "transition-all duration-800 ease-in-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current",
].join(" ");

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent-sage/50 text-text font-bold border-2 border-transparent hover:bg-transparent hover:border-text",
  navigation: "text-text text-sm uppercase font-bold border-2 border-transparent hover:bg-transparent hover:border-text",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, type = "button", ...props }, ref) => {
    const classes = [baseClasses, variantClasses[variant], className]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={classes} {...props} />;
  },
);

Button.displayName = "Button";
