import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export interface TableProps {
  children: React.ReactNode;
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  responsive?: boolean;
  className?: string;
}

const TableWrapper = styled.div<{ $responsive: boolean }>`
  width: 100%;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.light};

  ${props => props.$responsive && css`
    @media (max-width: ${theme.breakpoints.md}) {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      /* Hide scrollbar on mobile */
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  `}
`;

const TableBase = styled.table<{
  $variant: 'default' | 'striped' | 'bordered';
  $size: 'sm' | 'md' | 'lg';
  $stickyHeader: boolean;
}>`
  width: 100%;
  border-collapse: collapse;
  font-family: ${theme.typography.fontFamily.primary};
  background: ${theme.colors.background.primary};

  /* Size variants */
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

  /* Sticky header */
  ${props => props.$stickyHeader && css`
    thead th {
      position: sticky;
      top: 0;
      z-index: ${theme.zIndex.sticky};
    }
  `}

  /* Bordered variant */
  ${props => props.$variant === 'bordered' && css`
    th, td {
      border: 1px solid ${theme.colors.border.light};
    }
  `}
`;

const TableHead = styled.thead`
  background: ${theme.colors.background.tertiary};
`;

const TableHeader = styled.th<{ $size: 'sm' | 'md' | 'lg' }>`
  text-align: left;
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  border-bottom: 2px solid ${theme.colors.border.main};
  position: relative;

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing[5]} ${theme.spacing[6]};
        `;
      default:
        return css`
          padding: ${theme.spacing[4]} ${theme.spacing[5]};
        `;
    }
  }}

  /* Sorting indicator space */
  &[data-sortable] {
    cursor: pointer;
    user-select: none;
    padding-right: ${theme.spacing[8]};

    &::after {
      content: '↕';
      position: absolute;
      right: ${theme.spacing[3]};
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
      font-size: ${theme.typography.fontSize.xs};
    }

    &:hover {
      background: ${theme.colors.gray[100]};

      &::after {
        opacity: 1;
      }
    }

    &[data-sort="asc"]::after {
      content: '↑';
      opacity: 1;
    }

    &[data-sort="desc"]::after {
      content: '↓';
      opacity: 1;
    }
  }
`;

const TableBody = styled.tbody<{ $variant: 'default' | 'striped' | 'bordered' }>`
  /* Striped rows */
  ${props => props.$variant === 'striped' && css`
    tr:nth-child(even) {
      background: ${theme.colors.background.secondary};
    }
  `}
`;

const TableRow = styled.tr`
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};

  &:hover {
    background: ${theme.colors.primary.main}05;
  }

  /* Active row */
  &[data-active="true"] {
    background: ${theme.colors.primary.main}10;
  }

  /* Clickable rows */
  &[data-clickable="true"] {
    cursor: pointer;

    &:hover {
      background: ${theme.colors.primary.main}08;
      transform: scale(1.002);
    }

    &:active {
      transform: scale(1.001);
    }
  }
`;

const TableCell = styled.td<{ $size: 'sm' | 'md' | 'lg' }>`
  border-bottom: 1px solid ${theme.colors.border.light};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.relaxed};
  vertical-align: middle;

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing[5]} ${theme.spacing[6]};
        `;
      default:
        return css`
          padding: ${theme.spacing[4]} ${theme.spacing[5]};
        `;
    }
  }}

  /* Numeric alignment */
  &[data-type="number"] {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* Status cell styling */
  &[data-type="status"] {
    font-weight: ${theme.typography.fontWeight.semibold};
  }

  /* Truncated text */
  &[data-truncate="true"] {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing[12]} ${theme.spacing[6]};
  text-align: center;
  color: ${theme.colors.text.tertiary};
`;

const EmptyIcon = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  margin-bottom: ${theme.spacing[4]};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const Table: React.FC<TableProps> = ({
  children,
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  responsive = true,
  className,
  ...props
}) => {
  return (
    <TableWrapper $responsive={responsive} className={className}>
      <TableBase
        $variant={variant}
        $size={size}
        $stickyHeader={stickyHeader}
        {...props}
      >
        {children}
      </TableBase>
    </TableWrapper>
  );
};

// Compound components
Object.assign(Table, {
  Head: TableHead,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
}

export const TableEmptyState: React.FC<EmptyStateProps> = ({
  icon = '📊',
  title,
  message
}) => {
  return (
    <EmptyState>
      <EmptyIcon>{icon}</EmptyIcon>
      <EmptyTitle>{title}</EmptyTitle>
      {message && <EmptyMessage>{message}</EmptyMessage>}
    </EmptyState>
  );
};

// Add EmptyState to the compound components
Object.assign(Table, {
  ...Table,
  EmptyState: TableEmptyState,
});