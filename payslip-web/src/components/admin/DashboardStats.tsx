import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';
import { KPI } from '../../ui/KPI';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  pendingEmployees: number;
  totalPayslips: number;
  totalTemplates: number;
  monthlyPayslips: number;
  totalRevenue: number;
  avgSalary: number;
  recentActivity: DashboardActivityItem[];
  monthlyStats: MonthlyStats[];
  departmentStats: DepartmentStats[];
}

interface MonthlyStats {
  month: string;
  payslips: number;
  revenue: number;
  employees: number;
}

interface DepartmentStats {
  department: string;
  employees: number;
  avgSalary: number;
  totalSalary: number;
}

interface DashboardActivityItem {
  id: string;
  action: string;
  user_name: string;
  table_name: string;
  created_at: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${theme.shadows.glassmorphism};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.colors.gradients.accent};
    border-radius: ${theme.borderRadius['2xl']} ${theme.borderRadius['2xl']} 0 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: ${theme.shadows.glassmorphismLight}, ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const ChartTitle = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
`;

const MetricName = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const MetricValue = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.bold};
`;


const ActivitySection = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const ActivityHeader = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.secondary};
`;

const ActivityIcon = styled.div<{ action: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  
  ${props => {
    switch (props.action) {
      case 'INSERT':
        return `background: ${theme.colors.success.light}20; color: ${theme.colors.success.main};`;
      case 'UPDATE':
        return `background: ${theme.colors.warning.light}20; color: ${theme.colors.warning.main};`;
      case 'DELETE':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.main};`;
      default:
        return `background: ${theme.colors.primary.light}20; color: ${theme.colors.primary.main};`;
    }
  }}
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ActivityTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  margin-top: ${theme.spacing[1]};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

