import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';
import { KPI } from '../../ui/KPI';
import { customerManager } from '../../utils/customerManager';
import { useAuth } from '../../contexts/AuthContext';

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
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customersByType: Record<string, number>;
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
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let isMounted = true;

    const initializeStats = async () => {
      // Wait for authentication to be complete
      if (authLoading) {
        console.log('📊 DashboardStats: Waiting for auth to complete...');
        return;
      }

      if (!user || !profile) {
        console.warn('📊 DashboardStats: No user or profile available');
        if (isMounted) {
          setLoading(false);
          setError('Authentication required');
        }
        return;
      }

      console.log('📊 DashboardStats: Auth complete, starting stats fetch...');

      // Add a delay and check for session readiness before fetching
      const checkSessionAndFetch = async () => {
        let attempts = 0;
        const maxAttempts = 10; // Try for up to 10 seconds

        const waitForSession = async (): Promise<boolean> => {
          attempts++;
          console.log(`🔄 Checking session readiness (attempt ${attempts}/${maxAttempts})...`);

          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              console.log('✅ Session ready with valid token');
              return true;
            } else {
              console.log('⏳ Session not ready, waiting...');
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return waitForSession();
              }
              return false;
            }
          } catch (error) {
            console.warn('⚠️ Session check error:', error);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return waitForSession();
            }
            return false;
          }
        };

        const sessionReady = await waitForSession();
        if (isMounted) {
          if (sessionReady) {
            console.log('🚀 Session ready, starting data fetch...');
          } else {
            console.log('⚠️ Session not ready after waiting, proceeding anyway...');
          }
          fetchStats();
        }
      };

      setTimeout(checkSessionAndFetch, 1000); // Initial 1 second delay
    };

    initializeStats();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 DashboardStats: Starting to fetch stats...');

      // Ensure we have a valid session before making API calls
      let sessionValid = false;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 Current session status:', session ? 'Found' : 'None', sessionError ? `Error: ${sessionError.message}` : 'No error');

        if (!session && !sessionError) {
          console.warn('⚠️ No active session, attempting refresh...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn('⚠️ Session refresh failed:', refreshError.message);
            console.log('📋 Continuing with cached user data, API calls may fail gracefully');
            sessionValid = false;
          } else if (refreshData?.session) {
            console.log('✅ Session refreshed successfully for API calls');
            sessionValid = true;
          } else {
            console.warn('⚠️ No session returned from refresh');
            sessionValid = false;
          }
        } else if (session) {
          console.log('✅ Valid session found for API calls');
          sessionValid = true;
        } else {
          console.warn('⚠️ Session error:', sessionError?.message);
          sessionValid = false;
        }
      } catch (error) {
        console.warn('⚠️ Session validation error:', error);
        console.log('📋 Continuing without session validation, will attempt API calls anyway');
        sessionValid = false;
      }

      // Set a more reasonable timeout for individual queries
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ DashboardStats: Fetch timeout, using default values');
        // Don't show error, just use default values and continue
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
          departmentStats: [],
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
          customersByType: {}
        });
        setLoading(false);
        console.log('📊 DashboardStats: Using default values due to timeout');
      }, 25000); // 25 second timeout (increased for better reliability)

      // Fetch employee stats with timeout protection and retry
      let profiles: any[] = [];
      const maxRetries = 2;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📊 Fetching employee profiles... (attempt ${attempt}/${maxRetries})`);
          const profilesPromise = supabase
            .from('profiles')
            .select('id, status, role')
            .eq('role', 'employee');

          const profilesResult: any = await Promise.race([
            profilesPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profiles query timeout')), 12000) // Increased from 5s to 12s
            )
          ]);

          profiles = profilesResult.data || [];
          if (profilesResult.error) {
            console.warn(`❌ Profiles query error (attempt ${attempt}/${maxRetries}):`, {
              message: profilesResult.error.message,
              code: profilesResult.error.code,
              details: profilesResult.error.details,
              hint: profilesResult.error.hint
            });
            if (attempt === maxRetries) {
              profiles = []; // Final fallback
            }
          } else {
            console.log('✅ Successfully fetched profiles:', profiles?.length || 0);
            break; // Success, exit retry loop
          }
        } catch (error) {
          console.warn(`⚠️ Profiles fetch failed or timed out (attempt ${attempt}/${maxRetries}):`, error);
          if (attempt === maxRetries) {
            profiles = []; // Final fallback
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      const totalEmployees = profiles?.length || 0;
      const activeEmployees = profiles?.filter((p: any) => p.status === 'active').length || 0;
      const pendingEmployees = profiles?.filter((p: any) => p.status === 'pending').length || 0;

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

      // Fetch customer statistics
      let customerStats = {
        total: 0,
        active: 0,
        inactive: 0,
        byType: {} as Record<string, number>
      };

      try {
        customerStats = await customerManager.getCustomerStats();
      } catch (error) {
        console.warn('Error fetching customer stats:', error);
        // Continue with default values
      }

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
        departmentStats,
        totalCustomers: customerStats.total,
        activeCustomers: customerStats.active,
        inactiveCustomers: customerStats.inactive,
        customersByType: customerStats.byType
      });

      // Clear timeout if we reach here successfully
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('❌ DashboardStats: Error fetching stats:', error);

      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 DashboardStats: Retrying... (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchStats(), 2000); // Retry after 2 seconds
        return; // Don't set error or default stats yet
      }

      // Max retries reached - use default values
      console.warn('⚠️ DashboardStats: Max retries reached, using default values');
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
        departmentStats: [],
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        customersByType: {}
      });
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= maxRetries || !error) {
        setLoading(false);
        console.log('✅ DashboardStats: Fetch stats completed');
      }
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

  // Show loading during auth check or data fetch
  if (authLoading || loading) {
    return <LoadingSpinner>{t('common.loading')} {t('dashboard.statistics', 'dashboard stats')}...</LoadingSpinner>;
  }

  // Show error if there was a problem
  if (error) {
    return (
      <div style={{
        padding: theme.spacing[8],
        textAlign: 'center',
        color: theme.colors.error.main
      }}>
        ⚠️ {error}
        <div style={{ marginTop: theme.spacing[4] }}>
          <button
            onClick={() => {
              setRetryCount(0);
              setError(null);
              fetchStats();
            }}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              background: theme.colors.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer'
            }}
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
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

        <KPI
          label={t('dashboard.totalCustomers', 'Total Customers')}
          value={stats.totalCustomers.toString()}
          icon="🎯"
          variant="accent"
          size="lg"
          description={t('dashboard.allCustomersRegistered', 'All registered customers')}
        />

        <KPI
          label={t('dashboard.activeCustomers', 'Active Customers')}
          value={stats.activeCustomers.toString()}
          icon="🟢"
          variant="default"
          size="lg"
          description={t('dashboard.activeCustomersDesc', 'Currently active customers')}
          changeType="positive"
        />

        <KPI
          label={t('dashboard.inactiveCustomers', 'Inactive Customers')}
          value={stats.inactiveCustomers.toString()}
          icon="🔴"
          variant="minimal"
          size="lg"
          description={t('dashboard.inactiveCustomersDesc', 'Currently inactive customers')}
          changeType={stats.inactiveCustomers > 0 ? "negative" : "neutral"}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing[6], marginBottom: theme.spacing[6] }}>
        <ChartCard>
          <ChartTitle>🎯 {t('dashboard.customersByType', 'Customers by Type')}</ChartTitle>
          <MetricsList>
            {Object.entries(stats.customersByType).map(([type, count]) => (
              <MetricItem key={type}>
                <MetricName>{type.charAt(0).toUpperCase() + type.slice(1)}</MetricName>
                <MetricValue>{count} {t('customers.title', 'customers').toLowerCase()}</MetricValue>
              </MetricItem>
            ))}
            {Object.keys(stats.customersByType).length === 0 && (
              <MetricItem>
                <MetricName>{t('dashboard.noCustomerData', 'No customer data available')}</MetricName>
                <MetricValue>0</MetricValue>
              </MetricItem>
            )}
          </MetricsList>
        </ChartCard>
      </div>

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