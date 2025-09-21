import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { customerManager, Customer } from '../../utils/customerManager';
import { theme } from '../../styles/theme';
import { PayslipTemplate, EmployeePayslip } from '../../types/PayslipTypes';
import CustomerEditModal from '../CustomerEditModal';
import { PayslipViewer } from './PayslipViewer';
import { PayslipEditor } from './PayslipEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  background: ${theme.colors.gradients.primary};
  color: white;
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.xl};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="800" r="200" fill="url(%23a)"/></svg>');
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing[2]} 0;
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.black};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  opacity: 0.9;
`;

const MainContent = styled.div`
  display: flex;
  gap: ${theme.spacing[6]};
  height: calc(100vh - 300px);

  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    height: auto;
  }
`;

const CustomerPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PayslipPanel = styled.div`
  flex: 2;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border.light};
  display: flex;
  justify-content: between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing[4]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[4]};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(91, 124, 255, 0.1);
  }
`;

const CustomerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const CustomerItem = styled.div<{ isSelected: boolean }>`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: 2px solid ${props => props.isSelected ? theme.colors.primary.main : 'transparent'};
  background: ${props => props.isSelected ? theme.colors.primary[50] : 'white'};

  &:hover {
    background: ${theme.colors.primary[50]};
    border-color: ${theme.colors.primary.light};
  }
`;

const CustomerName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const CustomerDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[3]};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};

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
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
    }
  }}
`;

const PayslipControls = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ isActive?: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 2px solid ${props => props.isActive ? theme.colors.primary.main : theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.isActive ? theme.colors.primary.main : 'white'};
  color: ${props => props.isActive ? 'white' : theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${props => props.isActive ? theme.colors.primary.dark : theme.colors.primary[50]};
  }
`;

const PayslipList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const PayslipItem = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  transition: all ${theme.animation.duration.normal};

  &:hover {
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary.light};
  }
`;

const PayslipHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
`;

const PayslipInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const PayslipTitle = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const PayslipMeta = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PayslipActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.text.tertiary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing[4]};
  opacity: 0.5;
`;

