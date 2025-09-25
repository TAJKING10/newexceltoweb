import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const LanguageSwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LanguageButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 2px solid ${props => props.$active ? theme.colors.primary.main : theme.colors.border.light};
  background: ${props => props.$active ? theme.colors.primary.main : theme.colors.background.primary};
  color: ${props => props.$active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  min-width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$active ? theme.shadows.md : theme.shadows.sm};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$active
      ? 'transparent'
      : 'linear-gradient(135deg, transparent 0%, rgba(0, 34, 110, 0.05) 50%, transparent 100%)'};
    opacity: 0;
    transition: opacity ${theme.animation.duration.normal};
    pointer-events: none;
  }

  &:hover {
    background: ${props => props.$active ? theme.colors.primary.light : theme.colors.background.tertiary};
    border-color: ${props => props.$active ? theme.colors.primary.light : theme.colors.primary.light};
    color: ${props => props.$active ? theme.colors.text.inverse : theme.colors.primary.main};
    transform: translateY(-1px);
    box-shadow: ${props => props.$active ? `${theme.shadows.lg}, ${theme.shadows.glow}` : theme.shadows.md};

    &::before {
      opacity: 1;
    }
  }

  &:focus {
    outline: none;
    box-shadow: ${props => props.$active
      ? `${theme.shadows.md}, ${theme.shadows.glow}, 0 0 0 3px rgba(0, 34, 110, 0.2)`
      : `${theme.shadows.sm}, 0 0 0 3px rgba(0, 34, 110, 0.2)`};
  }

  &:active {
    transform: translateY(0);
    transition-duration: ${theme.animation.duration.fast};
  }
`;

const LanguageLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  font-family: ${theme.typography.fontFamily.primary};
  margin-right: ${theme.spacing[2]};
`;

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className, 
  showLabel = true 
}) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <LanguageSwitcherContainer className={className}>
      {showLabel && (
        <LanguageLabel>{t('common.language')}:</LanguageLabel>
      )}
      <LanguageButton
        $active={i18n.language === 'en'}
        onClick={() => changeLanguage('en')}
        title={t('common.english')}
      >
        EN
      </LanguageButton>
      <LanguageButton
        $active={i18n.language === 'fr'}
        onClick={() => changeLanguage('fr')}
        title={t('common.french')}
      >
        FR
      </LanguageButton>
    </LanguageSwitcherContainer>
  );
};

export default LanguageSwitcher;