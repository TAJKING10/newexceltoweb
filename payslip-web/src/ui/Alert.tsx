import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const AlertContainer = styled.div<{ $variant: AlertVariant }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid;
  font-family: ${theme.typography.fontFamily.primary};
  position: relative;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'success':
        return css`
          background: ${theme.colors.success.main}08;
          border-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;

      case 'warning':
        return css`
          background: ${theme.colors.warning.main}08;
          border-color: ${theme.colors.warning.light};
          color: ${theme.colors.warning.dark};
        `;

      case 'error':
        return css`
          background: ${theme.colors.error.main}08;
          border-color: ${theme.colors.error.light};
          color: ${theme.colors.error.dark};
        `;

      default: // info
        return css`
          background: ${theme.colors.primary.main}08;
          border-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
    }
  }}

  /* Accent border */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    border-radius: 2px 0 0 2px;
    background: ${props => {
      switch (props.$variant) {
        case 'success': return theme.colors.success.main;
        case 'warning': return theme.colors.warning.main;
        case 'error': return theme.colors.error.main;
        default: return theme.colors.primary.main;
      }
    }};
  }
`;

const AlertIcon = styled.div<{ $variant: AlertVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  flex-shrink: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};

  background: ${props => {
    switch (props.$variant) {
      case 'success': return theme.colors.success.main;
      case 'warning': return theme.colors.warning.main;
      case 'error': return theme.colors.error.main;
      default: return theme.colors.primary.main;
    }
  }};
  color: ${theme.colors.text.inverse};
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};
  margin-bottom: ${theme.spacing[1]};
`;

const AlertMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const AlertCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  color: currentColor;
  opacity: 0.7;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const getDefaultIcon = (variant: AlertVariant): string => {
  switch (variant) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✕';
    default: return 'i';
  }
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className,
  ...props
}) => {
  const defaultIcon = getDefaultIcon(variant);

  return (
    <AlertContainer $variant={variant} className={className} {...props}>
      <AlertIcon $variant={variant}>
        {icon || defaultIcon}
      </AlertIcon>

      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{children}</AlertMessage>
      </AlertContent>

      {onClose && (
        <AlertCloseButton onClick={onClose} aria-label="Close alert">
          ✕
        </AlertCloseButton>
      )}
    </AlertContainer>
  );
};