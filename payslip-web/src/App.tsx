import React, { useState } from 'react';
import styled from 'styled-components';
import PayslipGenerator from './components/PayslipGenerator';
import MonthlyPayslipGenerator from './components/MonthlyPayslipGenerator';
import EnhancedTemplateBuilder from './components/EnhancedTemplateBuilder';
import PersonManagement from './components/PersonManagement';
import ErrorBoundary from './components/ErrorBoundary';
import { theme } from './styles/theme';

function App() {
  const [currentView, setCurrentView] = useState<'basic' | 'excel' | 'template' | 'persons'>('persons');


const AppContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
  flex: 1;
`;

const Header = styled.header`
  background: white;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  backdrop-filter: blur(10px);
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[6]} ${theme.spacing[4]};
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing[6]} 0;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.black};
  font-family: ${theme.typography.fontFamily.secondary};
  letter-spacing: ${theme.typography.letterSpacing.tight};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const NavigationTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[1]};
  }
`;

const NavTab = styled.button<{ isActive: boolean }>`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  border: none;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  min-height: 48px;
  white-space: nowrap;
  user-select: none;
  
  background: ${props => props.isActive 
    ? theme.colors.gradients.primary 
    : theme.colors.background.primary};
  color: ${props => props.isActive 
    ? theme.colors.text.inverse 
    : theme.colors.text.secondary};
  border: 2px solid ${props => props.isActive 
    ? 'transparent' 
    : theme.colors.border.light};
  box-shadow: ${props => props.isActive 
    ? `${theme.shadows.md}, ${theme.shadows.glow}` 
    : theme.shadows.xs};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isActive 
      ? 'transparent' 
      : 'linear-gradient(135deg, transparent 0%, rgba(91, 124, 255, 0.05) 50%, transparent 100%)'};
    opacity: 0;
    transition: opacity ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
    pointer-events: none;
  }
  
  &:hover {
    background: ${props => props.isActive 
      ? theme.colors.gradients.primary 
      : theme.colors.primary[50]};
    color: ${props => props.isActive 
      ? theme.colors.text.inverse 
      : theme.colors.primary.main};
    border-color: ${props => props.isActive 
      ? 'transparent' 
      : theme.colors.primary.light};
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props => props.isActive 
      ? `${theme.shadows.lg}, ${theme.shadows.glowLg}` 
      : `${theme.shadows.lg}, 0 0 15px rgba(91, 124, 255, 0.2)`};
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: ${props => props.isActive 
      ? `${theme.shadows.md}, ${theme.shadows.glow}` 
      : `${theme.shadows.base}, 0 0 10px rgba(91, 124, 255, 0.15)`};
    transition-duration: ${theme.animation.duration.fast};
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-height: 40px;
    
    span:last-child {
      display: none;
    }
  }

  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: ${props => props.isActive 
        ? `${theme.shadows.md}, ${theme.shadows.glow}` 
        : theme.shadows.xs};
    }
  }
`;

const FeatureBanner = styled.div`
  background: linear-gradient(135deg, 
    ${theme.colors.primary[50]} 0%, 
    ${theme.colors.success[50]} 100%);
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.light};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.colors.gradients.primary};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  }
`;

const FeatureText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  
  strong {
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeight.bold};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]};
  }
`;

const getFeatureText = (view: string) => {
  const features = {
    persons: 'Universal database • Employees • Customers • Contractors • Search & filter • History tracking',
    template: 'Expandable sections • Custom fields • Dynamic tables • Drag & drop',
    excel: 'Monthly columns (Jan-Dec) • Annual totals • Person selection • Template support • Real-time calculations',
    basic: 'Simple interface • Quick setup • Easy editing • Form-based'
  };
  return features[view as keyof typeof features] || '';
};

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Title>🚀 Universal Payslip Platform</Title>
          <NavigationTabs>
            <NavTab 
              isActive={currentView === 'persons'}
              onClick={() => setCurrentView('persons')}
              title="Universal person management for employees, customers, contractors, and more"
            >
              <span>👥</span>
              <span>Person Management</span>
            </NavTab>
            
            
            <NavTab 
              isActive={currentView === 'template'}
              onClick={() => setCurrentView('template')}
              title="Build custom payslip templates with drag & drop"
            >
              <span>🎨</span>
              <span>Template Builder</span>
            </NavTab>
            
            <NavTab 
              isActive={currentView === 'excel'}
              onClick={() => setCurrentView('excel')}
              title="Annual payslip with monthly columns and totals"
            >
              <span>📊</span>
              <span>Annual Excel View</span>
            </NavTab>
            
            <NavTab 
              isActive={currentView === 'basic'}
              onClick={() => setCurrentView('basic')}
              title="Simple form-based payslip"
            >
              <span>📝</span>
              <span>Basic View</span>
            </NavTab>
          </NavigationTabs>
          
          <FeatureBanner>
            <FeatureText>
              <strong>✨ Key Features:</strong> {getFeatureText(currentView)}
            </FeatureText>
          </FeatureBanner>
        </HeaderContent>
      </Header>
      
      <MainContent className="animate-fadeIn">
        <ErrorBoundary 
          onError={(error, errorInfo) => {
            console.error('App Error Boundary:', error, errorInfo);
          }}
        >
          {currentView === 'persons' && (
            <PersonManagement />
          )}
          
          {currentView === 'template' && (
            <EnhancedTemplateBuilder />
          )}
          
          {currentView === 'excel' && (
            <MonthlyPayslipGenerator />
          )}
          
          {currentView === 'basic' && (
            <PayslipGenerator />
          )}
        </ErrorBoundary>
      </MainContent>
    </AppContainer>
  );
}

export default App;
