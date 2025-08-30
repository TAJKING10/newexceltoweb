import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import { EmployeeManagement } from './EmployeeManagement';
import { SystemSettings } from './SystemSettings';
import { AuditLogs } from './AuditLogs';
import { DashboardStats } from './DashboardStats';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
`;

const Header = styled.header`
  background: white;
  padding: ${theme.spacing[6]} ${theme.spacing[8]};
  border-bottom: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
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

const Title = styled.h1`
  margin: 0;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.black};
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

const NavTab = styled.button<{ isActive: boolean }>`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border: none;
  background: transparent;
  color: ${props => props.isActive ? theme.colors.primary.main : theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.isActive ? theme.colors.primary.main : 'transparent'};
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

type TabType = 'overview' | 'employees' | 'settings' | 'audit';

export const AdminDashboard: React.FC = () => {
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
            <Title>🔧 Admin Dashboard</Title>
          </HeaderLeft>
          
          <HeaderRight>
            <UserInfo>
              <Avatar>
                {getInitials(profile?.full_name, profile?.email)}
              </Avatar>
              <UserDetails>
                <UserName>
                  {profile?.full_name || profile?.email || 'Admin'}
                </UserName>
                <UserRole>Administrator</UserRole>
              </UserDetails>
            </UserInfo>
            
            <LogoutButton 
              onClick={handleSignOut} 
              disabled={loading}
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </LogoutButton>
          </HeaderRight>
        </HeaderContent>
      </Header>
      
      <Navigation>
        <NavContent>
          <NavTab
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </NavTab>
          <NavTab
            isActive={activeTab === 'employees'}
            onClick={() => setActiveTab('employees')}
          >
            👥 Employee Management
          </NavTab>
          <NavTab
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ System Settings
          </NavTab>
          <NavTab
            isActive={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
          >
            📋 Audit Logs
          </NavTab>
        </NavContent>
      </Navigation>
      
      <MainContent>
        {renderActiveTab()}
      </MainContent>
    </DashboardContainer>
  );
};