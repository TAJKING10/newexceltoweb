import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[4]};
`;

const LoginCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows['2xl']};
  padding: ${theme.spacing[8]};
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const LogoText = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.black};
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const LogoSubtext = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:invalid {
    border-color: ${theme.colors.error.main};
  }

  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
`;

const LoginButton = styled.button<{ loading?: boolean }>`
  background: ${theme.colors.gradients.primary};
  color: white;
  border: none;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.base};
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  position: relative;
  opacity: ${props => props.loading ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error.light}20;
  border: 1px solid ${theme.colors.error.light};
  color: ${theme.colors.error.dark};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
`;

const StatusMessage = styled.div<{ type: 'warning' | 'info' }>`
  background: ${props => props.type === 'warning' 
    ? `${theme.colors.warning.light}20` 
    : `${theme.colors.primary.light}20`};
  border: 1px solid ${props => props.type === 'warning' 
    ? theme.colors.warning.light 
    : theme.colors.primary.light};
  color: ${props => props.type === 'warning' 
    ? theme.colors.warning.dark 
    : theme.colors.primary.dark};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoginScreen: React.FC = () => {
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!profile) return null;
    
    if (profile.status === 'pending') {
      return (
        <StatusMessage type="warning">
          Your account is pending approval. Please contact your administrator.
        </StatusMessage>
      );
    }
    
    if (profile.status === 'inactive') {
      return (
        <StatusMessage type="warning">
          Your account has been deactivated. Please contact your administrator.
        </StatusMessage>
      );
    }
    
    return null;
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>🚀 UPP</LogoText>
          <LogoSubtext>Universal Payslip Platform</LogoSubtext>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </FormGroup>
          
          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          
          {getStatusMessage()}
          
          <LoginButton type="submit" loading={loading} disabled={loading}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              'Sign In'
            )}
          </LoginButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};