'use client';

import { ButtonHTMLAttributes, ReactNode, MouseEvent, useState } from 'react';

interface RippleEffect {
  x: number;
  y: number;
  size: number;
  key: number;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  ripple = true,
  className = '',
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const newRipple: RippleEffect = {
        x,
        y,
        size,
        key: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-md font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {ripple && (
        <span className="absolute inset-0 overflow-hidden">
          {ripples.map((ripple) => (
            <span
              key={ripple.key}
              className="absolute bg-white/30 rounded-full animate-ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                transform: 'translate(-50%, -50%) scale(0)',
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
