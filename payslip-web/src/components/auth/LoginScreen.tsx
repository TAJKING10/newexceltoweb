import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import LanguageSwitcher from '../LanguageSwitcher';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[4]};
  position: relative;
`;

const LanguageSwitcherWrapper = styled.div`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  z-index: 10;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.glassmorphism};
  padding: ${theme.spacing[8]};
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  &:hover {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: ${theme.shadows.glassmorphismLight}, ${theme.shadows.lg};
    transform: translateY(-2px);
  }
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
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border: 2px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(0, 34, 110, 0.1), ${theme.shadows.md};
    transform: translateY(-1px);
  }

  &:invalid {
    border-color: ${theme.colors.error.main};
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
    font-weight: ${theme.typography.fontWeight.normal};
  }

  &:hover:not(:focus) {
    border-color: ${theme.colors.gray[400]};
    background: rgba(255, 255, 255, 0.9);
  }
`;

const LoginButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'loading'
})<{ loading?: boolean }>`
  background: ${theme.colors.gradients.primary};
  color: white;
  border: none;
  padding: ${theme.spacing[4]} ${theme.spacing[8]};
  border-radius: ${theme.borderRadius.xl};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  position: relative;
  opacity: ${props => props.loading ? 0.8 : 1};
  box-shadow: ${theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;

  &:hover:not(:disabled) {
    background: ${theme.colors.gradients.cool};
    transform: translateY(-3px);
    box-shadow: ${theme.shadows.lg}, ${theme.shadows.glow};
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.secondary.main};
    outline-offset: 2px;
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
  const { t } = useTranslation();
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
          {t('auth.login.accountPending', 'Your account is pending approval. Please contact your administrator.')}
        </StatusMessage>
      );
    }
    
    if (profile.status === 'inactive') {
      return (
        <StatusMessage type="warning">
          {t('auth.login.accountInactive', 'Your account has been deactivated. Please contact your administrator.')}
        </StatusMessage>
      );
    }
    
    return null;
  };

  return (
    <LoginContainer>
      <LanguageSwitcherWrapper>
        <LanguageSwitcher />
      </LanguageSwitcherWrapper>
      
      <LoginCard>
        <Logo>
          <LogoText>⚡ Advensys Payslip</LogoText>
          <LogoSubtext>Professional Payroll Management</LogoSubtext>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">{t('auth.login.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              required
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">{t('auth.login.passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              disabled={loading}
            />
          </FormGroup>
          
          {error && (
            <ErrorMessage>
              {error === 'Failed to fetch' ? t('auth.login.failedToFetch') : error}
            </ErrorMessage>
          )}
          
          {getStatusMessage()}
          
          <LoginButton type="submit" loading={loading} disabled={loading}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              t('auth.login.signInButton')
            )}
          </LoginButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};