const CreateButton = styled.button`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.gradients.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  margin-bottom: ${theme.spacing[4]};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

type ViewMode = 'basic' | 'excel';

export const AdminCustomerPayslipManager: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [payslips, setPayslips] = useState<EmployeePayslip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('basic');
  const [loading, setLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showPayslipViewer, setShowPayslipViewer] = useState(false);
  const [showPayslipEditor, setShowPayslipEditor] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslip | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.person_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerPayslips(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerManager.getCustomers(true);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerPayslips = async (customerId: string) => {
    try {
      // Mock payslips data - replace with actual API call
      const mockPayslips: EmployeePayslip[] = [
        {
          id: `payslip-${customerId}-1`,
          templateId: 'default-template',
          employeeId: customerId,
          data: {},
          tableData: {},
          calculatedValues: {},
          generatedDate: new Date(),
          payPeriod: '2024-01'
        },
        {
          id: `payslip-${customerId}-2`,
          templateId: 'default-template',
          employeeId: customerId,
          data: {},
          tableData: {},
          calculatedValues: {},
          generatedDate: new Date(),
          payPeriod: '2024-02'
        }
      ];
      setPayslips(mockPayslips);
    } catch (error) {
      console.error('Error loading payslips:', error);
      setPayslips([]);
    }
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.full_name}?`)) {
      return;
    }

    try {
      await customerManager.deleteCustomer(customer.id);
      await loadCustomers();
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
        setPayslips([]);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleCustomerModalSave = async () => {
    await loadCustomers();
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  const handleViewPayslip = (payslip: EmployeePayslip, mode: ViewMode) => {
    setSelectedPayslip(payslip);
    setViewMode(mode);
    setShowPayslipViewer(true);
  };

  const handleEditPayslip = (payslip: EmployeePayslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipEditor(true);
  };

  const handlePayslipSave = (updatedPayslip: EmployeePayslip) => {
    // Update the payslip in the list
    setPayslips(prev => prev.map(p =>
      p.id === updatedPayslip.id ? updatedPayslip : p
    ));
    setShowPayslipEditor(false);
    setSelectedPayslip(null);
  };

  const handleDeletePayslip = async (payslip: EmployeePayslip) => {
    if (!window.confirm(`Are you sure you want to delete the payslip for ${payslip.payPeriod}?`)) {
      return;
    }

    try {
      // Mock delete - replace with actual API call
      setPayslips(prev => prev.filter(p => p.id !== payslip.id));
      setShowPayslipViewer(false);
      setSelectedPayslip(null);
    } catch (error) {
      console.error('Error deleting payslip:', error);
    }
  };

  const handleCreatePayslip = () => {
    if (!selectedCustomer) return;

    const newPayslip: EmployeePayslip = {
      id: `payslip-${selectedCustomer.id}-${Date.now()}`,
      templateId: 'default-template',
      employeeId: selectedCustomer.id,
      data: {},
      tableData: {},
      calculatedValues: {},
      generatedDate: new Date(),
      payPeriod: new Date().toISOString().slice(0, 7) // YYYY-MM format
    };

    setSelectedPayslip(newPayslip);
    setShowPayslipEditor(true);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>🔧 Super Admin - Customer & Payslip Management</Title>
          <Subtitle>
            Full access to manage customers, view and edit all payslips
          </Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <CustomerPanel>
          <PanelHeader>
            <PanelTitle>👥 Customers ({filteredCustomers.length})</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <CreateButton onClick={handleCreateCustomer}>
              ➕ Create New Customer
            </CreateButton>

            <SearchInput
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
              <EmptyState>
                <EmptyIcon>⏳</EmptyIcon>
                <div>Loading customers...</div>
              </EmptyState>
            ) : filteredCustomers.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👥</EmptyIcon>
                <div>No customers found</div>
              </EmptyState>
            ) : (
              <CustomerList>
                {filteredCustomers.map(customer => (
                  <CustomerItem
                    key={customer.id}
                    isSelected={selectedCustomer?.id === customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CustomerName>{customer.full_name}</CustomerName>
                    <CustomerDetails>
                      <div>📧 {customer.email}</div>
                      <div>🆔 {customer.person_id}</div>
                      {customer.department && <div>🏢 {customer.department}</div>}
                      {customer.position && <div>💼 {customer.position}</div>}
                    </CustomerDetails>
                    <ActionButtons>
                      <ActionButton
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustomer(customer);
                        }}
                      >
                        ✏️ Edit
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer);
                        }}
                      >
                        🗑️ Delete
                      </ActionButton>
                    </ActionButtons>
                  </CustomerItem>
                ))}
              </CustomerList>
            )}
          </PanelContent>
        </CustomerPanel>

        <PayslipPanel>
          <PanelHeader>
            <PanelTitle>
              📄 Payslips {selectedCustomer && `- ${selectedCustomer.full_name}`}
            </PanelTitle>
          </PanelHeader>
          <PanelContent>
            {!selectedCustomer ? (
              <EmptyState>
                <EmptyIcon>👈</EmptyIcon>
                <div>Select a customer to view their payslips</div>
              </EmptyState>
            ) : (
              <>
                <CreateButton onClick={handleCreatePayslip}>
                  ➕ Create New Payslip for {selectedCustomer.full_name}
                </CreateButton>

                <PayslipControls>
                  <ControlButton
                    isActive={viewMode === 'basic'}
                    onClick={() => setViewMode('basic')}
                  >
                    📝 Basic View
                  </ControlButton>
                  <ControlButton
                    isActive={viewMode === 'excel'}
                    onClick={() => setViewMode('excel')}
                  >
                    📊 Excel View
                  </ControlButton>
                </PayslipControls>

                {payslips.length === 0 ? (
                  <EmptyState>
                    <EmptyIcon>📄</EmptyIcon>
                    <div>No payslips found for this customer</div>
                  </EmptyState>
                ) : (
                  <PayslipList>
                    {payslips.map(payslip => (
                      <PayslipItem key={payslip.id}>
                        <PayslipHeader>
                          <PayslipInfo>
                            <PayslipTitle>
                              Payslip - {payslip.payPeriod}
                            </PayslipTitle>
                            <PayslipMeta>
                              Generated: {payslip.generatedDate.toLocaleDateString()}
                            </PayslipMeta>
                          </PayslipInfo>
                          <PayslipActions>
                            <ActionButton
                              variant="primary"
                              onClick={() => handleViewPayslip(payslip, 'basic')}
                            >
                              👀 View Basic
                            </ActionButton>
                            <ActionButton
                              variant="primary"
                              onClick={() => handleViewPayslip(payslip, 'excel')}
                            >
                              📊 View Excel
                            </ActionButton>
                            <ActionButton
                              variant="secondary"
                              onClick={() => handleEditPayslip(payslip)}
                            >
                              ✏️ Edit
                            </ActionButton>
                          </PayslipActions>
                        </PayslipHeader>
                      </PayslipItem>
                    ))}
                  </PayslipList>
                )}
              </>
            )}
          </PanelContent>
        </PayslipPanel>
      </MainContent>

      {showCustomerModal && (
        <CustomerEditModal
          customer={editingCustomer}
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleCustomerModalSave}
        />
      )}

      {showPayslipViewer && selectedPayslip && selectedCustomer && (
        <PayslipViewer
          payslip={selectedPayslip}
          customer={selectedCustomer}
          isOpen={showPayslipViewer}
          onClose={() => {
            setShowPayslipViewer(false);
            setSelectedPayslip(null);
          }}
          onEdit={() => {
            setShowPayslipViewer(false);
            setShowPayslipEditor(true);
          }}
          onDelete={() => handleDeletePayslip(selectedPayslip)}
        />
      )}

      {showPayslipEditor && selectedPayslip && selectedCustomer && (
        <PayslipEditor
          payslip={selectedPayslip}
          customer={selectedCustomer}
          isOpen={showPayslipEditor}
          onClose={() => {
            setShowPayslipEditor(false);
            setSelectedPayslip(null);
          }}
          onSave={handlePayslipSave}
        />
      )}
    </Container>
  );
};