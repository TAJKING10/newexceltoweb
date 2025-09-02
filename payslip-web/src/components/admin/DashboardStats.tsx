import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
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
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
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

const StatCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.animation.duration.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: start;
  margin-bottom: ${theme.spacing[3]};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['xl']};
  background: ${theme.colors.gradients.primary};
  color: white;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.black};
  color: ${theme.colors.text.primary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-top: ${theme.spacing[2]};
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.positive ? theme.colors.success.main : theme.colors.error.main};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-top: ${theme.spacing[1]};
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

      if (profilesError) throw profilesError;

      const totalEmployees = profiles?.length || 0;
      const activeEmployees = profiles?.filter(p => p.status === 'active').length || 0;
      const pendingEmployees = profiles?.filter(p => p.status === 'pending').length || 0;

      // Fetch payslip stats
      const { count: payslipCount, error: payslipError } = await supabase
        .from('payslips')
        .select('*', { count: 'exact', head: true });

      if (payslipError) throw payslipError;

      // Fetch template stats
      const { count: templateCount, error: templateError } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true });

      if (templateError) throw templateError;

      // Fetch this month's payslips
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const { count: monthlyPayslipCount, error: monthlyPayslipError } = await supabase
        .from('payslips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyPayslipError) throw monthlyPayslipError;

      // Fetch salary statistics
      const { data: salaryData, error: salaryError } = await supabase
        .from('employees')
        .select('salary, department')
        .not('salary', 'is', null);

      if (salaryError) throw salaryError;

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

      if (activityError) throw activityError;

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
    return <LoadingSpinner>Loading dashboard stats...</LoadingSpinner>;
  }

  if (!stats) {
    return <div>Error loading dashboard statistics.</div>;
  }

  return (
    <Container>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.totalEmployees}</StatValue>
              <StatLabel>Total Employees</StatLabel>
              <StatChange positive={true}>
                All registered users
              </StatChange>
            </div>
            <StatIcon>👥</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.activeEmployees}</StatValue>
              <StatLabel>Active Employees</StatLabel>
              <StatChange positive={true}>
                Ready to work
              </StatChange>
            </div>
            <StatIcon>✅</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.pendingEmployees}</StatValue>
              <StatLabel>Pending Approval</StatLabel>
              <StatChange positive={false}>
                Awaiting activation
              </StatChange>
            </div>
            <StatIcon>⏳</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.totalPayslips}</StatValue>
              <StatLabel>Total Payslips</StatLabel>
              <StatChange positive={true}>
                Generated documents
              </StatChange>
            </div>
            <StatIcon>📄</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.totalTemplates}</StatValue>
              <StatLabel>Templates</StatLabel>
              <StatChange positive={true}>
                Available designs
              </StatChange>
            </div>
            <StatIcon>🎨</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.monthlyPayslips}</StatValue>
              <StatLabel>This Month</StatLabel>
              <StatChange positive={true}>
                Current month payslips
              </StatChange>
            </div>
            <StatIcon>📅</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>€{Math.round(stats.avgSalary).toLocaleString()}</StatValue>
              <StatLabel>Average Salary</StatLabel>
              <StatChange positive={true}>
                Per employee annually
              </StatChange>
            </div>
            <StatIcon>💰</StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div>
              <StatValue>€{Math.round(stats.totalRevenue / 1000)}K</StatValue>
              <StatLabel>Total Payroll</StatLabel>
              <StatChange positive={true}>
                Annual payroll costs
              </StatChange>
            </div>
            <StatIcon>💳</StatIcon>
          </StatHeader>
        </StatCard>
      </StatsGrid>

      <ChartsContainer>
        <ChartCard>
          <ChartTitle>📊 Monthly Payslip Trends</ChartTitle>
          <MetricsList>
            {stats.monthlyStats.map((month, index) => (
              <MetricItem key={index}>
                <MetricName>{month.month}</MetricName>
                <MetricValue>{month.payslips} payslips</MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ChartCard>

        <ChartCard>
          <ChartTitle>🏢 Department Overview</ChartTitle>
          <MetricsList>
            {stats.departmentStats.slice(0, 5).map((dept, index) => (
              <MetricItem key={index}>
                <div>
                  <MetricName>{dept.department}</MetricName>
                  <div style={{fontSize: '12px', color: theme.colors.text.tertiary}}>
                    {dept.employees} employees • Avg €{Math.round(dept.avgSalary).toLocaleString()}
                  </div>
                </div>
                <MetricValue>€{Math.round(dept.totalSalary / 1000)}K</MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ChartCard>
      </ChartsContainer>

      <ActivitySection>
        <ActivityHeader>Recent Activity</ActivityHeader>
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
                <ActivityText>No recent activity</ActivityText>
                <ActivityTime>System is ready for use</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          )}
        </ActivityList>
      </ActivitySection>
    </Container>
  );
};