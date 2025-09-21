import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const BadgeBase = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
  $dot: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};
  border-radius: ${theme.borderRadius.full};
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  /* Size variants */
  ${props => {
    const sizes = theme.components.badge.size;
    const size = sizes[props.$size];
    return css`
      height: ${size.height};
      padding: ${props.$dot ? '0' : size.padding};
      font-size: ${size.fontSize};
      border-radius: ${size.borderRadius};
      min-width: ${props.$dot ? size.height : 'auto'};
    `;
  }}

  /* Dot variant */
  ${props => props.$dot && css`
    width: ${theme.components.badge.size[props.$size].height};
    padding: 0;

    /* Hide text content for dot */
    color: transparent;
    overflow: hidden;
  `}

  /* Color variants */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background: rgba(0, 34, 110, 0.1);
          color: ${theme.colors.primary.main};
          border: 1px solid rgba(0, 34, 110, 0.2);

          &:hover {
            background: rgba(0, 34, 110, 0.15);
            transform: scale(1.05);
          }
        `;

      case 'secondary':
        return css`
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.gray[200]};

          &:hover {
            background: ${theme.colors.gray[200]};
            transform: scale(1.05);
          }
        `;

      case 'success':
        return css`
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success.dark};
          border: 1px solid rgba(16, 185, 129, 0.2);

          &:hover {
            background: rgba(16, 185, 129, 0.15);
            transform: scale(1.05);
          }
        `;

      case 'warning':
        return css`
          background: rgba(255, 194, 0, 0.1);
          color: ${theme.colors.warning.dark};
          border: 1px solid rgba(255, 194, 0, 0.2);

          &:hover {
            background: rgba(255, 194, 0, 0.15);
            transform: scale(1.05);
          }
        `;

      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error.dark};
          border: 1px solid rgba(239, 68, 68, 0.2);

          &:hover {
            background: rgba(239, 68, 68, 0.15);
            transform: scale(1.05);
          }
        `;

      case 'accent':
        return css`
          background: ${theme.colors.gradients.accent};
          color: ${theme.colors.text.primary};
          border: 1px solid transparent;
          box-shadow: ${theme.shadows.sm};

          &:hover {
            box-shadow: ${theme.shadows.md};
            transform: scale(1.05);
          }
        `;

      default:
        return css`
          background: rgba(0, 34, 110, 0.1);
          color: ${theme.colors.primary.main};
        `;
    }
  }}

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    transition: background-color ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  }
`;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  return (
    <BadgeBase
      $variant={variant}
      $size={size}
      $dot={dot}
      className={className}
      {...props}
    >
      {children}
    </BadgeBase>
  );
};