export const DashboardStats: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch employee stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, status, role')
        .eq('role', 'employee');

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
        // Continue with empty data instead of throwing
      }

      const totalEmployees = profiles?.length || 0;
      const activeEmployees = profiles?.filter(p => p.status === 'active').length || 0;
      const pendingEmployees = profiles?.filter(p => p.status === 'pending').length || 0;

      // Fetch payslip stats
      const { count: payslipCount, error: payslipError } = await supabase
        .from('payslips')
        .select('*', { count: 'exact', head: true });

      if (payslipError) {
        console.warn('Error fetching payslips:', payslipError);
        // Continue with zero count
      }

      // Fetch template stats
      const { count: templateCount, error: templateError } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true });

      if (templateError) {
        console.warn('Error fetching templates:', templateError);
        // Continue with zero count
      }

      // Fetch this month's payslips
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const { count: monthlyPayslipCount, error: monthlyPayslipError } = await supabase
        .from('payslips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyPayslipError) {
        console.warn('Error fetching monthly payslips:', monthlyPayslipError);
        // Continue with zero count
      }

      // Fetch salary statistics
      const { data: salaryData, error: salaryError } = await supabase
        .from('employees')
        .select('salary, department')
        .not('salary', 'is', null);

      if (salaryError) {
        console.warn('Error fetching salary data:', salaryError);
        // Continue with empty array
      }

      const totalRevenue = salaryData?.reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0;
      const avgSalary = salaryData && salaryData.length > 0 
        ? totalRevenue / salaryData.length 
        : 0;

      // Calculate department statistics
      const departmentMap = new Map<string, { employees: number; totalSalary: number }>();
      salaryData?.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        const current = departmentMap.get(dept) || { employees: 0, totalSalary: 0 };
        departmentMap.set(dept, {
          employees: current.employees + 1,
          totalSalary: current.totalSalary + (emp.salary || 0)
        });
      });

      const departmentStats: DepartmentStats[] = Array.from(departmentMap.entries()).map(([dept, stats]) => ({
        department: dept,
        employees: stats.employees,
        totalSalary: stats.totalSalary,
        avgSalary: stats.employees > 0 ? stats.totalSalary / stats.employees : 0
      }));

      // Generate monthly statistics for the last 6 months
      const monthlyStats: MonthlyStats[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
        const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        try {
          const { count: monthPayslips } = await supabase
            .from('payslips')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString());

          monthlyStats.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            payslips: monthPayslips || 0,
            revenue: totalRevenue, // This would be calculated per month in real scenario
            employees: totalEmployees
          });
        } catch (error) {
          console.warn('Error fetching monthly stats for', date, error);
          monthlyStats.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            payslips: 0,
            revenue: 0,
            employees: 0
          });
        }
      }

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('audit_logs')
        .select(`
          id, action, table_name, created_at,
          user_id,
          profiles!audit_logs_user_id_fkey (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (activityError) {
        console.warn('Error fetching activity data:', activityError);
        // Continue with empty array
      }

      const recentActivity: DashboardActivityItem[] = activityData?.map((item: any) => ({
        id: item.id,
        action: item.action,
        user_name: item.profiles?.full_name || item.profiles?.email || 'Unknown User',
        table_name: item.table_name,
        created_at: item.created_at
      })) || [];

      setStats({
        totalEmployees,
        activeEmployees,
        pendingEmployees,
        totalPayslips: payslipCount || 0,
        totalTemplates: templateCount || 0,
        monthlyPayslips: monthlyPayslipCount || 0,
        totalRevenue,
        avgSalary,
        recentActivity,
        monthlyStats,
        departmentStats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values if everything fails
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingEmployees: 0,
        totalPayslips: 0,
        totalTemplates: 0,
        monthlyPayslips: 0,
        totalRevenue: 0,
        avgSalary: 0,
        recentActivity: [],
        monthlyStats: [],
        departmentStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string): string => {
    switch (action) {
      case 'INSERT': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      default: return '📋';
    }
  };

  const getActionText = (action: string, tableName: string): string => {
    const table = tableName.replace('public.', '').replace('_', ' ');
    switch (action) {
      case 'INSERT': return `Created new ${table}`;
      case 'UPDATE': return `Updated ${table}`;
      case 'DELETE': return `Deleted ${table}`;
      default: return `Modified ${table}`;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner>{t('common.loading')} {t('dashboard.statistics', 'dashboard stats')}...</LoadingSpinner>;
  }

  if (!stats) {
    return <div>{t('errors.generic', 'Error loading dashboard statistics.')}</div>;
  }

  return (
    <Container>
      <StatsGrid>
        <KPI
          label={t('dashboard.totalEmployees')}
          value={stats.totalEmployees.toString()}
          icon="👥"
          variant="default"
          size="lg"
          description={t('dashboard.allRegisteredUsers', 'All registered users')}
        />

        <KPI
          label={t('dashboard.activeEmployees', 'Active Employees')}
          value={stats.activeEmployees.toString()}
          icon="✅"
          variant="accent"
          size="lg"
          description={t('dashboard.readyToWork', 'Ready to work')}
          changeType="positive"
        />

        <KPI
          label={t('dashboard.pendingApproval', 'Pending Approval')}
          value={stats.pendingEmployees.toString()}
          icon="⏳"
          variant="minimal"
          size="lg"
          description={t('dashboard.awaitingActivation', 'Awaiting activation')}
          changeType={stats.pendingEmployees > 0 ? "negative" : "neutral"}
        />

        <KPI
          label={t('dashboard.totalPayslips')}
          value={stats.totalPayslips.toString()}
          icon="📄"
          variant="default"
          size="lg"
          description={t('dashboard.generatedDocuments', 'Generated documents')}
          changeType="positive"
        />

        <KPI
          label={t('templates.title', 'Templates')}
          value={stats.totalTemplates.toString()}
          icon="🎨"
          variant="accent"
          size="lg"
          description={t('dashboard.availableDesigns', 'Available designs')}
        />

        <KPI
          label={t('dashboard.thisMonth')}
          value={stats.monthlyPayslips.toString()}
          icon="📅"
          variant="default"
          size="lg"
          description={t('dashboard.currentMonthPayslips', 'Current month payslips')}
          changeType="positive"
        />

        <KPI
          label={t('dashboard.averageSalary', 'Average Salary')}
          value={`€${Math.round(stats.avgSalary).toLocaleString()}`}
          icon="💰"
          variant="accent"
          size="lg"
          description={t('dashboard.perEmployeeAnnually', 'Per employee annually')}
        />

        <KPI
          label={t('dashboard.totalPayroll', 'Total Payroll')}
          value={`€${Math.round(stats.totalRevenue / 1000)}K`}
          icon="💳"
          variant="default"
          size="lg"
          description={t('dashboard.annualPayrollCosts', 'Annual payroll costs')}
          changeType="positive"
        />
      </StatsGrid>

      <ChartsContainer>
        <ChartCard>
          <ChartTitle>📊 {t('dashboard.monthlyPayslipTrends', 'Monthly Payslip Trends')}</ChartTitle>
          <MetricsList>
            {stats.monthlyStats.map((month, index) => (
              <MetricItem key={index}>
                <MetricName>{month.month}</MetricName>
                <MetricValue>{month.payslips} {t('payslips.title', 'payslips').toLowerCase()}</MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ChartCard>

        <ChartCard>
          <ChartTitle>🏢 {t('dashboard.departmentOverview', 'Department Overview')}</ChartTitle>
          <MetricsList>
            {stats.departmentStats.slice(0, 5).map((dept, index) => (
              <MetricItem key={index}>
                <div>
                  <MetricName>{dept.department}</MetricName>
                  <div style={{fontSize: '12px', color: theme.colors.text.tertiary}}>
                    {dept.employees} {t('dashboard.employees', 'employees').toLowerCase()} • {t('dashboard.avg', 'Avg')} €{Math.round(dept.avgSalary).toLocaleString()}
                  </div>
                </div>
                <MetricValue>€{Math.round(dept.totalSalary / 1000)}K</MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ChartCard>
      </ChartsContainer>

      <ActivitySection>
        <ActivityHeader>{t('dashboard.recentActivity', 'Recent Activity')}</ActivityHeader>
        <ActivityList>
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map(activity => (
              <ActivityItem key={activity.id}>
                <ActivityIcon action={activity.action}>
                  {getActionIcon(activity.action)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>
                    {activity.user_name} {getActionText(activity.action, activity.table_name)}
                  </ActivityText>
                  <ActivityTime>
                    {formatTimeAgo(activity.created_at)}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))
          ) : (
            <ActivityItem>
              <ActivityIcon action="INFO">📋</ActivityIcon>
              <ActivityContent>
                <ActivityText>{t('dashboard.noRecentActivity', 'No recent activity')}</ActivityText>
                <ActivityTime>{t('dashboard.systemReady', 'System is ready for use')}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          )}
        </ActivityList>
      </ActivitySection>
    </Container>
  );
};