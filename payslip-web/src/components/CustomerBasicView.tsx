import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { customerManager } from '../utils/customerManager';
import { customerExcelService } from '../utils/customerExcelService';
import { supabasePayslipService } from '../utils/supabasePayslipService';
import { personSync } from '../utils/personSyncService';
import { PayslipTemplate } from '../types/PayslipTypes';
import { Customer } from '../utils/customerManager';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 20px;
  font-family: 'Calibri', Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
`;

const Title = styled.h2`
  text-align: center;
  color: #1565c0;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
`;

const ControlPanel = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  &:hover {
    background-color: #1565c0;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PayslipSheet = styled.div`
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const FieldGroup = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
`;

const FieldLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 3px rgba(25, 118, 210, 0.3);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const SaveButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #2196f3;
  
  &:hover {
    background-color: #1976d2;
  }
`;

const RefreshButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 140px;
  background-color: #4caf50;
  
  &:hover {
    background-color: #45a049;
  }
`;

interface CustomerBasicViewProps {
  analysisData?: any;
}

interface BasicPayslipData {
  [key: string]: any;
  personName: string;
  personId: string;
  department: string;
  position: string;
  year: number;
  basicSalary: number;
  allowances: number;
  overtime: number;
  bonus: number;
  commission: number;
  grossSalary: number;
  incomeTax: number;
  socialSecurity: number;
  totalDeductions: number;
  netSalary: number;
  taxClass: number;
  hasChildren: boolean;
}

const CustomerBasicView: React.FC<CustomerBasicViewProps> = ({ analysisData }) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [payslipData, setPayslipData] = useState<BasicPayslipData>({
    personName: '',
    personId: '',
    department: '',
    position: '',
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    overtime: 0,
    bonus: 0,
    commission: 0,
    grossSalary: 0,
    incomeTax: 0,
    socialSecurity: 0,
    totalDeductions: 0,
    netSalary: 0,
    taxClass: 1,
    hasChildren: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load customers on component mount and setup personSync subscription
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customerList = await customerManager.getCustomers();
        setCustomers(customerList);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };

    loadCustomers();

    // Subscribe to personSync changes from Excel view
    const unsubscribePersonSync = personSync.onPersonChange((person) => {
      if (person && (!selectedCustomer || selectedCustomer.id !== person.id)) {
        console.log('👤 Basic View: Received PersonSync person selection:', person.full_name);
        // Find customer in current list and update selection
        const customer = customers.find(c => c.id === person.id);
        if (customer) {
          setSelectedCustomer(customer);
          // Load customer data
          loadCustomerData(customer);
        }
      } else if (!person && selectedCustomer) {
        console.log('👤 Basic View: Received PersonSync person clear');
        setSelectedCustomer(null);
        // Reset to default payslip data
        setPayslipData(prev => ({
          ...prev,
          personName: '',
          personId: '',
          department: '',
          position: '',
          basicSalary: 0,
          allowances: 0,
          overtime: 0,
          bonus: 0,
          commission: 0,
          grossSalary: 0,
          incomeTax: 0,
          socialSecurity: 0,
          totalDeductions: 0,
          netSalary: 0
        }));
      }
    });

    return () => {
      unsubscribePersonSync();
    };
  }, [customers, selectedCustomer]);

  // Load customer data helper function
  const loadCustomerData = useCallback(async (customer: Customer) => {
    setIsLoading(true);
    try {
      console.log('👤 Basic View: Loading customer data for:', customer.full_name);

      // Try to load existing basic payslip data from Supabase
      const loadResult = await supabasePayslipService.loadBasicPayslipViewByName(
        customer.full_name,
        payslipData.year,
        0 // Use month 0 (January) as default for basic view
      );

      if (loadResult.success && loadResult.data) {
        console.log('✅ Basic View: Found existing data for customer');
        const existingData = loadResult.data.payslipData || {};
        const calculatedValues = loadResult.data.calculatedValues || {};

        setPayslipData(prev => ({
          ...prev,
          ...existingData,
          personName: customer.full_name,
          personId: customer.id,
          department: customer.department || existingData.department || '',
          position: customer.position || existingData.position || '',
          // Merge calculated values
          grossSalary: calculatedValues.grossSalary || existingData.grossSalary || 0,
          netSalary: calculatedValues.netSalary || existingData.netSalary || 0,
          incomeTax: calculatedValues.incomeTax || existingData.incomeTax || 0,
          socialSecurity: calculatedValues.socialSecurity || existingData.socialSecurity || 0,
          totalDeductions: calculatedValues.totalDeductions || existingData.totalDeductions || 0
        }));
      } else {
        console.log('ℹ️ Basic View: No existing data found, initializing with customer info');
        // Initialize with customer data
        setPayslipData(prev => ({
          ...prev,
          personName: customer.full_name,
          personId: customer.id,
          department: customer.department || '',
          position: customer.position || '',
          basicSalary: 0,
          allowances: 0,
          overtime: 0,
          bonus: 0,
          commission: 0,
          grossSalary: 0,
          incomeTax: 0,
          socialSecurity: 0,
          totalDeductions: 0,
          netSalary: 0
        }));
      }
    } catch (error) {
      console.error('❌ Basic View: Error loading customer data:', error);
      // Initialize with basic customer data
      setPayslipData(prev => ({
        ...prev,
        personName: customer.full_name,
        personId: customer.id,
        department: customer.department || '',
        position: customer.position || '',
        basicSalary: 0,
        allowances: 0,
        overtime: 0,
        bonus: 0,
        commission: 0,
        grossSalary: 0,
        incomeTax: 0,
        socialSecurity: 0,
        totalDeductions: 0,
        netSalary: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, [payslipData.year]);

  // Calculate Luxembourg taxes
  const calculateTaxes = useCallback(async () => {
    const grossSalary = payslipData.basicSalary + payslipData.allowances + 
                      payslipData.overtime + payslipData.bonus + payslipData.commission;

    if (grossSalary > 0) {
      try {
        const { LuxembourgTaxCalculator } = await import('../utils/luxembourgTaxCalculator');
        const taxResult = LuxembourgTaxCalculator.calculate({
          monthlyGrossSalary: grossSalary,
          taxClass: payslipData.taxClass as 1 | 2,
          hasChildren: payslipData.hasChildren,
          isOver65: false
        });

        const totalDeductions = taxResult.incomeTax + taxResult.socialSecurity.total;
        const netSalary = grossSalary - totalDeductions;

        setPayslipData(prev => ({
          ...prev,
          grossSalary: Math.round(grossSalary * 100) / 100,
          incomeTax: Math.round(taxResult.incomeTax * 100) / 100,
          socialSecurity: Math.round(taxResult.socialSecurity.total * 100) / 100,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          netSalary: Math.round(netSalary * 100) / 100
        }));
      } catch (error) {
        console.error('Error calculating taxes:', error);
      }
    } else {
      setPayslipData(prev => ({
        ...prev,
        grossSalary: 0,
        incomeTax: 0,
        socialSecurity: 0,
        totalDeductions: 0,
        netSalary: 0
      }));
    }
  }, [payslipData.basicSalary, payslipData.allowances, payslipData.overtime, 
      payslipData.bonus, payslipData.commission, payslipData.taxClass, payslipData.hasChildren]);

  // Recalculate taxes when salary components change
  useEffect(() => {
    calculateTaxes();
  }, [calculateTaxes]);

  // Handle customer selection
  const handleCustomerChange = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      console.log(`👤 Basic View: Customer selected - ${customer.full_name}`);

      // Update personSync to notify Excel view
      personSync.setSelectedPerson(customer, 'Basic View');

      setSelectedCustomer(customer);
      await loadCustomerData(customer);
    }
  };

  // Handle field changes
  const handleFieldChange = (field: string, value: any) => {
    setPayslipData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save data
  const handleSave = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer first!');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Basic View: Saving data for customer:', selectedCustomer.full_name);

      // Prepare calculated values for saving
      const calculatedValues = {
        grossSalary: payslipData.grossSalary,
        netSalary: payslipData.netSalary,
        incomeTax: payslipData.incomeTax,
        socialSecurity: payslipData.socialSecurity,
        totalDeductions: payslipData.totalDeductions
      };

      // Save to Supabase using basic payslip view service
      const saveResult = await supabasePayslipService.saveBasicPayslipView(
        payslipData,
        {
          id: selectedCustomer.id,
          full_name: selectedCustomer.full_name,
          name: selectedCustomer.full_name,
          email: selectedCustomer.email,
          person_type: 'customer',
          department: selectedCustomer.department,
          position: selectedCustomer.position
        },
        null, // No template for basic view
        payslipData.year,
        0, // Use month 0 (January) as default for basic view
        calculatedValues
      );

      if (saveResult.success) {
        console.log('✅ Basic View: Data saved successfully to Supabase');
        alert('✅ Data saved successfully!');
      } else {
        console.error('❌ Basic View: Save failed:', saveResult.error);
        alert(`❌ Save failed: ${saveResult.error}`);
      }
    } catch (error) {
      console.error('❌ Basic View: Save error:', error);
      alert('❌ Error saving data');
    } finally {
      setIsSaving(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (selectedCustomer) {
      await handleCustomerChange(selectedCustomer.id);
    }
  };

  return (
    <Container>
      <Title>👤 Customer Basic View</Title>
      
      <ControlPanel>
        <FormRow>
          <InputGroup>
            <Label>Select Customer</Label>
            <Select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customerId = e.target.value;
                if (customerId) {
                  handleCustomerChange(customerId);
                } else {
                  // Clear selection
                  personSync.clearSelectedPerson('Basic View');
                  setSelectedCustomer(null);
                  console.log('👤 Basic View: Customer selection cleared');
                }
              }}
              disabled={isLoading}
            >
              <option value="">Choose a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {customer.email}
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>Year</Label>
            <Input
              type="number"
              value={payslipData.year}
              onChange={(e) => handleFieldChange('year', parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </InputGroup>

          <InputGroup>
            <Label>Tax Class</Label>
            <Select
              value={payslipData.taxClass}
              onChange={(e) => handleFieldChange('taxClass', parseInt(e.target.value))}
            >
              <option value={1}>Class 1 - Single</option>
              <option value={2}>Class 2 - Married/Civil Partner</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>Has Children</Label>
            <Select
              value={payslipData.hasChildren ? 'yes' : 'no'}
              onChange={(e) => handleFieldChange('hasChildren', e.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes (Tax Credits Apply)</option>
            </Select>
          </InputGroup>
        </FormRow>
      </ControlPanel>

      {selectedCustomer && (
        <PayslipSheet>
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : '💾 Save'}
          </SaveButton>
          <RefreshButton onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </RefreshButton>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '32px' }}>
              CUSTOMER PAYSLIP
            </h1>
            <h2 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '18px' }}>
              Basic View - {payslipData.year}
            </h2>
          </div>

          {/* Employee Information */}
          <FieldGrid>
            <FieldGroup>
              <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Employee Information</h3>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Full Name</FieldLabel>
                <FieldInput
                  type="text"
                  value={payslipData.personName}
                  onChange={(e) => handleFieldChange('personName', e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Department</FieldLabel>
                <FieldInput
                  type="text"
                  value={payslipData.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Position</FieldLabel>
                <FieldInput
                  type="text"
                  value={payslipData.position}
                  onChange={(e) => handleFieldChange('position', e.target.value)}
                />
              </div>
            </FieldGroup>

            <FieldGroup>
              <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Salary Components</h3>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Basic Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.basicSalary}
                  onChange={(e) => handleFieldChange('basicSalary', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Allowances (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.allowances}
                  onChange={(e) => handleFieldChange('allowances', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Overtime (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.overtime}
                  onChange={(e) => handleFieldChange('overtime', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Bonus (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.bonus}
                  onChange={(e) => handleFieldChange('bonus', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <FieldLabel>Commission (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.commission}
                  onChange={(e) => handleFieldChange('commission', parseFloat(e.target.value) || 0)}
                />
              </div>
            </FieldGroup>

            <FieldGroup>
              <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Calculated Values</h3>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Gross Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.grossSalary}
                  disabled
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Income Tax (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.incomeTax}
                  disabled
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Social Security (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.socialSecurity}
                  disabled
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <FieldLabel>Total Deductions (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.totalDeductions}
                  disabled
                />
              </div>
              <div>
                <FieldLabel>Net Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.netSalary}
                  disabled
                  style={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}
                />
              </div>
            </FieldGroup>
          </FieldGrid>

          <div style={{ marginTop: '30px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            <p>This payslip is computer generated and does not require signature.</p>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Customer: {selectedCustomer.full_name} | Year: {payslipData.year}</p>
          </div>
        </PayslipSheet>
      )}

      {!selectedCustomer && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>👤 Select a Customer</h3>
          <p style={{ color: '#999' }}>Choose a customer from the dropdown above to view and edit their payslip data.</p>
        </div>
      )}
    </Container>
  );
};

export default CustomerBasicView;