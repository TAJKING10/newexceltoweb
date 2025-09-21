import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'glassmorphism';
  interactive?: boolean;
  accentBorder?: boolean;
  accentPosition?: 'left' | 'top' | 'right' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CardBase = styled.div<{
  $padding: string;
  $variant: string;
  $interactive: boolean;
  $accentBorder: boolean;
  $accentPosition: string;
}>`
  /* Base styles */
  background: ${theme.colors.background.primary};
  border-radius: ${theme.components.card.borderRadius};
  position: relative;
  overflow: hidden;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  /* Padding variants */
  ${props => {
    switch (props.$padding) {
      case 'none':
        return css`padding: 0;`;
      case 'sm':
        return css`padding: ${theme.spacing[4]};`;
      case 'md':
        return css`padding: ${theme.spacing[6]};`;
      case 'lg':
        return css`padding: ${theme.spacing[8]};`;
      case 'xl':
        return css`padding: ${theme.spacing[10]};`;
      default:
        return css`padding: ${theme.components.card.padding};`;
    }
  }}

  /* Card variants */
  ${props => {
    switch (props.$variant) {
      case 'elevated':
        return css`
          box-shadow: ${theme.shadows.lg};
          border: 1px solid ${theme.colors.border.light};
        `;

      case 'outlined':
        return css`
          border: 2px solid ${theme.colors.border.light};
          box-shadow: ${theme.shadows.xs};
        `;

      case 'glassmorphism':
        return css`
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: ${theme.shadows.glassmorphism};
        `;

      default:
        return css`
          box-shadow: ${theme.components.card.shadow};
          border: 1px solid ${theme.colors.border.light};
        `;
    }
  }}

  /* Interactive state */
  ${props => props.$interactive && css`
    cursor: pointer;

    &:hover {
      box-shadow: ${props.$variant === 'glassmorphism'
        ? `${theme.shadows.glassmorphismLight}, ${theme.shadows.lg}`
        : theme.components.card.hoverShadow};
      transform: translateY(-2px) scale(1.005);

      ${props.$variant === 'glassmorphism' && css`
        background: rgba(255, 255, 255, 0.95);
      `}
    }

    &:active {
      transform: translateY(-1px) scale(1.002);
    }
  `}

  /* Accent border */
  ${props => props.$accentBorder && css`
    &::before {
      content: '';
      position: absolute;
      background: ${theme.colors.gradients.accent};
      z-index: 1;

      ${props.$accentPosition === 'left' && css`
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 2px 0 0 2px;
      `}

      ${props.$accentPosition === 'top' && css`
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        border-radius: 2px 2px 0 0;
      `}

      ${props.$accentPosition === 'right' && css`
        right: 0;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 0 2px 2px 0;
      `}

      ${props.$accentPosition === 'bottom' && css`
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        border-radius: 0 0 2px 2px;
      `}
    }
  `}

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    transition: box-shadow ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut},
                background-color ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  }

  /* Focus state for keyboard navigation */
  ${props => props.$interactive && css`
    &:focus-visible {
      outline: 3px solid ${theme.colors.primary.light};
      outline-offset: 2px;
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[4]};
  padding-bottom: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.border.light};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.tight};
`;

const CardContent = styled.div`
  /* Content styles inherit from parent */
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.border.light};
`;

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  variant = 'default',
  interactive = false,
  accentBorder = false,
  accentPosition = 'left',
  className,
  style,
  onClick,
  ...props
}) => {
  return (
    <CardBase
      $padding={padding}
      $variant={variant}
      $interactive={interactive}
      $accentBorder={accentBorder}
      $accentPosition={accentPosition}
      className={className}
      style={style}
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {children}
    </CardBase>
  );
};

// Compound components for common patterns - using Object.assign for compatibility
Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});