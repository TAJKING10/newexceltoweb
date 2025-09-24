import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { customerManager, Customer, CustomerFilters } from '../utils/customerManager';
import CustomerEditModal from './CustomerEditModal';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  padding: 0;
  font-family: ${theme.typography.fontFamily.primary};
  background-color: transparent;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing[8]};
  background: ${theme.colors.gradients.primary};
  color: white;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
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

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[6]} ${theme.spacing[4]};
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing[4]} 0;
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.black};
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  color: white;
  opacity: 0.95;
  font-weight: ${theme.typography.fontWeight.medium};
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[3]};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.animation.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.md}, 0 0 0 3px rgba(91, 124, 255, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
`;

const FilterSelect = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  box-shadow: ${theme.shadows.sm};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.md}, 0 0 0 3px rgba(91, 124, 255, 0.1);
  }
`;

const AddButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  background: ${theme.colors.gradients.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  box-shadow: ${theme.shadows.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`;

const CustomerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[4]};
  }
`;

const CustomerCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  transition: all ${theme.animation.duration.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.colors.gradients.primary};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary.light};
  }
`;

const CustomerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[4]};
`;

const CustomerName = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const CustomerType = styled.span<{ type: string }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.type) {
      case 'customer': return theme.colors.primary[100];
      case 'vendor': return theme.colors.warning[100];
      case 'contractor': return theme.colors.primary[100];
      case 'freelancer': return theme.colors.success[100];
      default: return theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'customer': return theme.colors.primary.dark;
      case 'vendor': return theme.colors.warning.dark;
      case 'contractor': return theme.colors.primary.dark;
      case 'freelancer': return theme.colors.success.dark;
      default: return theme.colors.gray[700];
    }
  }};
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const CustomerActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.border.light};
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  flex: 1;
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[1]};

  ${props => props.variant === 'edit' && `
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary.main};
    border: 1px solid ${theme.colors.primary.light};

    &:hover {
      background: ${theme.colors.primary[100]};
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'delete' && `
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error.main};
    border: 1px solid ${theme.colors.error.light};

    &:hover {
      background: ${theme.colors.error[100]};
      transform: translateY(-1px);
    }
  `}
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const StatCard = styled.div`
  background: white;
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.light};
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.black};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing[2]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]} ${theme.spacing[6]};
  color: ${theme.colors.text.tertiary};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing[4]};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${theme.spacing[3]} 0;
  color: ${theme.colors.text.secondary};
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
`;

interface CustomerManagementProps {}

const CustomerManagement: React.FC<CustomerManagementProps> = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState<CustomerFilters>({
    searchTerm: '',
    person_type: 'all',
    status: 'all',
    department: 'all'
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersData, statsData] = await Promise.all([
        customerManager.getCustomers(true),
        customerManager.getCustomerStats()
      ]);

      setCustomers(customersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(t('errors.loadFailed', 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.full_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.person_id.toLowerCase().includes(searchLower) ||
        customer.department?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.person_type && filters.person_type !== 'all') {
      filtered = filtered.filter(customer => customer.person_type === filters.person_type);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Department filter
    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(customer => customer.department === filters.department);
    }

    setFilteredCustomers(filtered);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowEditModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(t('customers.confirmDelete', 'Are you sure you want to delete this customer?'))) {
      return;
    }

    try {
      await customerManager.deleteCustomer(customer.id);
      await loadCustomers(); // Reload data
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(t('errors.deleteFailed', 'Failed to delete customer'));
    }
  };

  const handleModalSave = async () => {
    await loadCustomers(); // Reload data after save
    setShowEditModal(false);
    setEditingCustomer(null);
  };

  const uniqueDepartments = Array.from(new Set(customers.map(c => c.department).filter(Boolean)));

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div>{t('common.loading', 'Loading')}...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>👥 {t('customers.title', 'Customer Management')}</Title>
          <Subtitle>
            {t('customers.subtitle', 'Manage your customers and their information')}
          </Subtitle>
        </HeaderContent>
      </Header>

      {error && (
        <div style={{
          background: theme.colors.error.light + '20',
          border: `1px solid ${theme.colors.error.light}`,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[6],
          color: theme.colors.error.dark
        }}>
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <StatsContainer>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>{t('customers.stats.total', 'Total Customers')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.active}</StatNumber>
            <StatLabel>{t('customers.stats.active', 'Active')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.inactive}</StatNumber>
            <StatLabel>{t('customers.stats.inactive', 'Inactive')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.byType.customer || 0}</StatNumber>
            <StatLabel>{t('customers.stats.customers', 'Customers')}</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      <Controls>
        <SearchInput
          type="text"
          placeholder={t('customers.search.placeholder', 'Search customers...')}
          value={filters.searchTerm || ''}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />

        <FilterSelect
          value={filters.person_type || 'all'}
          onChange={(e) => setFilters({ ...filters, person_type: e.target.value })}
        >
          <option value="all">{t('customers.filters.allTypes', 'All Types')}</option>
          <option value="customer">{t('customers.types.customer', 'Customer')}</option>
          <option value="vendor">{t('customers.types.vendor', 'Vendor')}</option>
          <option value="contractor">{t('customers.types.contractor', 'Contractor')}</option>
          <option value="freelancer">{t('customers.types.freelancer', 'Freelancer')}</option>
          <option value="consultant">{t('customers.types.consultant', 'Consultant')}</option>
        </FilterSelect>

        <FilterSelect
          value={filters.status || 'all'}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">{t('customers.filters.allStatuses', 'All Statuses')}</option>
          <option value="active">{t('customers.statuses.active', 'Active')}</option>
          <option value="inactive">{t('customers.statuses.inactive', 'Inactive')}</option>
          <option value="suspended">{t('customers.statuses.suspended', 'Suspended')}</option>
        </FilterSelect>

        <AddButton onClick={handleAddCustomer}>
          <span>➕</span>
          {t('customers.actions.add', 'Add Customer')}
        </AddButton>
      </Controls>

      {filteredCustomers.length === 0 ? (
        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyTitle>
            {customers.length === 0
              ? t('customers.empty.noCustomers', 'No customers yet')
              : t('customers.empty.noResults', 'No customers match your search')
            }
          </EmptyTitle>
          <EmptyDescription>
            {customers.length === 0
              ? t('customers.empty.getStarted', 'Add your first customer to get started')
              : t('customers.empty.tryDifferent', 'Try adjusting your search or filters')
            }
          </EmptyDescription>
        </EmptyState>
      ) : (
        <CustomerGrid>
          {filteredCustomers.map(customer => (
            <CustomerCard key={customer.id}>
              <CustomerHeader>
                <div>
                  <CustomerName>{customer.full_name}</CustomerName>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.tertiary, marginTop: theme.spacing[1] }}>
                    ID: {customer.person_id}
                  </div>
                </div>
                <CustomerType type={customer.person_type}>
                  {customer.person_type}
                </CustomerType>
              </CustomerHeader>

              <CustomerInfo>
                <InfoRow>
                  <span>📧</span>
                  <span>{customer.email}</span>
                </InfoRow>
                {customer.phone && (
                  <InfoRow>
                    <span>📞</span>
                    <span>{customer.phone}</span>
                  </InfoRow>
                )}
                {customer.department && (
                  <InfoRow>
                    <span>🏢</span>
                    <span>{customer.department}</span>
                  </InfoRow>
                )}
                {customer.position && (
                  <InfoRow>
                    <span>💼</span>
                    <span>{customer.position}</span>
                  </InfoRow>
                )}
                <InfoRow>
                  <span>📅</span>
                  <span>{t('customers.created', 'Created')}: {new Date(customer.created_at).toLocaleDateString()}</span>
                </InfoRow>
              </CustomerInfo>

              <CustomerActions>
                <ActionButton variant="edit" onClick={() => handleEditCustomer(customer)}>
                  <span>✏️</span>
                  {t('customers.actions.edit', 'Edit')}
                </ActionButton>
                {isAdmin && (
                  <ActionButton variant="delete" onClick={() => handleDeleteCustomer(customer)}>
                    <span>🗑️</span>
                    {t('customers.actions.delete', 'Delete')}
                  </ActionButton>
                )}
              </CustomerActions>
            </CustomerCard>
          ))}
        </CustomerGrid>
      )}

      {showEditModal && (
        <CustomerEditModal
          customer={editingCustomer}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleModalSave}
        />
      )}
    </Container>
  );
};

export default CustomerManagement;