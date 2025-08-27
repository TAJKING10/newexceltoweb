import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  EmployeeProfile,
  PayslipHistory,
  AuditLog,
  SearchFilters,
  EmployeeStats,
  EmployeeAlert
} from '../types/EmployeeTypes';
import { employeeManager } from '../utils/employeeManager';

const Container = styled.div`
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  color: #1565c0;
  margin: 0;
  flex: 1;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 15px 25px;
  border: none;
  background: ${props => props.active ? '#1565c0' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: ${props => props.active ? '#1565c0' : '#f5f5f5'};
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 600px;
`;

const SearchSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  margin-bottom: 25px;
  align-items: end;
`;

const SearchInput = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #1565c0;
    box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1565c0;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#1565c0';
      case 'success': return '#4caf50';
      case 'danger': return '#f44336';
      case 'warning': return '#ff9800';
      case 'secondary': 
      default: return '#6c757d';
    }
  }};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmployeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const EmployeeCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

const EmployeeName = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #666;
`;

const StatusBadge = styled.span<{ status: string }>`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'terminated': return '#f44336';
      case 'on-leave': return '#2196f3';
      default: return '#6c757d';
    }
  }};
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #333;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const AlertsContainer = styled.div`
  margin-bottom: 20px;
`;

const AlertItem = styled.div<{ priority: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#6c757d';
    }
  }};
  background: #f8f9fa;
  border-radius: 0 5px 5px 0;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#1565c0' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#1565c0' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
`;

interface Props {
  onEmployeeSelect?: (employee: EmployeeProfile) => void;
}

