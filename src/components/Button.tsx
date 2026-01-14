import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'answer';
  size?: 'normal' | 'large';
}

const variantClasses = {
  primary: 'bg-rainbow-blue hover:bg-rainbow-purple',
  success: 'bg-rainbow-purple hover:bg-rainbow-violet',
  warning: 'bg-rainbow-orange hover:bg-rainbow-red',
  answer: 'bg-rainbow-yellow text-kid-text hover:bg-rainbow-orange hover:text-white',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'normal',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses = size === 'large'
    ? 'min-h-tap-lg text-2xl px-8 py-4'
    : 'min-h-tap text-xl px-6 py-3';

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses}
        text-white font-fun font-bold
        rounded-kid-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-rainbow-yellow
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
