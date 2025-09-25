import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { createPortal } from 'react-dom';
import { theme } from '../styles/theme';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastContainer = styled.div<{ $position: ToastPosition }>`
  position: fixed;
  z-index: ${theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  max-width: 420px;
  width: 100%;
  padding: ${theme.spacing[4]};
  pointer-events: none;

  ${props => {
    switch (props.$position) {
      case 'top-right':
        return css`
          top: 0;
          right: 0;
        `;
      case 'top-left':
        return css`
          top: 0;
          left: 0;
        `;
      case 'bottom-right':
        return css`
          bottom: 0;
          right: 0;
        `;
      case 'bottom-left':
        return css`
          bottom: 0;
          left: 0;
        `;
      case 'top-center':
        return css`
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-center':
        return css`
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}

  @media (max-width: ${theme.breakpoints.sm}) {
    left: ${theme.spacing[4]};
    right: ${theme.spacing[4]};
    max-width: none;
    transform: none;
  }
`;

const ToastItem = styled.div<{ $variant: ToastVariant; $isEntering: boolean; $isExiting: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid;
  font-family: ${theme.typography.fontFamily.primary};
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: ${theme.shadows.lg};

  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  transform: ${props => {
    if (props.$isEntering) return 'translateX(100%) scale(0.95)';
    if (props.$isExiting) return 'translateX(100%) scale(0.95)';
    return 'translateX(0) scale(1)';
  }};
  opacity: ${props => {
    if (props.$isEntering || props.$isExiting) return 0;
    return 1;
  }};

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'success':
        return css`
          background: rgba(16, 185, 129, 0.95);
          border-color: ${theme.colors.success.light};
          color: white;
        `;

      case 'warning':
        return css`
          background: rgba(255, 194, 0, 0.95);
          border-color: ${theme.colors.warning.light};
          color: ${theme.colors.warning.dark};
        `;

      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.95);
          border-color: ${theme.colors.error.light};
          color: white;
        `;

      default: // info
        return css`
          background: rgba(0, 34, 110, 0.95);
          border-color: ${theme.colors.primary.light};
          color: white;
        `;
    }
  }}

  /* Progress bar */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: currentColor;
    opacity: 0.3;
    animation: progress var(--duration, 5000ms) linear forwards;
  }

  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

const ToastIcon = styled.div<{ $variant: ToastVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  flex-shrink: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  background: rgba(255, 255, 255, 0.2);
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};
  margin-bottom: ${theme.spacing[1]};
`;

const ToastMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.relaxed};
  opacity: 0.95;
`;

const ToastActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[2]};
`;

const ToastAction = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: currentColor;
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.spring};

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const ToastCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  color: currentColor;
  opacity: 0.8;
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.spring};
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const getToastIcon = (variant: ToastVariant): string => {
  switch (variant) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✕';
    default: return 'i';
  }
};

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
  isEntering: boolean;
  isExiting: boolean;
}

const ToastComponent: React.FC<ToastComponentProps> = ({
  toast,
  onRemove,
  isEntering,
  isExiting
}) => {
  const { id, title, message, variant = 'info', duration = 5000, persistent = false, action } = toast;

  useEffect(() => {
    if (persistent) return;

    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, persistent, onRemove]);

  return (
    <ToastItem
      $variant={variant}
      $isEntering={isEntering}
      $isExiting={isExiting}
      style={{ '--duration': `${duration}ms` } as React.CSSProperties}
    >
      <ToastIcon $variant={variant}>
        {getToastIcon(variant)}
      </ToastIcon>

      <ToastContent>
        {title && <ToastTitle>{title}</ToastTitle>}
        <ToastMessage>{message}</ToastMessage>

        {action && (
          <ToastActions>
            <ToastAction onClick={action.onClick}>
              {action.label}
            </ToastAction>
          </ToastActions>
        )}
      </ToastContent>

      <ToastCloseButton
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        ✕
      </ToastCloseButton>
    </ToastItem>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [enteringToasts, setEnteringToasts] = useState<Set<string>>(new Set());
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set());

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toastData, id };

    setToasts(current => {
      const updatedToasts = [newToast, ...current];
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(0, maxToasts);
      }
      return updatedToasts;
    });

    // Handle enter animation
    setEnteringToasts(current => new Set(current).add(id));
    setTimeout(() => {
      setEnteringToasts(current => {
        const newSet = new Set(current);
        newSet.delete(id);
        return newSet;
      });
    }, 50);

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    // Start exit animation
    setExitingToasts(current => new Set(current).add(id));

    setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
      setExitingToasts(current => {
        const newSet = new Set(current);
        newSet.delete(id);
        return newSet;
      });
    }, 200);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    setEnteringToasts(new Set());
    setExitingToasts(new Set());
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <ToastContainer $position={position}>
            {toasts.map(toast => (
              <ToastComponent
                key={toast.id}
                toast={toast}
                onRemove={removeToast}
                isEntering={enteringToasts.has(toast.id)}
                isExiting={exitingToasts.has(toast.id)}
              />
            ))}
          </ToastContainer>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'success' }),

    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'error' }),

    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'warning' }),

    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'info' }),
  };
};