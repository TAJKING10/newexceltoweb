import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

interface ReportData {
  payslipTrends: PayslipTrend[];
  departmentAnalysis: DepartmentAnalysis[];
  salaryDistribution: SalaryDistribution[];
  userActivity: UserActivity[];
  systemHealth: SystemHealth;
  exportData: ExportData;
}

interface PayslipTrend {
  period: string;
  count: number;
  growth: number;
  totalSalary: number;
}

interface DepartmentAnalysis {
  department: string;
  employeeCount: number;
  avgSalary: number;
  totalPayroll: number;
  payslipCount: number;
  growthRate: number;
}

interface SalaryDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface UserActivity {
  userId: string;
  userName: string;
  lastLogin: string;
  payslipsGenerated: number;
  templatesCreated: number;
  status: string;
}

interface SystemHealth {
  totalUsers: number;
  activeUsers: number;
  storageUsed: string;
  averageResponseTime: string;
  uptime: string;
  errorRate: number;
}

interface ExportData {
  totalExports: number;
  popularFormats: { format: string; count: number }[];
  exportTrends: { date: string; count: number }[];
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

const FilterControls = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;


const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
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
      default:
        return `
          background: white;
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border.light};
          &:hover { background: ${theme.colors.background.secondary}; }
        `;
    }
  }}
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const ReportTitle = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: ${theme.spacing[4]} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  margin-bottom: ${theme.spacing[4]};
`;

const ChartBar = styled.div<{ height: number; color?: string }>`
  width: 40px;
  background: ${props => props.color || theme.colors.gradients.primary};
  border-radius: ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0;
  height: ${props => props.height}%;
  transition: all ${theme.animation.duration.normal};
  position: relative;
  
  &:hover {
    opacity: 0.8;
    transform: scaleX(1.1);
  }
`;

const ChartLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  white-space: nowrap;
`;

const ChartValue = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  white-space: nowrap;
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

const MetricLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const MetricValue = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const MetricChange = styled.span<{ positive?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.positive ? theme.colors.success.main : theme.colors.error.main};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-left: ${theme.spacing[2]};
`;

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: ${theme.spacing[4]};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSize.sm};
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-bottom: 1px solid ${theme.colors.border.light};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:hover {
    background: ${theme.colors.background.secondary};
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  color: ${theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `background: ${theme.colors.success.light}20; color: ${theme.colors.success.dark};`;
      case 'inactive':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.dark};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[600]};`;
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

