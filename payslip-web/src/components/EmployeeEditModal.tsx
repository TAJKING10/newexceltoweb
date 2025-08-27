import React, { useState, useEffect } from 'react';
import { EmployeeProfile, EmployeeUpdateData } from '../types/EmployeeTypes';
import { employeeManager } from '../utils/employeeManager';

interface EmployeeEditModalProps {
  employee: EmployeeProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, updates: EmployeeUpdateData) => void;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<EmployeeUpdateData>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'compensation' | 'benefits' | 'documents'>('personal');
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string; type: string }>>([]);

  useEffect(() => {
    if (employee) {
      setFormData({
        personalInfo: { ...employee.personalInfo },
        employment: { ...employee.employment },
        compensation: { ...employee.compensation },
        benefits: { ...employee.benefits },
        documents: [...employee.documents]
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSave = () => {
    onSave(employee.id, formData);
    onClose();
  };

  const updatePersonalInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        address: { ...prev.personalInfo?.address, [field]: value }
      }
    }));
  };

  const updateEmergencyContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        emergencyContact: { ...prev.personalInfo?.emergencyContact, [field]: value }
      }
    }));
  };

  const updateEmployment = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      employment: { ...prev.employment, [field]: value }
    }));
  };

  const updateCompensation = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compensation: { ...prev.compensation, [field]: value }
    }));
  };

  const updateBankAccount = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      compensation: {
        ...prev.compensation,
        bankAccount: { ...prev.compensation?.bankAccount, [field]: value }
      }
    }));
  };

  const updateTaxInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compensation: {
        ...prev.compensation,
        taxInfo: { ...prev.compensation?.taxInfo, [field]: value }
      }
    }));
  };

  const updateBenefits = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      benefits: { ...prev.benefits, [field]: value }
    }));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '', type: 'text' }]);
  };

  const updateCustomField = (index: number, field: string, value: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const fieldStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#333',
    fontSize: '14px'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 20px',
    background: isActive ? '#1565c0' : '#f5f5f5',
    color: isActive ? 'white' : '#666',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginRight: '2px'
  });

  const sectionStyle = {
    marginBottom: '25px',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  };

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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #1565c0',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1565c0', fontSize: '24px' }}>
              ✏️ Edit Employee: {employee.personalInfo.fullName}
            </h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { key: 'personal', label: '👤 Personal Info' },
              { key: 'employment', label: '💼 Employment' },
              { key: 'compensation', label: '💰 Compensation' },
              { key: 'benefits', label: '🎁 Benefits' },
              { key: 'documents', label: '📄 Documents' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={tabStyle(activeTab === tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {activeTab === 'personal' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>👤 Personal Information</h3>
              
              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Basic Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.firstName || ''}
                      onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.lastName || ''}
                      onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={formData.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      type="tel"
                      value={formData.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => updatePersonalInfo('dateOfBirth', new Date(e.target.value))}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>National ID</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.nationalId || ''}
                      onChange={(e) => updatePersonalInfo('nationalId', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div>
                    <label style={labelStyle}>Street Address</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.address?.street || ''}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input
                        type="text"
                        value={formData.personalInfo?.address?.city || ''}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        style={fieldStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <input
                        type="text"
                        value={formData.personalInfo?.address?.state || ''}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        style={fieldStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Zip Code</label>
                      <input
                        type="text"
                        value={formData.personalInfo?.address?.zipCode || ''}
                        onChange={(e) => updateAddress('zipCode', e.target.value)}
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <select
                      value={formData.personalInfo?.address?.country || 'USA'}
                      onChange={(e) => updateAddress('country', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AUS">Australia</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Emergency Contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.emergencyContact?.name || ''}
                      onChange={(e) => updateEmergencyContact('name', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Relationship</label>
                    <input
                      type="text"
                      value={formData.personalInfo?.emergencyContact?.relationship || ''}
                      onChange={(e) => updateEmergencyContact('relationship', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      type="tel"
                      value={formData.personalInfo?.emergencyContact?.phone || ''}
                      onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>💼 Employment Information</h3>
              
              <div style={sectionStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Employee ID</label>
                    <input
                      type="text"
                      value={formData.employment?.employeeId || ''}
                      onChange={(e) => updateEmployment('employeeId', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <input
                      type="text"
                      value={formData.employment?.department || ''}
                      onChange={(e) => updateEmployment('department', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Position</label>
                    <input
                      type="text"
                      value={formData.employment?.position || ''}
                      onChange={(e) => updateEmployment('position', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Manager</label>
                    <input
                      type="text"
                      value={formData.employment?.manager || ''}
                      onChange={(e) => updateEmployment('manager', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Hire Date</label>
                    <input
                      type="date"
                      value={formData.employment?.hireDate ? new Date(formData.employment.hireDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateEmployment('hireDate', new Date(e.target.value))}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Employment Type</label>
                    <select
                      value={formData.employment?.employmentType || 'full-time'}
                      onChange={(e) => updateEmployment('employmentType', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contractor">Contractor</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={formData.employment?.status || 'active'}
                      onChange={(e) => updateEmployment('status', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Work Location</label>
                    <select
                      value={formData.employment?.workLocation || 'office'}
                      onChange={(e) => updateEmployment('workLocation', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="office">Office</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compensation' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>💰 Compensation & Benefits</h3>
              
              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Salary Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Base Salary</label>
                    <input
                      type="number"
                      value={formData.compensation?.baseSalary || 0}
                      onChange={(e) => updateCompensation('baseSalary', parseFloat(e.target.value) || 0)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select
                      value={formData.compensation?.currency || 'USD'}
                      onChange={(e) => updateCompensation('currency', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Pay Frequency</label>
                    <select
                      value={formData.compensation?.payFrequency || 'bi-weekly'}
                      onChange={(e) => updateCompensation('payFrequency', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Bank Account</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Account Number</label>
                    <input
                      type="text"
                      value={formData.compensation?.bankAccount?.accountNumber || ''}
                      onChange={(e) => updateBankAccount('accountNumber', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Routing Number</label>
                    <input
                      type="text"
                      value={formData.compensation?.bankAccount?.routingNumber || ''}
                      onChange={(e) => updateBankAccount('routingNumber', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Bank Name</label>
                    <input
                      type="text"
                      value={formData.compensation?.bankAccount?.bankName || ''}
                      onChange={(e) => updateBankAccount('bankName', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h4 style={{ color: '#333', marginBottom: '15px' }}>Tax Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Tax ID</label>
                    <input
                      type="text"
                      value={formData.compensation?.taxInfo?.taxId || ''}
                      onChange={(e) => updateTaxInfo('taxId', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Filing Status</label>
                    <select
                      value={formData.compensation?.taxInfo?.filingStatus || 'single'}
                      onChange={(e) => updateTaxInfo('filingStatus', e.target.value)}
                      style={fieldStyle}
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="head-of-household">Head of Household</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Allowances</label>
                    <input
                      type="number"
                      value={formData.compensation?.taxInfo?.allowances || 0}
                      onChange={(e) => updateTaxInfo('allowances', parseInt(e.target.value) || 0)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>🎁 Benefits</h3>
              
              <div style={sectionStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.benefits?.healthInsurance || false}
                        onChange={(e) => updateBenefits('healthInsurance', e.target.checked)}
                        style={{ marginRight: '10px' }}
                      />
                      Health Insurance
                    </label>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.benefits?.dentalInsurance || false}
                        onChange={(e) => updateBenefits('dentalInsurance', e.target.checked)}
                        style={{ marginRight: '10px' }}
                      />
                      Dental Insurance
                    </label>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.benefits?.visionInsurance || false}
                        onChange={(e) => updateBenefits('visionInsurance', e.target.checked)}
                        style={{ marginRight: '10px' }}
                      />
                      Vision Insurance
                    </label>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.benefits?.retirement401k || false}
                        onChange={(e) => updateBenefits('retirement401k', e.target.checked)}
                        style={{ marginRight: '10px' }}
                      />
                      401k Retirement
                    </label>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Paid Time Off (days per year)</label>
                    <input
                      type="number"
                      value={formData.benefits?.paidTimeOff || 15}
                      onChange={(e) => updateBenefits('paidTimeOff', parseInt(e.target.value) || 0)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>📄 Documents</h3>
              <div style={sectionStyle}>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Document management will be implemented in a future version. 
                  For now, you can track document information in the notes section.
                </p>
              </div>
            </div>
          )}

          {/* Custom Fields Section */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ color: '#333', margin: 0 }}>⚙️ Custom Fields</h4>
              <button
                onClick={addCustomField}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add Field
              </button>
            </div>
            
            {customFields.map((field, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Field Name"
                  value={field.key}
                  onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                  style={fieldStyle}
                />
                <input
                  type={field.type}
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  style={fieldStyle}
                />
                <select
                  value={field.type}
                  onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                  style={fieldStyle}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                </select>
                <button
                  onClick={() => removeCustomField(index)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1565c0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};