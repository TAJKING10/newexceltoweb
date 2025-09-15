import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LanguageSwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.active ? '#5b7cff' : '#e1e5e9'};
  background: ${props => props.active ? '#5b7cff' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#4a6bef' : '#f8f9fa'};
    border-color: ${props => props.active ? '#4a6bef' : '#d1d5db'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(91, 124, 255, 0.2);
  }
`;

const LanguageLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
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
        active={i18n.language === 'en'}
        onClick={() => changeLanguage('en')}
        title={t('common.english')}
      >
        EN
      </LanguageButton>
      <LanguageButton
        active={i18n.language === 'fr'}
        onClick={() => changeLanguage('fr')}
        title={t('common.french')}
      >
        FR
      </LanguageButton>
    </LanguageSwitcherContainer>
  );
};

export default LanguageSwitcher;