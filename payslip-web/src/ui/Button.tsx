import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'success' | 'warning' | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const ButtonBase = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $loading: boolean;
  $fullWidth: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};
  border: 2px solid transparent;
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.smoothBounce};
  position: relative;
  user-select: none;
  text-decoration: none;
  white-space: nowrap;

  /* Disable text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  /* Focus states for accessibility */
  &:focus-visible {
    outline: 3px solid ${theme.colors.primary.light};
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Loading state */
  ${props => props.$loading && css`
    cursor: not-allowed;
    opacity: 0.8;
  `}

  /* Full width */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}

  /* Size variants */
  ${props => {
    const sizes = theme.components.button.size;
    const size = sizes[props.$size];
    return css`
      height: ${size.height};
      padding: ${size.padding};
      font-size: ${size.fontSize};
      border-radius: ${size.borderRadius};
    `;
  }}

  /* Color variants */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background: ${theme.colors.gradients.primary};
          color: ${theme.colors.text.inverse};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary.dark};
            box-shadow: ${theme.shadows.md}, ${theme.shadows.glow};
            transform: translateY(-2px) scale(1.02);
          }

          &:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            box-shadow: ${theme.shadows.sm};
          }
        `;

      case 'secondary':
        return css`
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.border.light};

          &:hover:not(:disabled) {
            background: ${theme.colors.gray[200]};
            border-color: ${theme.colors.border.main};
            transform: translateY(-2px) scale(1.02);
            box-shadow: ${theme.shadows.sm};
          }

          &:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            background: ${theme.colors.gray[300]};
          }
        `;

      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.gray[100]};
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            background: ${theme.colors.gray[200]};
          }
        `;

      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.primary.main};
          border-color: ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary.main};
            color: ${theme.colors.text.inverse};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.sm};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'accent':
        return css`
          background: ${theme.colors.gradients.accent};
          color: ${theme.colors.text.primary};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.accent.yellow.dark};
            box-shadow: ${theme.shadows.md}, ${theme.shadows.accentGlow};
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;

      case 'success':
        return css`
          background: ${theme.colors.success.main};
          color: ${theme.colors.text.inverse};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.success.dark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;

      case 'warning':
        return css`
          background: ${theme.colors.warning.main};
          color: ${theme.colors.text.primary};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.warning.dark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;

      case 'error':
        return css`
          background: ${theme.colors.error.main};
          color: ${theme.colors.text.inverse};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.error.dark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;

      default:
        return css`
          background: ${theme.colors.gradients.primary};
          color: ${theme.colors.text.inverse};
        `;
    }
  }}

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    transition: background-color ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut},
                border-color ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut},
                box-shadow ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border-top-color: currentColor;
    opacity: 0.5;
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.$position === 'right' && css`
    order: 1;
  `}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <ButtonBase
      $variant={variant}
      $size={size}
      $loading={loading}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && (
        <IconWrapper $position={iconPosition}>
          {icon}
        </IconWrapper>
      )}
      {children}
    </ButtonBase>
  );
};