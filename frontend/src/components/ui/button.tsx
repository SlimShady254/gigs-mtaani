import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClassMap: Record<ButtonVariant, string> = {
  default: "ui-button ui-button--default",
  secondary: "ui-button ui-button--secondary",
  outline: "ui-button ui-button--outline",
  ghost: "ui-button ui-button--ghost",
  danger: "ui-button ui-button--danger"
};

const sizeClassMap: Record<ButtonSize, string> = {
  default: "ui-button--md",
  sm: "ui-button--sm",
  lg: "ui-button--lg",
  icon: "ui-button--icon"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(variantClassMap[variant], sizeClassMap[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
