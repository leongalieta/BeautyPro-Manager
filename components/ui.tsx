import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
  
  const variants = {
    primary: "text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500/30 shadow-md hover:shadow-lg shadow-primary-500/20",
    secondary: "text-primary-700 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500/30",
    outline: "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500/30 shadow-md shadow-red-500/20",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, color?: string, className?: string }> = ({ children, color = 'bg-gray-100 text-gray-800', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${className}`}>
    {children}
  </span>
);

export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; className?: string }> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1.5 ml-0.5 ${className}`}>
    {children}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  label, error, leftIcon, rightElement, className = '', containerClassName = '', ...props 
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <Label>{label}</Label>}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
            {leftIcon}
          </div>
        )}
        <input 
          ref={ref}
          className={`
            block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 
            focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 
            transition-all duration-200 ease-in-out
            ${leftIcon ? 'pl-10' : 'pl-3.5'} 
            ${rightElement ? 'pr-10' : 'pr-3.5'} 
            py-2.5 sm:text-sm shadow-sm placeholder-gray-400
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500/10 focus:border-red-500 bg-red-50' : ''}
            ${className}
          `}
          {...props} 
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-500">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 flex items-center animate-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <div className="relative rounded-xl shadow-sm">
      <select
        className={`
          block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900
          focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10
          transition-all duration-200 ease-in-out
          py-2.5 pl-3.5 pr-10 sm:text-sm appearance-none
          ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500 bg-red-50' : ''}
          ${className}
        `}
        {...props}
      >
        {options ? options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )) : children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string }> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <textarea
      className={`
        block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900
        focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10
        transition-all duration-200 ease-in-out
        py-2.5 px-3.5 sm:text-sm shadow-sm
        ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500 bg-red-50' : ''}
        ${className}
      `}
      {...props}
    />
     {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

export const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-start">
    <button
      type="button"
      className={`
        relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${checked ? 'bg-primary-600' : 'bg-gray-200'}
      `}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
    {(label || description) && (
      <div className="ml-3 cursor-pointer select-none" onClick={() => onChange(!checked)}>
        {label && <span className="block text-sm font-medium text-gray-900">{label}</span>}
        {description && <span className="block text-sm text-gray-500 mt-0.5">{description}</span>}
      </div>
    )}
  </div>
);