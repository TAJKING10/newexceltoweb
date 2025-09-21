import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export interface KPIProps {
  label: string;
  value: string | number;
  change?: string | number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'minimal';
  loading?: boolean;
  description?: string;
  className?: string;
}

const KPIContainer = styled.div<{
  $size: 'sm' | 'md' | 'lg';
  $variant: 'default' | 'accent' | 'minimal';
}>`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${theme.shadows.glassmorphism};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  position: relative;
  overflow: hidden;

  /* Size variants */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          padding: ${theme.spacing[4]};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing[8]};
        `;
      default:
        return css`
          padding: ${theme.spacing[6]};
        `;
    }
  }}

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'accent':
        return css`
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background: ${theme.colors.gradients.accent};
            border-radius: 0 2px 2px 0;
          }
        `;

      case 'minimal':
        return css`
          background: ${theme.colors.background.primary};
          backdrop-filter: none;
          border: 1px solid ${theme.colors.border.light};
          box-shadow: ${theme.shadows.sm};
        `;

      default:
        return css`
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: ${theme.colors.gradients.primary};
          }
        `;
    }
  }}

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: ${theme.shadows.glassmorphismLight}, ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    transition: box-shadow ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  }
`;

const KPIHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[3]};
`;

const KPILabel = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.snug};

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.xs};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.md};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.sm};
        `;
    }
  }}
`;

const KPIIcon = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.gradients.primary};
  color: ${theme.colors.text.inverse};
  box-shadow: ${theme.shadows.sm};

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          width: 32px;
          height: 32px;
          font-size: ${theme.typography.fontSize.sm};
        `;
      case 'lg':
        return css`
          width: 48px;
          height: 48px;
          font-size: ${theme.typography.fontSize.xl};
        `;
      default:
        return css`
          width: 40px;
          height: 40px;
          font-size: ${theme.typography.fontSize.lg};
        `;
    }
  }}
`;

const KPIValue = styled.div<{ $size: 'sm' | 'md' | 'lg'; $loading: boolean }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.extrabold};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.tight};
  margin-bottom: ${theme.spacing[2]};

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.xl};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize['4xl']};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize['3xl']};
        `;
    }
  }}

  ${props => props.$loading && css`
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border-radius: ${theme.borderRadius.sm};
    color: transparent;

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `}
`;

const KPIChange = styled.div<{
  $changeType: 'positive' | 'negative' | 'neutral';
  $size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.xs};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.sm};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.xs};
        `;
    }
  }}

  ${props => {
    switch (props.$changeType) {
      case 'positive':
        return css`
          color: ${theme.colors.success.dark};
        `;
      case 'negative':
        return css`
          color: ${theme.colors.error.dark};
        `;
      default:
        return css`
          color: ${theme.colors.text.tertiary};
        `;
    }
  }}
`;

const TrendIcon = styled.span<{ $trend: 'up' | 'down' | 'stable' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${props => {
    switch (props.$trend) {
      case 'up':
        return css`
          &::before {
            content: '↗';
            color: ${theme.colors.success.main};
          }
        `;
      case 'down':
        return css`
          &::before {
            content: '↘';
            color: ${theme.colors.error.main};
          }
        `;
      default:
        return css`
          &::before {
            content: '→';
            color: ${theme.colors.text.tertiary};
          }
        `;
    }
  }}
`;

const KPIDescription = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.tertiary};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-top: ${theme.spacing[1]};

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.xs};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.sm};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.xs};
        `;
    }
  }}
`;

export const KPI: React.FC<KPIProps> = ({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  size = 'md',
  variant = 'default',
  loading = false,
  description,
  className
}) => {
  return (
    <KPIContainer $size={size} $variant={variant}>
      <KPIHeader>
        <KPILabel $size={size}>
          {label}
        </KPILabel>

        {icon && (
          <KPIIcon $size={size}>
            {icon}
          </KPIIcon>
        )}
      </KPIHeader>

      <KPIValue $size={size} $loading={loading}>
        {loading ? 'Loading...' : value}
      </KPIValue>

      {(change !== undefined || trend) && !loading && (
        <KPIChange $changeType={changeType} $size={size}>
          {trend && <TrendIcon $trend={trend} />}
          {change !== undefined && (
            <span>
              {changeType === 'positive' && '+'}
              {change}
              {typeof change === 'number' && '%'}
            </span>
          )}
        </KPIChange>
      )}
    </KPIContainer>
  );
};