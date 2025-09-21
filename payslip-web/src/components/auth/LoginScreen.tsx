import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import LanguageSwitcher from '../LanguageSwitcher';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gradients.hero};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[6]};
  position: relative;

  /* Background pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(255, 194, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 120, 94, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(0, 58, 189, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LanguageSwitcherWrapper = styled.div`
  position: absolute;
  top: ${theme.spacing[6]};
  right: ${theme.spacing[6]};
  z-index: 10;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
`;

const BrandHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[10]};
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const BrandIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.text.inverse};
  box-shadow: ${theme.shadows.lg};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    background: ${theme.colors.gradients.accent};
    z-index: -1;
    opacity: 0.3;
  }
`;

const BrandName = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: ${theme.typography.lineHeight.tight};
  letter-spacing: ${theme.typography.letterSpacing.tight};
`;

const BrandTagline = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.snug};
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[5]};
`;

const LoginButton = styled(Button)`
  margin-top: ${theme.spacing[2]};
`;

const StatusMessage = styled.div<{ type: 'warning' | 'info' }>`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid ${props =>
    props.type === 'warning'
      ? theme.colors.warning.main
      : theme.colors.primary.light};
  background: ${props =>
    props.type === 'warning'
      ? `${theme.colors.warning.main}10`
      : `${theme.colors.primary.light}10`};
  color: ${props =>
    props.type === 'warning'
      ? theme.colors.warning.dark
      : theme.colors.primary.dark};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.relaxed};
  text-align: center;
  margin-top: ${theme.spacing[4]};
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid ${theme.colors.error.main};
  background: ${theme.colors.error.main}10;
  color: ${theme.colors.error.dark};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.relaxed};
  text-align: center;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  animation: slideInError 0.3s ease-out;

  @keyframes slideInError {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ErrorIcon = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  flex-shrink: 0;
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

      <LoginCard variant="glassmorphism" padding="xl">
        <BrandHeader>
          <BrandLogo>
            <BrandIcon>⚡</BrandIcon>
          </BrandLogo>
          <BrandName>Advensys Payslip</BrandName>
          <BrandTagline>Professional Payroll Management</BrandTagline>
        </BrandHeader>

        <LoginForm onSubmit={handleSubmit}>
          <FormSection>
            <Input
              label={t('auth.login.emailLabel', 'Email Address')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder', 'Enter your email address')}
              required
              disabled={loading}
              size="lg"
              fullWidth
              icon={<span>✉</span>}
            />

            <Input
              label={t('auth.login.passwordLabel', 'Password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder', 'Enter your password')}
              required
              disabled={loading}
              size="lg"
              fullWidth
              icon={<span>🔒</span>}
            />
          </FormSection>

          {error && (
            <ErrorMessage>
              <ErrorIcon>⚠️</ErrorIcon>
              <span>
                {error === 'Failed to fetch' ? t('auth.login.failedToFetch', 'Network error. Please check your connection.') : error}
              </span>
            </ErrorMessage>
          )}

          {getStatusMessage()}

          <LoginButton
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            icon={loading ? undefined : <span>🚀</span>}
          >
            {loading ? 'Signing In...' : t('auth.login.signInButton', 'Sign In')}
          </LoginButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};