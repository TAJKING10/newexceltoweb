import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gradients.primary};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>') repeat;
    background-size: 50px 50px;
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[6]};
  z-index: 1;
  animation: ${slideUp} 0.8s ease-out;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.xl};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['2xl']};
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.h1`
  margin: 0;
  color: white;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SpinnerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: white;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-align: center;
  margin-top: ${theme.spacing[4]};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingSubtext = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  margin-top: ${theme.spacing[2]};
`;

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  subtext = "Please wait while we prepare your workspace"
}) => {
  return (
    <LoadingContainer>
      <LoadingContent>
        <LogoContainer>
          <LogoIcon>⚡</LogoIcon>
          <LogoText>Advensys Payslip</LogoText>
        </LogoContainer>

        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>

        <LoadingText>{message}</LoadingText>
        <LoadingSubtext>{subtext}</LoadingSubtext>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default LoadingScreen;