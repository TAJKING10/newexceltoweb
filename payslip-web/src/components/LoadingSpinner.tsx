import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const LoaderContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-in-out;
  
  ${props => props.size === 'small' && `
    padding: 12px;
    gap: 8px;
  `}
  
  ${props => props.size === 'large' && `
    padding: 40px;
    gap: 24px;
    min-height: 200px;
  `}
`;

const Spinner = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  width: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '48px' : '32px'
  };
  height: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '48px' : '32px'
  };
  border: ${props => 
    props.size === 'small' ? '2px' : 
    props.size === 'large' ? '4px' : '3px'
  } solid #e2e8f0;
  border-top-color: #5b7cff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  color: #64748b;
  font-family: 'Inter', sans-serif;
  font-size: ${props => 
    props.size === 'small' ? '12px' : 
    props.size === 'large' ? '16px' : '14px'
  };
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
`;

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  size = 'medium' 
}) => {
  return (
    <LoaderContainer size={size}>
      <Spinner size={size} />
      <LoadingText size={size}>{text}</LoadingText>
    </LoaderContainer>
  );
};

export default LoadingSpinner;