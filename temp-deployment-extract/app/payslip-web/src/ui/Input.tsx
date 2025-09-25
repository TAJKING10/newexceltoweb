import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'success' | 'warning' | 'error';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.tight};
`;

const InputWrapper = styled.div<{
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
  $fullWidth: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  ${props => props.$hasIcon && props.$iconPosition === 'left' && css`
    padding-left: ${theme.spacing[10]};
  `}

  ${props => props.$hasIcon && props.$iconPosition === 'right' && css`
    padding-right: ${theme.spacing[10]};
  `}
`;

const InputBase = styled.input<{
  $size: InputSize;
  $state: InputState;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
  $fullWidth: boolean;
}>`
  /* Base styles */
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  border: 2px solid ${theme.colors.border.light};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.anticipate};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  /* Remove default appearance */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Size variants */
  ${props => {
    const sizes = theme.components.input.size;
    const size = sizes[props.$size];
    return css`
      height: ${size.height};
      padding: ${size.padding};
      font-size: ${size.fontSize};
      border-radius: ${size.borderRadius};
    `;
  }}

  /* Icon spacing */
  ${props => props.$hasIcon && props.$iconPosition === 'left' && css`
    padding-left: ${theme.spacing[10]};
  `}

  ${props => props.$hasIcon && props.$iconPosition === 'right' && css`
    padding-right: ${theme.spacing[10]};
  `}

  /* Placeholder styles */
  &::placeholder {
    color: ${theme.colors.text.quaternary};
    font-weight: ${theme.typography.fontWeight.normal};
  }

  /* Focus state */
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 4px rgba(0, 34, 110, 0.1);
    transform: translateY(-1px);
  }

  /* Hover state */
  &:hover:not(:focus):not(:disabled) {
    border-color: ${theme.colors.border.main};
  }

  /* Disabled state */
  &:disabled {
    background: ${theme.colors.gray[100]};
    border-color: ${theme.colors.border.light};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }

  /* State variants */
  ${props => {
    switch (props.$state) {
      case 'success':
        return css`
          border-color: ${theme.colors.border.success};

          &:focus {
            border-color: ${theme.colors.success.main};
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
        `;

      case 'warning':
        return css`
          border-color: ${theme.colors.warning.main};

          &:focus {
            border-color: ${theme.colors.warning.dark};
            box-shadow: 0 0 0 4px rgba(255, 194, 0, 0.1);
          }
        `;

      case 'error':
        return css`
          border-color: ${theme.colors.border.error};

          &:focus {
            border-color: ${theme.colors.error.main};
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }
        `;

      default:
        return '';
    }
  }}

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    transition: border-color ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut},
                box-shadow ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  }
`;

const IconContainer = styled.div<{
  $position: 'left' | 'right';
  $size: InputSize;
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.tertiary};
  pointer-events: none;
  z-index: 1;

  ${props => props.$position === 'left' && css`
    left: ${theme.spacing[3]};
  `}

  ${props => props.$position === 'right' && css`
    right: ${theme.spacing[3]};
  `}

  /* Icon size based on input size */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          width: 16px;
          height: 16px;
          font-size: 16px;
        `;
      case 'lg':
        return css`
          width: 20px;
          height: 20px;
          font-size: 20px;
        `;
      default:
        return css`
          width: 18px;
          height: 18px;
          font-size: 18px;
        `;
    }
  }}
`;

const HelperText = styled.div<{ $state: InputState }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.snug};

  ${props => {
    switch (props.$state) {
      case 'success':
        return css`
          color: ${theme.colors.success.dark};
        `;
      case 'warning':
        return css`
          color: ${theme.colors.warning.dark};
        `;
      case 'error':
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

export const Input: React.FC<InputProps> = ({
  size = 'md',
  state = 'default',
  label,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <InputContainer $fullWidth={fullWidth}>
      {label && (
        <Label htmlFor={inputId}>
          {label}
        </Label>
      )}

      <InputWrapper
        $hasIcon={!!icon}
        $iconPosition={iconPosition}
        $fullWidth={fullWidth}
      >
        {icon && (
          <IconContainer $position={iconPosition} $size={size}>
            {icon}
          </IconContainer>
        )}

        <InputBase
          id={inputId}
          $size={size}
          $state={state}
          $hasIcon={!!icon}
          $iconPosition={iconPosition}
          $fullWidth={fullWidth}
          {...props}
        />
      </InputWrapper>

      {helperText && (
        <HelperText $state={state}>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
};