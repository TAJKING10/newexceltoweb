import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';
import { Profile } from '../../contexts/AuthContext';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  department?: string;
  position?: string;
  hire_date?: string;
  salary?: number;
  currency: string;
  phone?: string;
  status: string;
  profile: Profile;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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

const Actions = styled.div`
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

const SearchInput = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const EmployeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing[4]};
`;

const EmployeeCard = styled.div`
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

const EmployeeHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: start;
  margin-bottom: ${theme.spacing[4]};
`;

const EmployeeInfo = styled.div`
  flex: 1;
`;

const EmployeeName = styled.h3`
  margin: 0 0 ${theme.spacing[1]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const EmployeeRole = styled.p`
  margin: 0 0 ${theme.spacing[1]} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const EmployeeId = styled.p`
  margin: 0;
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono};
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
      case 'pending':
        return `background: ${theme.colors.warning.light}20; color: ${theme.colors.warning.dark};`;
      case 'inactive':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.dark};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const EmployeeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[4]} 0;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const DetailLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EmployeeActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.border.light};
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  flex: 1;
  
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
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.background.tertiary}; }
        `;
    }
  }}
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing[4]};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[8]};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
  color: ${theme.colors.text.tertiary};
  padding: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form state for creating/editing employees
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    employee_id: '',
    department: '',
    position: '',
    hire_date: '',
    salary: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profile:profiles!employees_user_id_fkey (
            id, email, full_name, role, status, created_at, updated_at, last_login
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEmployees = data?.map(emp => ({
        ...emp,
        profile: emp.profile
      })) || [];

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          role: 'employee'
        }
      });

      if (authError) throw authError;

      // Create employee record
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: authData.user.id,
          employee_id: formData.employee_id,
          department: formData.department || null,
          position: formData.position || null,
          hire_date: formData.hire_date || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          phone: formData.phone || null,
          owner_id: authData.user.id
        });

      if (employeeError) throw employeeError;

      // Update profile status to active
      await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', authData.user.id);

      await fetchEmployees();
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      alert(`Error creating employee: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (employee: Employee, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', employee.user_id);

      if (error) throw error;

      await fetchEmployees();
    } catch (error: any) {
      console.error('Error updating employee status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleResetPassword = async (employee: Employee) => {
    if (!window.confirm(`Reset password for ${employee.profile.email}?`)) return;

    try {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { error } = await supabase.auth.admin.updateUserById(employee.user_id, {
        password: tempPassword
      });

      if (error) throw error;

      alert(`Password reset successfully. New password: ${tempPassword}\nPlease share this with the employee securely.`);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(`Error resetting password: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      employee_id: '',
      department: '',
      position: '',
      hire_date: '',
      salary: '',
      phone: '',
      password: ''
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner>Loading employees...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>Employee Management</Title>
        <Actions>
          <SearchInput
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            ➕ Add Employee
          </Button>
        </Actions>
      </Header>

      <EmployeeGrid>
        {filteredEmployees.map(employee => (
          <EmployeeCard key={employee.id}>
            <EmployeeHeader>
              <EmployeeInfo>
                <EmployeeName>
                  {employee.profile.full_name || 'Unnamed Employee'}
                </EmployeeName>
                <EmployeeRole>
                  {employee.position || 'No Position'} 
                  {employee.department && ` • ${employee.department}`}
                </EmployeeRole>
                <EmployeeId>ID: {employee.employee_id}</EmployeeId>
              </EmployeeInfo>
              <StatusBadge status={employee.profile.status}>
                {employee.profile.status}
              </StatusBadge>
            </EmployeeHeader>

            <EmployeeDetails>
              <DetailItem>
                <DetailLabel>Email</DetailLabel>
                <DetailValue>{employee.profile.email}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Phone</DetailLabel>
                <DetailValue>{employee.phone || 'Not provided'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Hire Date</DetailLabel>
                <DetailValue>
                  {employee.hire_date 
                    ? new Date(employee.hire_date).toLocaleDateString()
                    : 'Not set'
                  }
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Salary</DetailLabel>
                <DetailValue>
                  {employee.salary 
                    ? `€${employee.salary.toLocaleString()}`
                    : 'Not set'
                  }
                </DetailValue>
              </DetailItem>
            </EmployeeDetails>

            <EmployeeActions>
              {employee.profile.status === 'active' ? (
                <SmallButton 
                  variant="secondary"
                  onClick={() => handleStatusChange(employee, 'inactive')}
                >
                  Deactivate
                </SmallButton>
              ) : (
                <SmallButton 
                  variant="primary"
                  onClick={() => handleStatusChange(employee, 'active')}
                >
                  Activate
                </SmallButton>
              )}
              <SmallButton 
                variant="secondary"
                onClick={() => handleResetPassword(employee)}
              >
                Reset Password
              </SmallButton>
            </EmployeeActions>
          </EmployeeCard>
        ))}
      </EmployeeGrid>

      <Modal isOpen={showCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Employee</ModalTitle>
            <CloseButton onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}>
              ×
            </CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleCreateEmployee}>
            <FormGroup>
              <Label>Email Address*</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="employee@company.com"
              />
            </FormGroup>

            <FormGroup>
              <Label>Full Name*</Label>
              <Input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Doe"
              />
            </FormGroup>

            <FormGroup>
              <Label>Employee ID*</Label>
              <Input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                placeholder="EMP001"
              />
            </FormGroup>

            <FormGroup>
              <Label>Temporary Password*</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Temporary password"
              />
            </FormGroup>

            <FormGroup>
              <Label>Department</Label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="Engineering"
              />
            </FormGroup>

            <FormGroup>
              <Label>Position</Label>
              <Input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Software Engineer"
              />
            </FormGroup>

            <FormGroup>
              <Label>Hire Date</Label>
              <Input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <Label>Annual Salary (EUR)</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder="50000"
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+352 123 456 789"
              />
            </FormGroup>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={formLoading}
            >
              {formLoading ? 'Creating...' : 'Create Employee'}
            </Button>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};