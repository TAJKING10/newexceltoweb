import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customerManager, Customer, CreateCustomerData, UpdateCustomerData } from '../utils/customerManager';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

interface CustomerEditModalProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCustomerData>({
    person_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    person_type: 'customer',
    work_type: 'customer',
    department: '',
    position: '',
    base_salary: undefined,
    hourly_rate: undefined,
    currency: 'EUR',
    payment_method: '',
    notes: '',
    custom_fields: {}
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        person_id: customer.person_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        person_type: customer.person_type,
        work_type: customer.work_type || 'customer',
        department: customer.department || '',
        position: customer.position || '',
        base_salary: customer.base_salary,
        hourly_rate: customer.hourly_rate,
        currency: customer.currency || 'EUR',
        payment_method: customer.payment_method || '',
        notes: customer.notes || '',
        custom_fields: customer.custom_fields || {}
      });
    } else {
      // Reset form for new customer
      setFormData({
        person_id: customerManager.generatePersonId('CUST'),
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        person_type: 'customer',
        work_type: 'customer',
        department: '',
        position: '',
        base_salary: undefined,
        hourly_rate: undefined,
        currency: 'EUR',
        payment_method: '',
        notes: '',
        custom_fields: {}
      });
    }
    setActiveTab('basic');
    setError(null);
  }, [customer, isOpen]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = customerManager.validateCustomerData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (customer) {
        // Update existing customer
        await customerManager.updateCustomer(customer.id, formData);
      } else {
        // Create new customer
        await customerManager.createCustomer(formData);
      }

      onSave();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(t('errors.saveFailed', 'Failed to save customer'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  const fieldStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2d3748',
    fontSize: '14px'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    background: isActive ? '#1565c0' : '#f7fafc',
    color: isActive ? 'white' : '#4a5568',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '4px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: theme.zIndex.modal
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #1565c0',
          backgroundColor: '#f8fafc',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1565c0', fontSize: '24px', fontWeight: '700' }}>
              {customer ? `✏️ ${t('customers.edit.title', 'Edit Customer')}` : `➕ ${t('customers.add.title', 'Add New Customer')}`}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#718096',
                padding: '4px'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 24px', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'basic', label: `👤 ${t('customers.tabs.basic', 'Basic Info')}` },
              { key: 'work', label: `💼 ${t('customers.tabs.work', 'Work Details')}` },
              { key: 'compensation', label: `💰 ${t('customers.tabs.compensation', 'Compensation')}` },
              { key: 'notes', label: `📝 ${t('customers.tabs.notes', 'Notes')}` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={tabStyle(activeTab === tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              background: '#fed7d7',
              border: '1px solid #fc8181',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: '#c53030'
            }}>
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'basic' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '24px', fontSize: '18px' }}>
                {t('customers.sections.basicInfo', 'Basic Information')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.personId', 'Customer ID')} *</label>
                  <input
                    type="text"
                    value={formData.person_id}
                    onChange={(e) => updateFormData('person_id', e.target.value)}
                    style={fieldStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.personType', 'Customer Type')}</label>
                  <select
                    value={formData.person_type}
                    onChange={(e) => updateFormData('person_type', e.target.value)}
                    style={fieldStyle}
                  >
                    <option value="customer">{t('customers.types.customer', 'Customer')}</option>
                    <option value="vendor">{t('customers.types.vendor', 'Vendor')}</option>
                    <option value="contractor">{t('customers.types.contractor', 'Contractor')}</option>
                    <option value="freelancer">{t('customers.types.freelancer', 'Freelancer')}</option>
                    <option value="consultant">{t('customers.types.consultant', 'Consultant')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.firstName', 'First Name')} *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => updateFormData('first_name', e.target.value)}
                    style={fieldStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.lastName', 'Last Name')} *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => updateFormData('last_name', e.target.value)}
                    style={fieldStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.email', 'Email')} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    style={fieldStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              </div>

              {/* Address Section */}
              <h4 style={{ color: '#2d3748', marginBottom: '16px', marginTop: '32px' }}>
                {t('customers.sections.address', 'Address')}
              </h4>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{t('customers.fields.street', 'Street Address')}</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  style={fieldStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.city', 'City')}</label>
                  <input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.state', 'State')}</label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.zipCode', 'ZIP Code')}</label>
                  <input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => updateAddress('zipCode', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('customers.fields.country', 'Country')}</label>
                <select
                  value={formData.address?.country || 'USA'}
                  onChange={(e) => updateAddress('country', e.target.value)}
                  style={fieldStyle}
                >
                  <option value="USA">{t('customers.countries.usa', 'United States')}</option>
                  <option value="CAN">{t('customers.countries.canada', 'Canada')}</option>
                  <option value="UK">{t('customers.countries.uk', 'United Kingdom')}</option>
                  <option value="AUS">{t('customers.countries.australia', 'Australia')}</option>
                  <option value="OTHER">{t('customers.countries.other', 'Other')}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'work' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '24px' }}>
                {t('customers.sections.workDetails', 'Work Details')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.department', 'Department')}</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateFormData('department', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.position', 'Position/Title')}</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateFormData('position', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('customers.fields.workType', 'Work Type')}</label>
                <select
                  value={formData.work_type}
                  onChange={(e) => updateFormData('work_type', e.target.value)}
                  style={fieldStyle}
                >
                  <option value="customer">{t('customers.workTypes.customer', 'Customer')}</option>
                  <option value="full-time">{t('customers.workTypes.fullTime', 'Full-time')}</option>
                  <option value="part-time">{t('customers.workTypes.partTime', 'Part-time')}</option>
                  <option value="contractor">{t('customers.workTypes.contractor', 'Contractor')}</option>
                  <option value="freelance">{t('customers.workTypes.freelance', 'Freelance')}</option>
                  <option value="consultant">{t('customers.workTypes.consultant', 'Consultant')}</option>
                  <option value="vendor">{t('customers.workTypes.vendor', 'Vendor')}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'compensation' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '24px' }}>
                {t('customers.sections.compensation', 'Compensation')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>{t('customers.fields.baseSalary', 'Base Salary')}</label>
                  <input
                    type="number"
                    value={formData.base_salary || ''}
                    onChange={(e) => updateFormData('base_salary', e.target.value ? parseFloat(e.target.value) : undefined)}
                    style={fieldStyle}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.hourlyRate', 'Hourly Rate')}</label>
                  <input
                    type="number"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => updateFormData('hourly_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
                    style={fieldStyle}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('customers.fields.currency', 'Currency')}</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateFormData('currency', e.target.value)}
                    style={fieldStyle}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('customers.fields.paymentMethod', 'Payment Method')}</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => updateFormData('payment_method', e.target.value)}
                  style={fieldStyle}
                >
                  <option value="">{t('customers.paymentMethods.select', 'Select payment method')}</option>
                  <option value="direct-deposit">{t('customers.paymentMethods.directDeposit', 'Direct Deposit')}</option>
                  <option value="check">{t('customers.paymentMethods.check', 'Check')}</option>
                  <option value="paypal">{t('customers.paymentMethods.paypal', 'PayPal')}</option>
                  <option value="wire-transfer">{t('customers.paymentMethods.wireTransfer', 'Wire Transfer')}</option>
                  <option value="cash">{t('customers.paymentMethods.cash', 'Cash')}</option>
                  <option value="crypto">{t('customers.paymentMethods.crypto', 'Cryptocurrency')}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '24px' }}>
                {t('customers.sections.notes', 'Additional Notes')}
              </h3>

              <div>
                <label style={labelStyle}>{t('customers.fields.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  style={{
                    ...fieldStyle,
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  placeholder={t('customers.placeholders.notes', 'Add any additional notes about this customer...')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#718096',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
            disabled={loading}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#a0aec0' : '#1565c0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? '⏳' : (customer ? '💾' : '➕')}
            {loading
              ? t('common.saving', 'Saving...')
              : customer
                ? t('customers.actions.update', 'Update Customer')
                : t('customers.actions.create', 'Create Customer')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerEditModal;