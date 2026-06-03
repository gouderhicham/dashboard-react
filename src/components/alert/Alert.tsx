import React from 'react';
import { Info } from 'lucide-react';

interface IAlertProps {
  /** Specifies the variant style of the alert */
  variant?: 'success' | 'info' | 'danger' | 'primary' | 'warning';
  /** Content inside the alert */
  children: React.ReactNode;
  /** Additional classes for custom styling */
  className?: string;
}

const variantStyles = {
  success: 'border-success-clarity bg-success-light text-success',
  info: 'border-info-clarity bg-info-light text-info',
  danger: 'border-danger-clarity bg-danger-light text-danger',
  primary: 'border-primary-clarity bg-primary-light text-primary',
  warning: 'border-warning-clarity bg-warning-light text-warning'
};

const Alert: React.FC<IAlertProps> = ({ variant = 'primary', children, className = '' }) => {
  return (
    <div
      className={`flex items-center gap-2.5 border rounded-md p-3 ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <Info className={`size-4 leading-0 ${variantStyles[variant].split(' ')[2]}`} />
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  );
};

export { Alert, type IAlertProps };
