import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { customerManager, Customer } from '../../utils/customerManager';
import { theme } from '../../styles/theme';
import { PayslipTemplate, EmployeePayslip } from '../../types/PayslipTypes';
import CustomerEditModal from '../CustomerEditModal';
import { PayslipViewer } from './PayslipViewer';
import { PayslipEditor } from './PayslipEditor';
import { supabasePayslipService, SavedPayslipView } from '../../utils/supabasePayslipService';

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
  height: calc(100vh - 280px);
  min-height: 600px;

  @media (max-width: ${theme.breakpoints.xl}) {
    height: calc(100vh - 320px);
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    height: auto;
    min-height: auto;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[4]};
  }
`;

const CustomerPanel = styled.div`
  flex: 1;
  min-width: 350px;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: ${theme.breakpoints.lg}) {
    min-width: auto;
    max-height: 400px;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    max-height: 300px;
  }
`;

const PayslipPanel = styled.div`
  flex: 2;
  min-width: 400px;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: ${theme.breakpoints.lg}) {
    min-width: auto;
  }
`;

const PanelHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border.light};
  display: flex;
  justify-content: space-between;
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
  justify-content: space-between;
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
  const [payslips, setPayslips] = useState<SavedPayslipView[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<SavedPayslipView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('basic');
  const [payslipFilter, setPayslipFilter] = useState<'all' | 'basic' | 'annual'>('all');
  const [loading, setLoading] = useState(false);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showPayslipViewer, setShowPayslipViewer] = useState(false);
  const [showPayslipEditor, setShowPayslipEditor] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<SavedPayslipView | null>(null);

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
      loadCustomerPayslips(selectedCustomer);
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

  const loadCustomerPayslips = async (customer: Customer) => {
    try {
      setPayslipsLoading(true);

      // Admin: Load ALL payslips from ALL users, then filter by selected customer
      const [basicResult, annualResult] = await Promise.all([
        supabasePayslipService.getAllBasicPayslipViewsForAdmin(),
        supabasePayslipService.getAllAnnualPayslipViewsForAdmin()
      ]);

      let allPayslips: SavedPayslipView[] = [];

      if (basicResult.success && basicResult.data) {
        console.log(`📝 Admin found ${basicResult.data.length} basic payslips from all users`);
        allPayslips = allPayslips.concat(
          basicResult.data.filter(p => p.person_id === customer.id || p.person_name === customer.full_name)
        );
      }

      if (annualResult.success && annualResult.data) {
        console.log(`📊 Admin found ${annualResult.data.length} annual payslips from all users`);
        allPayslips = allPayslips.concat(
          annualResult.data.filter(p => p.person_id === customer.id || p.person_name === customer.full_name)
        );
      }

      // Sort by date, most recent first
      allPayslips.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || '');
        const dateB = new Date(b.updated_at || b.created_at || '');
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`🔧 Admin found ${allPayslips.length} payslips for customer: ${customer.full_name}`);
      setPayslips(allPayslips);
      setFilteredPayslips(allPayslips);
    } catch (error) {
      console.error('Error loading payslips:', error);
      setPayslips([]);
    } finally {
      setPayslipsLoading(false);
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
        setFilteredPayslips([]);
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

  const handleViewPayslip = (payslip: SavedPayslipView, mode: ViewMode) => {
    setSelectedPayslip(payslip);
    setViewMode(mode);
    setShowPayslipViewer(true);
  };

  const handleEditPayslip = (payslip: SavedPayslipView) => {
    setSelectedPayslip(payslip);
    setShowPayslipEditor(true);
  };

  const handlePayslipSave = async (updatedData: any) => {
    if (!selectedCustomer || !selectedPayslip) return;

    try {
      // Save the updated payslip to Supabase
      if (selectedPayslip.view_type === 'basic') {
        await supabasePayslipService.saveBasicPayslipView(
          updatedData,
          selectedCustomer,
          { id: selectedPayslip.template_id, name: selectedPayslip.template_name },
          selectedPayslip.payslip_year,
          (selectedPayslip.payslip_month || 1) - 1, // Convert to 0-based
          updatedData.calculatedValues || {}
        );
      } else {
        await supabasePayslipService.saveAnnualPayslipView(
          updatedData,
          selectedCustomer,
          { id: selectedPayslip.template_id, name: selectedPayslip.template_name }
        );
      }

      // Reload payslips for the customer
      if (selectedCustomer) {
        await loadCustomerPayslips(selectedCustomer);
      }
      setShowPayslipEditor(false);
      setSelectedPayslip(null);
    } catch (error) {
      console.error('Error saving payslip:', error);
    }
  };

  const handleDeletePayslip = async (payslip: SavedPayslipView) => {
    if (!window.confirm(`Are you sure you want to delete the payslip "${payslip.view_name}"?`)) {
      return;
    }

    try {
      if (payslip.view_type === 'basic') {
        await supabasePayslipService.deleteBasicPayslipView(payslip.id!);
      } else {
        await supabasePayslipService.deleteAnnualPayslipView(payslip.id!);
      }

      // Reload payslips for the current customer
      if (selectedCustomer) {
        await loadCustomerPayslips(selectedCustomer);
      }
      setShowPayslipViewer(false);
      setSelectedPayslip(null);
    } catch (error) {
      console.error('Error deleting payslip:', error);
    }
  };

  const handleCreatePayslip = () => {
    if (!selectedCustomer) return;

    const currentDate = new Date();
    const newPayslip: SavedPayslipView = {
      id: undefined, // Will be generated by Supabase
      view_name: `${selectedCustomer.full_name} - ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      view_type: 'basic',
      person_id: selectedCustomer.id,
      person_name: selectedCustomer.full_name,
      person_email: selectedCustomer.email,
      person_type: selectedCustomer.person_type || 'customer',
      department: selectedCustomer.department,
      position: selectedCustomer.position,
      template_id: 'default-template',
      template_name: 'Default Template',
      payslip_year: currentDate.getFullYear(),
      payslip_month: currentDate.getMonth() + 1,
      generation_date: currentDate.toISOString().split('T')[0],
      payslip_data: {
        earnings: [],
        deductions: [],
        employeeInfo: {}
      },
      status: 'draft'
    };

    setSelectedPayslip(newPayslip);
    setShowPayslipEditor(true);
  };

  const handleFilterPayslips = (filter: 'all' | 'basic' | 'annual') => {
    setPayslipFilter(filter);
    if (filter === 'all') {
      setFilteredPayslips(payslips);
    } else {
      setFilteredPayslips(payslips.filter(p => p.view_type === filter));
    }
  };

  // Update filtered payslips when payslips change
  useEffect(() => {
    handleFilterPayslips(payslipFilter);
  }, [payslips, payslipFilter]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>🔧 Super Admin - Customer & Payslip Management</Title>
          <Subtitle>
            Full access to manage customers, view and edit all payslips
          </Subtitle>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '24px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '0'
          }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: viewMode === 'basic' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: viewMode === 'basic' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onClick={() => setViewMode('basic')}
              title="Basic payslip view like user panel"
            >
              <span style={{ fontSize: '18px' }}>📝</span>
              <span>Basic View</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: viewMode === 'excel' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: viewMode === 'excel' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onClick={() => setViewMode('excel')}
              title="Excel-style payslip view like user panel"
            >
              <span style={{ fontSize: '18px' }}>📊</span>
              <span>Excel View</span>
            </button>
          </div>
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
                    isActive={payslipFilter === 'all'}
                    onClick={() => handleFilterPayslips('all')}
                  >
                    📋 All Payslips ({payslips.length})
                  </ControlButton>
                  <ControlButton
                    isActive={payslipFilter === 'basic'}
                    onClick={() => handleFilterPayslips('basic')}
                  >
                    📝 Basic ({payslips.filter(p => p.view_type === 'basic').length})
                  </ControlButton>
                  <ControlButton
                    isActive={payslipFilter === 'annual'}
                    onClick={() => handleFilterPayslips('annual')}
                  >
                    📊 Annual ({payslips.filter(p => p.view_type === 'annual').length})
                  </ControlButton>
                </PayslipControls>

                {payslipsLoading ? (
                  <EmptyState>
                    <EmptyIcon>⏳</EmptyIcon>
                    <div>Loading payslips...</div>
                  </EmptyState>
                ) : filteredPayslips.length === 0 ? (
                  <EmptyState>
                    <EmptyIcon>📄</EmptyIcon>
                    <div>No {payslipFilter === 'all' ? '' : payslipFilter + ' '}payslips found for this customer</div>
                  </EmptyState>
                ) : (
                  <PayslipList>
                    {filteredPayslips.map(payslip => (
                      <PayslipItem key={payslip.id}>
                        <PayslipHeader>
                          <PayslipInfo>
                            <PayslipTitle>
                              {payslip.view_name}
                            </PayslipTitle>
                            <PayslipMeta>
                              <span style={{ background: payslip.view_type === 'basic' ? '#e3f2fd' : '#fff3e0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginRight: '8px' }}>
                                {payslip.view_type?.toUpperCase()}
                              </span>
                              Year: {payslip.payslip_year}
                              {payslip.payslip_month && ` | Month: ${new Date(payslip.payslip_year, (payslip.payslip_month || 1) - 1).toLocaleDateString('en-US', { month: 'long' })}`}
                            </PayslipMeta>
                            <PayslipMeta>
                              Generated: {new Date(payslip.generation_date || payslip.created_at || '').toLocaleDateString()}
                              {payslip.status && ` | Status: ${payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}`}
                              {payslip.gross_salary && ` | Gross: $${payslip.gross_salary.toLocaleString()}`}
                              {payslip.net_salary && ` | Net: $${payslip.net_salary.toLocaleString()}`}
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
          payslip={{
            id: selectedPayslip.id || '',
            templateId: selectedPayslip.template_id || '',
            employeeId: selectedCustomer.id,
            data: selectedPayslip.payslip_data || {},
            tableData: {},
            calculatedValues: selectedPayslip.calculated_values || {},
            generatedDate: new Date(selectedPayslip.generation_date || selectedPayslip.created_at || ''),
            payPeriod: selectedPayslip.payslip_month
              ? `${selectedPayslip.payslip_year}-${String(selectedPayslip.payslip_month).padStart(2, '0')}`
              : String(selectedPayslip.payslip_year)
          }}
          customer={selectedCustomer}
          isOpen={showPayslipViewer}
          initialViewMode={viewMode}
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
          payslip={{
            id: selectedPayslip.id || '',
            templateId: selectedPayslip.template_id || '',
            employeeId: selectedCustomer.id,
            data: selectedPayslip.payslip_data || {},
            tableData: {},
            calculatedValues: selectedPayslip.calculated_values || {},
            generatedDate: new Date(selectedPayslip.generation_date || selectedPayslip.created_at || ''),
            payPeriod: selectedPayslip.payslip_month
              ? `${selectedPayslip.payslip_year}-${String(selectedPayslip.payslip_month).padStart(2, '0')}`
              : String(selectedPayslip.payslip_year)
          }}
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