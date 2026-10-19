import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ className = '', variant = 'default', size = 'md', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' | 'outline' | 'soft' | 'danger'; size?: 'sm' | 'md' | 'lg' | 'icon' }) {
  return <button className={`ui-button ui-button-${variant} ui-button-${size} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'info' | 'warning' | 'violet' }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}

export function Divider({ vertical = false }: { vertical?: boolean }) {
  return <span aria-hidden="true" className={vertical ? 'ui-divider ui-divider-vertical' : 'ui-divider'} />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="section-label">{children}</div>;
}
