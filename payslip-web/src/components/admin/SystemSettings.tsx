import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

interface SystemConfig {
  notifications: boolean;
  autoBackup: boolean;
  maintenance: boolean;
  retentionDays: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    fromAddress: string;
  };
  backupSettings: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionCount: number;
    includeFiles: boolean;
  };
}

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const Title = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const ActionsBar = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary};
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.md}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;
          &:hover { background: ${theme.colors.error.dark}; }
        `;
      default:
        return `
          background: white;
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border.light};
          &:hover { background: ${theme.colors.background.secondary}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover { transform: none; }
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const CardTitle = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const SettingsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
`;

const SettingInfo = styled.div`
  flex: 1;
  margin-right: ${theme.spacing[4]};
`;

const SettingLabel = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const SettingDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const Toggle = styled.button<{ isOn: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all ${theme.animation.duration.normal};
  flex-shrink: 0;
  
  background: ${props => props.isOn 
    ? theme.colors.gradients.primary 
    : theme.colors.background.tertiary};
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.isOn ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all ${theme.animation.duration.normal};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const Input = styled.input`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}20;
  }
`;

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const BackupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[4]};
`;

const BackupItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
`;

const BackupInfoSection = styled.div`
  flex: 1;
`;

const BackupName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const BackupDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  margin-right: ${theme.spacing[3]};
  
  ${props => {
    switch (props.status) {
      case 'completed':
        return `background: ${theme.colors.success.light}20; color: ${theme.colors.success.dark};`;
      case 'in_progress':
        return `background: ${theme.colors.warning.light}20; color: ${theme.colors.warning.dark};`;
      case 'failed':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.dark};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const BackupActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary.main};
          color: white;
          &:hover { background: ${theme.colors.primary.dark}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;
          &:hover { background: ${theme.colors.error.dark}; }
        `;
      default:
        return `
          background: ${theme.colors.background.tertiary};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.background.tertiary}; opacity: 0.8; }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const SystemHealthCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.success.light}10, ${theme.colors.primary.light}10);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const HealthMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[4]};
`;

const HealthMetric = styled.div`
  text-align: center;
  padding: ${theme.spacing[3]};
  background: white;
  border-radius: ${theme.borderRadius.md};
`;

const MetricValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    notifications: true,
    autoBackup: false,
    maintenance: false,
    retentionDays: 90,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'xlsx', 'json'],
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      fromAddress: ''
    },
    backupSettings: {
      frequency: 'daily',
      retentionCount: 7,
      includeFiles: true
    }
  });
  
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
    fetchBackups();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      // In a real implementation, this would fetch from a system_config table
      // For now, using mock data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system config:', error);
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    // Mock backup data
    const mockBackups: BackupInfo[] = [
      {
        id: '1',
        name: 'Daily Backup - 2024-01-15',
        size: '2.4 MB',
        created_at: '2024-01-15T02:00:00Z',
        type: 'automatic',
        status: 'completed'
      },
      {
        id: '2',
        name: 'Manual Backup - 2024-01-14',
        size: '2.3 MB',
        created_at: '2024-01-14T14:30:00Z',
        type: 'manual',
        status: 'completed'
      },
      {
        id: '3',
        name: 'Daily Backup - 2024-01-14',
        size: '2.2 MB',
        created_at: '2024-01-14T02:00:00Z',
        type: 'automatic',
        status: 'completed'
      }
    ];
    setBackups(mockBackups);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock save
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    try {
      // Create comprehensive system backup
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: {
          profiles: await fetchTableData('profiles'),
          employees: await fetchTableData('employees'),
          templates: await fetchTableData('templates'),
          payslips: await fetchTableData('payslips'),
          audit_logs: await fetchTableData('audit_logs')
        },
        settings: config
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup');
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  };

  const exportSystemData = async () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        system: {
          totalUsers: 0,
          totalEmployees: 0,
          totalTemplates: 0,
          totalPayslips: 0
        },
        data: {
          profiles: await fetchTableData('profiles'),
          employees: await fetchTableData('employees'),
          templates: await fetchTableData('templates')
        }
      };

      // Calculate totals
      exportData.system.totalUsers = exportData.data.profiles.length;
      exportData.system.totalEmployees = exportData.data.employees.length;
      exportData.system.totalTemplates = exportData.data.templates.length;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting system data:', error);
      alert('Error exporting system data');
    }
  };

  const resetSystem = async () => {
    if (!window.confirm('⚠️ This will reset all system settings to defaults. Are you sure?')) {
      return;
    }
    
    if (!window.confirm('⚠️ FINAL WARNING: This action cannot be undone. Continue?')) {
      return;
    }

    setConfig({
      notifications: true,
      autoBackup: false,
      maintenance: false,
      retentionDays: 90,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'xlsx', 'json'],
      emailSettings: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        fromAddress: ''
      },
      backupSettings: {
        frequency: 'daily',
        retentionCount: 7,
        includeFiles: true
      }
    });
    
    alert('System settings have been reset to defaults.');
  };

  if (loading) {
    return <LoadingSpinner>Loading system settings...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>⚙️ System Settings & Management</Title>
        <ActionsBar>
          <Button variant="secondary" onClick={createBackup}>
            💾 Create Backup
          </Button>
          <Button variant="secondary" onClick={exportSystemData}>
            📤 Export Data
          </Button>
          <Button variant="danger" onClick={resetSystem}>
            🔄 Reset Settings
          </Button>
          <Button variant="primary" onClick={saveConfig} disabled={saving}>
            {saving ? '💾 Saving...' : '💾 Save Settings'}
          </Button>
        </ActionsBar>
      </Header>

      <FullWidthCard>
        <SystemHealthCard>
          <CardTitle>🖥️ System Health Overview</CardTitle>
          <HealthMetrics>
            <HealthMetric>
              <MetricValue>99.9%</MetricValue>
              <MetricLabel>Uptime</MetricLabel>
            </HealthMetric>
            <HealthMetric>
              <MetricValue>120ms</MetricValue>
              <MetricLabel>Avg Response</MetricLabel>
            </HealthMetric>
            <HealthMetric>
              <MetricValue>2.4GB</MetricValue>
              <MetricLabel>Storage Used</MetricLabel>
            </HealthMetric>
            <HealthMetric>
              <MetricValue>0.1%</MetricValue>
              <MetricLabel>Error Rate</MetricLabel>
            </HealthMetric>
          </HealthMetrics>
        </SystemHealthCard>
      </FullWidthCard>

      <SettingsGrid>
        <SettingsCard>
          <CardTitle>🔔 Notifications</CardTitle>
          <SettingsGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Email Notifications</SettingLabel>
                <SettingDescription>
                  Receive email notifications for system events, user registrations, and errors.
                </SettingDescription>
              </SettingInfo>
              <Toggle 
                isOn={config.notifications} 
                onClick={() => setConfig({...config, notifications: !config.notifications})}
              />
            </SettingItem>
          </SettingsGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>💾 Data Management</CardTitle>
          <SettingsGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Automatic Backups</SettingLabel>
                <SettingDescription>
                  Automatically backup system data at scheduled intervals.
                </SettingDescription>
              </SettingInfo>
              <Toggle 
                isOn={config.autoBackup} 
                onClick={() => setConfig({...config, autoBackup: !config.autoBackup})}
              />
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Backup Frequency</SettingLabel>
                <SettingDescription>
                  How often to create automatic backups.
                </SettingDescription>
              </SettingInfo>
              <Select 
                value={config.backupSettings.frequency}
                onChange={(e) => setConfig({...config, backupSettings: {...config.backupSettings, frequency: e.target.value as any}})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Data Retention (Days)</SettingLabel>
                <SettingDescription>
                  How long to keep historical data before archiving.
                </SettingDescription>
              </SettingInfo>
              <Input 
                type="number" 
                value={config.retentionDays}
                onChange={(e) => setConfig({...config, retentionDays: parseInt(e.target.value) || 90})}
              />
            </SettingItem>
          </SettingsGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>🚧 System Maintenance</CardTitle>
          <SettingsGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Maintenance Mode</SettingLabel>
                <SettingDescription>
                  Enable maintenance mode to prevent user access during system updates.
                </SettingDescription>
              </SettingInfo>
              <Toggle 
                isOn={config.maintenance} 
                onClick={() => setConfig({...config, maintenance: !config.maintenance})}
              />
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Maximum File Size (MB)</SettingLabel>
                <SettingDescription>
                  Maximum allowed file size for uploads.
                </SettingDescription>
              </SettingInfo>
              <Input 
                type="number" 
                value={config.maxFileSize}
                onChange={(e) => setConfig({...config, maxFileSize: parseInt(e.target.value) || 10})}
              />
            </SettingItem>
          </SettingsGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>📧 Email Settings</CardTitle>
          <SettingsGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>SMTP Host</SettingLabel>
                <SettingDescription>
                  SMTP server hostname for sending emails.
                </SettingDescription>
              </SettingInfo>
              <Input 
                type="text" 
                value={config.emailSettings.smtpHost}
                onChange={(e) => setConfig({...config, emailSettings: {...config.emailSettings, smtpHost: e.target.value}})}
                placeholder="smtp.gmail.com"
                style={{width: '180px'}}
              />
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>SMTP Port</SettingLabel>
                <SettingDescription>
                  SMTP server port (usually 587 for TLS).
                </SettingDescription>
              </SettingInfo>
              <Input 
                type="number" 
                value={config.emailSettings.smtpPort}
                onChange={(e) => setConfig({...config, emailSettings: {...config.emailSettings, smtpPort: parseInt(e.target.value) || 587}})}
              />
            </SettingItem>
          </SettingsGroup>
        </SettingsCard>
      </SettingsGrid>

      <FullWidthCard>
        <CardTitle>💾 Backup Management</CardTitle>
        <BackupsList>
          {backups.map(backup => (
            <BackupItem key={backup.id}>
              <BackupInfoSection>
                <BackupName>{backup.name}</BackupName>
                <BackupDetails>
                  {backup.size} • {new Date(backup.created_at).toLocaleString()} • {backup.type}
                </BackupDetails>
              </BackupInfoSection>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StatusBadge status={backup.status}>{backup.status}</StatusBadge>
                <BackupActions>
                  <SmallButton variant="secondary">Download</SmallButton>
                  <SmallButton variant="secondary">Restore</SmallButton>
                  <SmallButton variant="danger">Delete</SmallButton>
                </BackupActions>
              </div>
            </BackupItem>
          ))}
        </BackupsList>
      </FullWidthCard>
    </Container>
  );
};