const EmployeeManagement: React.FC<Props> = ({ onEmployeeSelect }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'history' | 'analytics' | 'alerts' | 'audit'>('employees');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [payslipHistory, setPayslipHistory] = useState<PayslipHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [alerts, setAlerts] = useState<EmployeeAlert[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter employees based on search criteria
    const filtered = employeeManager.searchEmployees(searchFilters);
    setEmployees(filtered);
    setCurrentPage(1);
  }, [searchFilters]);

  const loadData = () => {
    setEmployees(employeeManager.getAllEmployees());
    setPayslipHistory(employeeManager.getAllPayslipHistory());
    setAuditLogs(employeeManager.getAuditLogs());
    setStats(employeeManager.getEmployeeStats());
    setAlerts(employeeManager.getAlerts());
  };

  const handleSearch = (field: keyof SearchFilters, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const clearFilters = () => {
    setSearchFilters({});
  };

  const handleEmployeeClick = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };

  const handleCreateEmployee = () => {
    // In a real app, this would open a form
    employeeManager.createEmployee({
      personalInfo: {
        firstName: 'New',
        lastName: 'Employee',
        email: `emp${Date.now()}@company.com`,
        phone: '555-0000'
      },
      employment: {
        department: 'General',
        position: 'Employee',
        manager: 'TBD'
      },
      compensation: {
        baseSalary: 50000
      }
    });
    
    loadData();
  };

  const acknowledgeAlert = (alertId: string) => {
    employeeManager.acknowledgeAlert(alertId);
    loadData();
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = employeeManager.exportEmployeeData(format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees_${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderEmployees = () => (
    <>
      <SearchSection>
        <SearchInput
          placeholder="Search by name, email, employee ID, department..."
          value={searchFilters.searchTerm || ''}
          onChange={(e) => handleSearch('searchTerm', e.target.value)}
        />
        <Select
          value={searchFilters.department || ''}
          onChange={(e) => handleSearch('department', e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </Select>
        <Select
          value={searchFilters.employmentStatus || ''}
          onChange={(e) => handleSearch('employmentStatus', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
          <option value="on-leave">On Leave</option>
        </Select>
        <Select
          value={searchFilters.employmentType || ''}
          onChange={(e) => handleSearch('employmentType', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contractor">Contractor</option>
          <option value="intern">Intern</option>
        </Select>
        <Button variant="secondary" onClick={clearFilters}>
          Clear
        </Button>
      </SearchSection>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <strong>{employees.length}</strong> employees found
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="success" onClick={handleCreateEmployee}>
            Add Employee
          </Button>
          <Button variant="secondary" onClick={() => exportData('csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => exportData('json')}>
            Export JSON
          </Button>
        </div>
      </div>

      <EmployeeGrid>
        {paginatedEmployees.map(employee => (
          <EmployeeCard
            key={employee.id}
            onClick={() => handleEmployeeClick(employee)}
          >
            <StatusBadge status={employee.employment.status}>
              {employee.employment.status.toUpperCase()}
            </StatusBadge>
            <EmployeeName>{employee.personalInfo.fullName}</EmployeeName>
            <EmployeeInfo>
              <div><strong>ID:</strong> {employee.employment.employeeId}</div>
              <div><strong>Department:</strong> {employee.employment.department}</div>
              <div><strong>Position:</strong> {employee.employment.position}</div>
              <div><strong>Email:</strong> {employee.personalInfo.email}</div>
              <div><strong>Salary:</strong> ${employee.compensation.baseSalary.toLocaleString()}</div>
              <div><strong>Hire Date:</strong> {new Date(employee.employment.hireDate).toLocaleDateString()}</div>
            </EmployeeInfo>
          </EmployeeCard>
        ))}
      </EmployeeGrid>

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PageButton>
          ))}
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      )}
    </>
  );

  const renderHistory = () => (
    <div>
      <h2>Payslip History</h2>
      <p>Total payslips processed: {payslipHistory.length}</p>
      <HistoryTable>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Pay Period</th>
            <th>Gross Pay</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th>Generated Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payslipHistory.slice(0, 50).map(history => {
            const employee = employeeManager.getEmployee(history.employeeId);
            return (
              <tr key={history.id}>
                <td>{employee?.personalInfo.fullName || 'Unknown'}</td>
                <td>{history.payPeriod}</td>
                <td>${history.grossPay.toFixed(2)}</td>
                <td>${history.netPay.toFixed(2)}</td>
                <td>{history.status}</td>
                <td>{new Date(history.generatedDate).toLocaleDateString()}</td>
                <td>
                  <Button variant="secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </HistoryTable>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2>Employee Analytics</h2>
      {stats && (
        <>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalEmployees}</StatValue>
              <StatLabel>Total Employees</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.activeEmployees}</StatValue>
              <StatLabel>Active Employees</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.newHiresThisMonth}</StatValue>
              <StatLabel>New Hires This Month</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>${stats.averageSalary.toFixed(0)}</StatValue>
              <StatLabel>Average Salary</StatLabel>
            </StatCard>
          </StatsGrid>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h3>Department Breakdown</h3>
              {stats.departmentBreakdown.map(dept => (
                <div key={dept.department} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{dept.department}</span>
                    <span>{dept.count} ({dept.percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${dept.percentage}%`,
                      height: '100%',
                      backgroundColor: '#1565c0'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3>Salary Ranges</h3>
              {stats.salaryRanges.map(range => (
                <div key={range.range} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{range.range}</span>
                    <span>{range.count} ({range.percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${range.percentage}%`,
                      height: '100%',
                      backgroundColor: '#4caf50'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div>
      <h2>Employee Alerts</h2>
      <AlertsContainer>
        {alerts.filter(alert => !alert.acknowledged).map(alert => (
          <AlertItem key={alert.id} priority={alert.priority}>
            <div>
              <strong>{alert.title}</strong>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                {alert.description}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Due: {new Date(alert.dueDate).toLocaleDateString()}
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => acknowledgeAlert(alert.id)}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Acknowledge
            </Button>
          </AlertItem>
        ))}
        {alerts.filter(alert => !alert.acknowledged).length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No pending alerts
          </div>
        )}
      </AlertsContainer>
    </div>
  );

  const renderAudit = () => (
    <div>
      <h2>Audit Trail</h2>
      <HistoryTable>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Details</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.slice(0, 100).map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.userEmail}</td>
              <td>{log.action.toUpperCase()}</td>
              <td>{log.entityType}</td>
              <td>{log.details}</td>
              <td>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: 
                    log.severity === 'high' ? '#f44336' :
                    log.severity === 'medium' ? '#ff9800' :
                    log.severity === 'low' ? '#4caf50' : '#6c757d'
                }}>
                  {log.severity.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </HistoryTable>
    </div>
  );

  return (
    <Container>
      <Header>
        <Title>👥 Employee Management Center</Title>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'employees'} onClick={() => setActiveTab('employees')}>
          👤 Employees ({employees.length})
        </Tab>
        <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
          📊 Payslip History ({payslipHistory.length})
        </Tab>
        <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
          📈 Analytics
        </Tab>
        <Tab active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>
          🔔 Alerts ({alerts.filter(a => !a.acknowledged).length})
        </Tab>
        <Tab active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
          🔍 Audit Trail
        </Tab>
      </TabContainer>

      <ContentArea>
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'audit' && renderAudit()}
      </ContentArea>

      <Modal isOpen={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          {selectedEmployee && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>{selectedEmployee.personalInfo.fullName}</h2>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h3>Personal Information</h3>
                  <div><strong>Email:</strong> {selectedEmployee.personalInfo.email}</div>
                  <div><strong>Phone:</strong> {selectedEmployee.personalInfo.phone}</div>
                  <div><strong>Date of Birth:</strong> {new Date(selectedEmployee.personalInfo.dateOfBirth).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <h3>Employment Details</h3>
                  <div><strong>Employee ID:</strong> {selectedEmployee.employment.employeeId}</div>
                  <div><strong>Department:</strong> {selectedEmployee.employment.department}</div>
                  <div><strong>Position:</strong> {selectedEmployee.employment.position}</div>
                  <div><strong>Manager:</strong> {selectedEmployee.employment.manager}</div>
                  <div><strong>Status:</strong> {selectedEmployee.employment.status}</div>
                  <div><strong>Hire Date:</strong> {new Date(selectedEmployee.employment.hireDate).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <h3>Compensation</h3>
                  <div><strong>Base Salary:</strong> ${selectedEmployee.compensation.baseSalary.toLocaleString()}</div>
                  <div><strong>Pay Frequency:</strong> {selectedEmployee.compensation.payFrequency}</div>
                  <div><strong>Currency:</strong> {selectedEmployee.compensation.currency}</div>
                </div>
                
                <div>
                  <h3>Recent Payslips</h3>
                  {employeeManager.getEmployeePayslipHistory(selectedEmployee.id).slice(0, 5).map(history => (
                    <div key={history.id} style={{ fontSize: '14px', marginBottom: '5px' }}>
                      {history.payPeriod}: ${history.netPay.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EmployeeManagement;