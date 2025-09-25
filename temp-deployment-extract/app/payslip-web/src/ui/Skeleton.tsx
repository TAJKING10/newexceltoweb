import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '../styles/theme';

export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'rounded';
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
  className?: string;
}

const shimmerAnimation = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SkeletonBase = styled.div<{
  $variant: SkeletonVariant;
  $size: SkeletonSize;
  $width?: string | number;
  $height?: string | number;
  $animated: boolean;
}>`
  background: ${theme.colors.gray[200]};
  display: inline-block;
  position: relative;
  overflow: hidden;

  ${props => props.$animated && css`
    background: linear-gradient(
      90deg,
      ${theme.colors.gray[200]} 25%,
      ${theme.colors.gray[100]} 50%,
      ${theme.colors.gray[200]} 75%
    );
    background-size: 200px 100%;
    animation: ${shimmerAnimation} 1.5s infinite;
  `}

  ${props => !props.$animated && css`
    animation: ${pulseAnimation} 2s infinite;
  `}

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'text':
        return css`
          border-radius: ${theme.borderRadius.sm};
          height: ${theme.typography.lineHeight.normal}em;
          width: ${props.$width || '100%'};
        `;

      case 'circle':
        const circleSize = props.$height || props.$width || theme.components.skeleton.size[props.$size].height;
        return css`
          border-radius: ${theme.borderRadius.full};
          width: ${circleSize};
          height: ${circleSize};
        `;

      case 'rounded':
        return css`
          border-radius: ${theme.borderRadius.lg};
          width: ${props.$width || theme.components.skeleton.size[props.$size].width};
          height: ${props.$height || theme.components.skeleton.size[props.$size].height};
        `;

      default: // rect
        return css`
          border-radius: ${theme.borderRadius.sm};
          width: ${props.$width || theme.components.skeleton.size[props.$size].width};
          height: ${props.$height || theme.components.skeleton.size[props.$size].height};
        `;
    }
  }}

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${theme.colors.gray[200]};
  }
`;

const SkeletonGroup = styled.div<{ $gap: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap};
`;

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  size = 'md',
  width,
  height,
  lines = 1,
  animated = true,
  className,
  ...props
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <SkeletonGroup $gap={theme.spacing[2]} className={className}>
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonBase
            key={index}
            $variant={variant}
            $size={size}
            $width={index === lines - 1 ? '75%' : width}
            $height={height}
            $animated={animated}
            {...props}
          />
        ))}
      </SkeletonGroup>
    );
  }

  return (
    <SkeletonBase
      $variant={variant}
      $size={size}
      $width={width}
      $height={height}
      $animated={animated}
      className={className}
      {...props}
    />
  );
};

// Compound components for common patterns
interface SkeletonCardProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  animated?: boolean;
  className?: string;
}

const SkeletonCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.background.primary};
`;

const SkeletonCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const SkeletonCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = false,
  hasAvatar = false,
  lines = 3,
  animated = true,
  className
}) => {
  return (
    <SkeletonCardContainer className={className}>
      {hasImage && (
        <Skeleton
          variant="rounded"
          width="100%"
          height="200px"
          animated={animated}
        />
      )}

      <SkeletonCardHeader>
        {hasAvatar && (
          <Skeleton
            variant="circle"
            size="lg"
            animated={animated}
          />
        )}
        <div style={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="60%"
            animated={animated}
          />
          <div style={{ marginTop: theme.spacing[2] }}>
            <Skeleton
              variant="text"
              width="40%"
              animated={animated}
            />
          </div>
        </div>
      </SkeletonCardHeader>

      <SkeletonCardContent>
        <Skeleton
          variant="text"
          lines={lines}
          animated={animated}
        />
      </SkeletonCardContent>
    </SkeletonCardContainer>
  );
};

// Table skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  animated?: boolean;
  className?: string;
}

const SkeletonTableContainer = styled.div`
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  background: ${theme.colors.background.primary};
`;

const SkeletonTableRow = styled.div<{ $isHeader?: boolean }>`
  display: grid;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.light};

  ${props => props.$isHeader && css`
    background: ${theme.colors.background.tertiary};
  `}

  &:last-child {
    border-bottom: none;
  }
`;

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  animated = true,
  className
}) => {
  return (
    <SkeletonTableContainer className={className}>
      {/* Header */}
      <SkeletonTableRow
        $isHeader
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            width="80%"
            animated={animated}
          />
        ))}
      </SkeletonTableRow>

      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <SkeletonTableRow
          key={`row-${rowIndex}`}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={colIndex === 0 ? '100%' : '70%'}
              animated={animated}
            />
          ))}
        </SkeletonTableRow>
      ))}
    </SkeletonTableContainer>
  );
};

// Add compound components to main Skeleton component
Object.assign(Skeleton, {
  Card: SkeletonCard,
  Table: SkeletonTable,
});