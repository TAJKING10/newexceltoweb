import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import LanguageSwitcher from '../LanguageSwitcher';
import { EmployeeManagement } from './EmployeeManagement';
import { SystemSettings } from './SystemSettings';
import { AuditLogs } from './AuditLogs';
import { DashboardStats } from './DashboardStats';
// import { TemplateManagement } from './TemplateManagement'; // Commented out - template management disabled
import { ReportsAnalytics } from './ReportsAnalytics';
import CustomerManagement from '../CustomerManagement';
import { AdminCustomerPayslipManager } from './AdminCustomerPayslipManager';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: ${theme.spacing[6]} ${theme.spacing[8]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: ${theme.shadows.glassmorphism};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const BrandIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.inverse};
  box-shadow: ${theme.shadows.sm};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: ${theme.colors.gradients.accent};
    z-index: -1;
    opacity: 0.3;
  }
`;

const Title = styled.h1`
  margin: 0;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.extrabold};
  font-family: ${theme.typography.fontFamily.primary};
  letter-spacing: ${theme.typography.letterSpacing.tight};
  line-height: ${theme.typography.lineHeight.tight};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserRole = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.border.light};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  
  &:hover {
    background: ${theme.colors.error.light}20;
    border-color: ${theme.colors.error.light};
    color: ${theme.colors.error.main};
  }
`;

const Navigation = styled.nav`
  background: white;
  border-bottom: 1px solid ${theme.colors.border.light};
  padding: 0 ${theme.spacing[8]};
  overflow-x: auto;
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: ${theme.spacing[1]};
  min-width: max-content;
`;

const NavTab = styled.button<{ $isActive: boolean }>`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border: none;
  background: transparent;
  color: ${props => props.$isActive ? theme.colors.primary.main : theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$isActive ? theme.colors.primary.main : 'transparent'};
  transition: all ${theme.animation.duration.normal};
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.light}10;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing[8]};
`;

type TabType = 'overview' | 'employees' | 'customers' | 'payslips' | /* 'templates' | */ 'reports' | 'settings' | 'audit'; // templates disabled

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats />;
      case 'employees':
        return <EmployeeManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'payslips':
        return <AdminCustomerPayslipManager />;
      // case 'templates':
      //   return <TemplateManagement />; // Template management disabled
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SystemSettings />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BrandHeader>
              <BrandIcon>⚡</BrandIcon>
              <Title>Advensys Payslip - Admin</Title>
            </BrandHeader>
          </HeaderLeft>
          
          <HeaderRight>
            <LanguageSwitcher />
            <UserInfo>
              <Avatar>
                {getInitials(profile?.full_name, profile?.email)}
              </Avatar>
              <UserDetails>
                <UserName>
                  {profile?.full_name || profile?.email || t('admin.title', 'Admin')}
                </UserName>
                <UserRole>{t('admin.administrator', 'Administrator')}</UserRole>
              </UserDetails>
            </UserInfo>
            
            <LogoutButton 
              onClick={handleSignOut} 
              disabled={loading}
            >
              {loading ? t('auth.signingOut', 'Signing out...') : t('auth.signOut')}
            </LogoutButton>
          </HeaderRight>
        </HeaderContent>
      </Header>
      
      <Navigation>
        <NavContent>
          <NavTab
            $isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            📊 {t('admin.overview')}
          </NavTab>
          <NavTab
            $isActive={activeTab === 'employees'}
            onClick={() => setActiveTab('employees')}
          >
            👥 {t('admin.employees')}
          </NavTab>
          <NavTab
            $isActive={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
          >
            🎯 {t('admin.customers', 'Customers')}
          </NavTab>
          <NavTab
            $isActive={activeTab === 'payslips'}
            onClick={() => setActiveTab('payslips')}
          >
            📄 {t('admin.payslips', 'Super Admin Payslips')}
          </NavTab>
          {/* Template Management tab disabled
          <NavTab
            $isActive={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
          >
            🎨 {t('admin.templates')}
          </NavTab>
          */}
          <NavTab
            $isActive={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          >
            📊 {t('admin.reports')}
          </NavTab>
          <NavTab
            $isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ {t('admin.settings')}
          </NavTab>
          <NavTab
            $isActive={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
          >
            📋 {t('admin.audit')}
          </NavTab>
        </NavContent>
      </Navigation>
      
      <MainContent>
        {renderActiveTab()}
      </MainContent>
    </DashboardContainer>
  );
};

// Thank you for using Advensys Payslip!