export const ReportsAnalytics: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [department, setDepartment] = useState('all');

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, department]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      // Fetch payslip trends
      const payslipTrends = await fetchPayslipTrends(startDate, endDate);
      
      // Fetch department analysis
      const departmentAnalysis = await fetchDepartmentAnalysis();
      
      // Fetch salary distribution
      const salaryDistribution = await fetchSalaryDistribution();
      
      // Fetch user activity
      const userActivity = await fetchUserActivity();
      
      // Fetch system health metrics
      const systemHealth = await fetchSystemHealth();
      
      // Fetch export data
      const exportData = await fetchExportData();

      setReportData({
        payslipTrends,
        departmentAnalysis,
        salaryDistribution,
        userActivity,
        systemHealth,
        exportData
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslipTrends = async (startDate: Date, endDate: Date): Promise<PayslipTrend[]> => {
    const trends: PayslipTrend[] = [];
    const periods = Math.min(6, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    
    for (let i = periods - 1; i >= 0; i--) {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() - (i * 7));
      const periodStart = new Date(periodEnd);
      periodStart.setDate(periodStart.getDate() - 7);
      
      const { count } = await supabase
        .from('payslips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', periodStart.toISOString())
        .lt('created_at', periodEnd.toISOString());

      trends.push({
        period: periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: count || 0,
        growth: i === periods - 1 ? 0 : Math.round(Math.random() * 20 - 10), // Mock growth calculation
        totalSalary: (count || 0) * 3500 // Mock average salary
      });
    }
    
    return trends;
  };

  const fetchDepartmentAnalysis = async (): Promise<DepartmentAnalysis[]> => {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('department, salary');

    if (error) throw error;

    const departmentMap = new Map<string, { count: number; totalSalary: number }>();
    
    employees?.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      const current = departmentMap.get(dept) || { count: 0, totalSalary: 0 };
      departmentMap.set(dept, {
        count: current.count + 1,
        totalSalary: current.totalSalary + (emp.salary || 0)
      });
    });

    return Array.from(departmentMap.entries()).map(([dept, stats]) => ({
      department: dept,
      employeeCount: stats.count,
      avgSalary: stats.count > 0 ? stats.totalSalary / stats.count : 0,
      totalPayroll: stats.totalSalary,
      payslipCount: Math.round(stats.count * 12), // Mock monthly payslips
      growthRate: Math.round(Math.random() * 20 - 10) // Mock growth rate
    }));
  };

  const fetchSalaryDistribution = async (): Promise<SalaryDistribution[]> => {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('salary')
      .not('salary', 'is', null);

    if (error) throw error;

    const ranges = [
      { label: '0-30K', min: 0, max: 30000 },
      { label: '30-50K', min: 30000, max: 50000 },
      { label: '50-70K', min: 50000, max: 70000 },
      { label: '70-100K', min: 70000, max: 100000 },
      { label: '100K+', min: 100000, max: Infinity }
    ];

    const total = employees?.length || 0;
    
    return ranges.map(range => {
      const count = employees?.filter(emp => 
        emp.salary >= range.min && emp.salary < range.max
      ).length || 0;
      
      return {
        range: range.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  };

  const fetchUserActivity = async (): Promise<UserActivity[]> => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, last_login, status')
      .limit(10)
      .order('last_login', { ascending: false });

    if (error) throw error;

    return (profiles || []).map(profile => ({
      userId: profile.id,
      userName: profile.full_name || profile.email,
      lastLogin: profile.last_login || 'Never',
      payslipsGenerated: Math.floor(Math.random() * 50), // Mock data
      templatesCreated: Math.floor(Math.random() * 5), // Mock data
      status: profile.status
    }));
  };

  const fetchSystemHealth = async (): Promise<SystemHealth> => {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      storageUsed: '2.4 GB', // Mock data
      averageResponseTime: '120ms', // Mock data
      uptime: '99.9%', // Mock data
      errorRate: 0.1 // Mock data
    };
  };

  const fetchExportData = async (): Promise<ExportData> => {
    // Mock export data - in real implementation, this would come from audit logs
    return {
      totalExports: 1250,
      popularFormats: [
        { format: 'PDF', count: 750 },
        { format: 'Excel', count: 350 },
        { format: 'JSON', count: 150 }
      ],
      exportTrends: [
        { date: '2024-01', count: 45 },
        { date: '2024-02', count: 52 },
        { date: '2024-03', count: 38 },
        { date: '2024-04', count: 63 },
        { date: '2024-05', count: 71 },
        { date: '2024-06', count: 58 }
      ]
    };
  };

  const generateReport = async () => {
    if (!reportData) return;
    
    const reportContent = {
      generatedAt: new Date().toISOString(),
      period: `Last ${dateRange} days`,
      department: department === 'all' ? 'All Departments' : department,
      summary: {
        totalPayslips: reportData.payslipTrends.reduce((sum, trend) => sum + trend.count, 0),
        totalEmployees: reportData.systemHealth.totalUsers,
        totalDepartments: reportData.departmentAnalysis.length,
        avgSalary: reportData.departmentAnalysis.reduce((sum, dept) => sum + dept.avgSalary, 0) / reportData.departmentAnalysis.length
      },
      data: reportData
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner>Loading reports and analytics...</LoadingSpinner>;
  }

  if (!reportData) {
    return <div>Error loading report data.</div>;
  }

  const maxPayslipCount = Math.max(...reportData.payslipTrends.map(t => t.count));

  return (
    <Container>
      <Header>
        <Title>📊 Reports & Analytics</Title>
        <FilterControls>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
          
          <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {reportData.departmentAnalysis.map(dept => (
              <option key={dept.department} value={dept.department}>
                {dept.department}
              </option>
            ))}
          </Select>
          
          <Button variant="secondary" onClick={fetchReportData}>
            🔄 Refresh
          </Button>
          
          <Button variant="primary" onClick={generateReport}>
            📥 Export Report
          </Button>
        </FilterControls>
      </Header>

      <ReportsGrid>
        <ReportCard>
          <ReportTitle>📈 Payslip Generation Trends</ReportTitle>
          <ChartContainer>
            {reportData.payslipTrends.map((trend, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ChartBar height={(trend.count / maxPayslipCount) * 100}>
                  <ChartValue>{trend.count}</ChartValue>
                  <ChartLabel>{trend.period}</ChartLabel>
                </ChartBar>
              </div>
            ))}
          </ChartContainer>
          <MetricsList>
            <MetricItem>
              <MetricLabel>Total Payslips</MetricLabel>
              <MetricValue>
                {reportData.payslipTrends.reduce((sum, trend) => sum + trend.count, 0)}
                <MetricChange positive={true}>+12%</MetricChange>
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Average per Period</MetricLabel>
              <MetricValue>
                {Math.round(reportData.payslipTrends.reduce((sum, trend) => sum + trend.count, 0) / reportData.payslipTrends.length)}
              </MetricValue>
            </MetricItem>
          </MetricsList>
        </ReportCard>

        <ReportCard>
          <ReportTitle>💰 Salary Distribution</ReportTitle>
          <MetricsList>
            {reportData.salaryDistribution.map((dist, index) => (
              <MetricItem key={index}>
                <MetricLabel>{dist.range}</MetricLabel>
                <MetricValue>
                  {dist.count} ({dist.percentage}%)
                </MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ReportCard>

        <ReportCard>
          <ReportTitle>🏢 Department Analysis</ReportTitle>
          <MetricsList>
            {reportData.departmentAnalysis.slice(0, 5).map((dept, index) => (
              <MetricItem key={index}>
                <div>
                  <MetricLabel>{dept.department}</MetricLabel>
                  <div style={{fontSize: '12px', color: theme.colors.text.tertiary}}>
                    {dept.employeeCount} employees • €{Math.round(dept.avgSalary).toLocaleString()} avg
                  </div>
                </div>
                <MetricValue>
                  €{Math.round(dept.totalPayroll / 1000)}K
                  <MetricChange positive={dept.growthRate > 0}>
                    {dept.growthRate > 0 ? '+' : ''}{dept.growthRate}%
                  </MetricChange>
                </MetricValue>
              </MetricItem>
            ))}
          </MetricsList>
        </ReportCard>

        <ReportCard>
          <ReportTitle>🖥️ System Health</ReportTitle>
          <MetricsList>
            <MetricItem>
              <MetricLabel>Total Users</MetricLabel>
              <MetricValue>{reportData.systemHealth.totalUsers}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Active Users</MetricLabel>
              <MetricValue>
                {reportData.systemHealth.activeUsers}
                <MetricChange positive={true}>
                  {Math.round((reportData.systemHealth.activeUsers / reportData.systemHealth.totalUsers) * 100)}%
                </MetricChange>
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Storage Used</MetricLabel>
              <MetricValue>{reportData.systemHealth.storageUsed}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Avg Response Time</MetricLabel>
              <MetricValue>{reportData.systemHealth.averageResponseTime}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Uptime</MetricLabel>
              <MetricValue>{reportData.systemHealth.uptime}</MetricValue>
            </MetricItem>
          </MetricsList>
        </ReportCard>
      </ReportsGrid>

      <FullWidthCard>
        <ReportTitle>👥 User Activity Overview</ReportTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>User</TableHeader>
                <TableHeader>Last Login</TableHeader>
                <TableHeader>Payslips Generated</TableHeader>
                <TableHeader>Templates Created</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody>
              {reportData.userActivity.map(user => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>
                    {user.lastLogin === 'Never' ? 'Never' : 
                     new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{user.payslipsGenerated}</TableCell>
                  <TableCell>{user.templatesCreated}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status}>{user.status}</StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </FullWidthCard>
    </Container>
  );
};