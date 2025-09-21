import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { customerManager } from '../utils/customerManager';
import { customerExcelService } from '../utils/customerExcelService';
import { supabasePayslipService } from '../utils/supabasePayslipService';
import { personSync } from '../utils/personSyncService';
import { PayslipTemplate } from '../types/PayslipTypes';
import { Customer } from '../utils/customerManager';
import { theme } from '../styles/theme';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: ${theme.spacing[8]};
  font-family: ${theme.typography.fontFamily.primary};
  max-width: ${theme.container['3xl']};
  margin: 0 auto;
  background: ${theme.colors.background.secondary};
  min-height: 100vh;
`;

const Title = styled.h2`
  text-align: center;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.extrabold};
  font-family: ${theme.typography.fontFamily.primary};
  letter-spacing: ${theme.typography.letterSpacing.tight};
`;

const ControlPanel = styled(Card)`
  padding: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[6]};
  align-items: start;

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[1]};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  width: 100%;
  background: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:hover {
    border-color: ${theme.colors.primary.light};
  }
`;

const StyledInput = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  width: 100%;
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:hover {
    border-color: ${theme.colors.primary.light};
  }
`;


const PayslipSheet = styled(Card)`
  padding: ${theme.spacing[10]};
  margin: ${theme.spacing[6]} 0;
  position: relative;
  border: 1px solid ${theme.colors.border.light};

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
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius['2xl']};
  z-index: ${theme.zIndex.modal};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.main};
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${theme.spacing[6]};
  margin: ${theme.spacing[6]} 0;
`;

const FieldGroup = styled(Card)`
  padding: ${theme.spacing[6]};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
`;

const FieldLabel = styled.label`
  display: block;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[2]};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const FieldInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.spring};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.tertiary};
    border-color: ${theme.colors.border.light};
  }
`;

const SaveButton = styled(Button)`
  position: absolute;
  top: ${theme.spacing[6]};
  right: ${theme.spacing[6]};
`;

const RefreshButton = styled(Button)`
  position: absolute;
  top: ${theme.spacing[6]};
  right: 140px;
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

  // Load customers on component mount and force fresh start
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        // FORCE CLEAR: Ensure no person is selected
        console.log('📋 Basic View: FORCING CLEAR STATE - No auto-selection allowed');
        setSelectedCustomer(null);
        personSync.clearSelectedPerson('Basic View - Force Clear');

        const customerList = await customerManager.getCustomers();
        setCustomers(customerList);
        console.log('📋 Basic View: Loaded customers list, no auto-selection');

        // Double-check: Clear again after loading
        setSelectedCustomer(null);
        console.log('📋 Basic View: Double-checked - selectedCustomer is null');
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };

    loadCustomers();

    // NO AUTO-SELECTION ON PAGE LOAD - user must manually select
    // DISABLED: Cross-view sync to prevent automatic selection
    // Users must manually select a person in Basic view

    return () => {
      // No cleanup needed since we're not subscribing to cross-view changes
    };
  }, []); // Remove dependencies to prevent re-running

  // Load customer data helper function - matches Excel view logic exactly
  const loadCustomerData = useCallback(async (customer: Customer) => {
    setIsLoading(true);
    try {
      console.log(`🔄 BASIC VIEW CUSTOMER CHANGE: Switching to ${customer.full_name} (ID: ${customer.id})`);

      // STEP 1: Clear existing data first to prevent contamination
      console.log(`🧹 Basic View: Clearing any existing cached data for ${customer.full_name}`);
      const emptyData = {
        personName: customer.full_name,
        personId: customer.id,
        department: customer.department || '',
        position: customer.position || '',
        year: payslipData.year,
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
      };

      console.log(`🆕 Basic View: Clearing all data and resetting to empty template for ${customer.full_name}`);
      setPayslipData(emptyData);

      // STEP 2: Try to load existing data specifically for this person from database
      console.log(`🔍 Basic View: Looking for saved data for ${customer.full_name} in database...`);
      const loadResult = await supabasePayslipService.loadBasicPayslipView(
        customer.id, // Use person ID for proper isolation
        payslipData.year,
        0 // Use month 0 (January) as default for basic view
      );

      // STEP 3: Handle the result - load data if found, otherwise keep empty template
      if (loadResult.success && loadResult.data) {
        console.log('✅ Basic View: Successfully loaded personalized data from database');
        const existingData = loadResult.data.payslipData || {};
        const calculatedValues = loadResult.data.calculatedValues || {};

        setPayslipData({
          ...emptyData,
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
        });
        console.log(`✅ Basic View: Successfully loaded saved data for ${customer.full_name}`);
      } else {
        console.log(`ℹ️ Basic View: No saved data found for ${customer.full_name} - keeping empty template with all zeros`);
        // Keep the empty template already set in STEP 1
      }
    } catch (error) {
      console.error(`❌ Basic View: Error during customer change to ${customer.full_name}:`, error);
      // Keep the empty template already set in STEP 1
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

  // Handle customer selection - matches Excel view exactly
  const handleCustomerChange = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      console.log(`🔄 BASIC VIEW CUSTOMER CHANGE: Switching to ${customer.full_name} (ID: ${customerId})`);

      // STEP 1: Update personSync to notify Excel view immediately
      personSync.setSelectedPerson(customer, 'Basic View');
      setSelectedCustomer(customer);

      // STEP 2: Load customer data with proper isolation
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

  // Save data - matches Excel view exactly
  const handleSave = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer first!');
      return;
    }

    setIsSaving(true);
    try {
      console.log(`💾 BASIC VIEW SAVE: Saving data for ${selectedCustomer.full_name} (ID: ${selectedCustomer.id})`);

      // Prepare calculated values for saving - exactly like Excel view
      const calculatedValues = {
        grossSalary: payslipData.grossSalary,
        netSalary: payslipData.netSalary,
        incomeTax: payslipData.incomeTax,
        socialSecurity: payslipData.socialSecurity,
        totalDeductions: payslipData.totalDeductions
      };

      // Save to Supabase using basic payslip view service with proper person data
      const saveResult = await supabasePayslipService.saveBasicPayslipView(
        payslipData,
        {
          id: selectedCustomer.id,
          full_name: selectedCustomer.full_name,
          name: selectedCustomer.full_name,
          email: selectedCustomer.email,
          person_type: 'customer',
          department: selectedCustomer.department || payslipData.department,
          position: selectedCustomer.position || payslipData.position
        },
        null, // No template for basic view
        payslipData.year,
        0, // Use month 0 (January) as default for basic view
        calculatedValues
      );

      if (saveResult.success) {
        console.log(`✅ Basic View: Successfully saved data to Supabase with ID: ${saveResult.id}`);
        alert('✅ Data saved successfully to Supabase!');
      } else {
        console.error(`❌ Basic View: Save failed for ${selectedCustomer.full_name}:`, saveResult.error);
        alert(`❌ Save failed: ${saveResult.error}`);
      }
    } catch (error) {
      console.error(`❌ Basic View: Save error for ${selectedCustomer.full_name}:`, error);
      alert('❌ Error saving data to Supabase');
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
      <Title>👤 Basic View</Title>
      
      <ControlPanel>
        <FormRow>
          <InputGroup>
            <Label>Select Person:</Label>
            <Select
              value=""
              onChange={(e) => {
                const customerId = e.target.value;
                console.log('📊 Basic View: User manually selected person:', customerId);
                if (customerId) {
                  handleCustomerChange(customerId).catch(console.error);
                }
              }}
              disabled={isLoading}
            >
              <option value="">Choose Person...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {customer.email}
                </option>
              ))}
            </Select>
            {selectedCustomer && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>👤 Selected: {selectedCustomer.full_name}</span>
                <button
                  onClick={() => {
                    personSync.clearSelectedPerson('Basic View');
                    setSelectedCustomer(null);
                    console.log('📊 Basic View: Customer selection cleared');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px 6px'
                  }}
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Year</Label>
            <StyledInput
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
          {isLoading && (
            <LoadingOverlay>
              <div>🔄 Loading customer data...</div>
              <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                Please wait while we fetch the data for {selectedCustomer.full_name}
              </div>
            </LoadingOverlay>
          )}

          <SaveButton
            variant="primary"
            size="md"
            icon="💾"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            loading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </SaveButton>
          <RefreshButton
            variant="secondary"
            size="md"
            icon="🔄"
            onClick={handleRefresh}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </RefreshButton>

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: theme.spacing[8],
            padding: theme.spacing[6],
            background: theme.colors.gradients.primary + '10',
            borderRadius: theme.borderRadius.xl,
            position: 'relative'
          }}>
            <h1 style={{
              margin: '0 0 10px 0',
              background: theme.colors.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.extrabold
            }}>
              ⚡ ADVENSYS PAYSLIP
            </h1>
            <h2 style={{
              margin: '0 0 15px 0',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              Basic View - {payslipData.year}
            </h2>
          </div>

          {/* Employee Information */}
          <FieldGrid>
            <FieldGroup>
              <h3 style={{
                margin: `0 0 ${theme.spacing[4]} 0`,
                color: theme.colors.primary.main,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold
              }}>👤 Employee Information</h3>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Full Name</FieldLabel>
                <FieldInput
                  type="text"
                  value={payslipData.personName}
                  onChange={(e) => handleFieldChange('personName', e.target.value)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
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
              <h3 style={{
                margin: `0 0 ${theme.spacing[4]} 0`,
                color: theme.colors.primary.main,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold
              }}>💰 Salary Components</h3>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Basic Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.basicSalary}
                  onChange={(e) => handleFieldChange('basicSalary', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Allowances (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.allowances}
                  onChange={(e) => handleFieldChange('allowances', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Overtime (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.overtime}
                  onChange={(e) => handleFieldChange('overtime', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Bonus (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.bonus}
                  onChange={(e) => handleFieldChange('bonus', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
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
              <h3 style={{
                margin: `0 0 ${theme.spacing[4]} 0`,
                color: theme.colors.primary.main,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold
              }}>📊 Calculated Values</h3>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Gross Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.grossSalary}
                  disabled
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Income Tax (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.incomeTax}
                  disabled
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Social Security (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.socialSecurity}
                  disabled
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Total Deductions (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.totalDeductions}
                  disabled
                />
              </div>
              <div style={{ marginBottom: theme.spacing[4] }}>
                <FieldLabel>Net Salary (€)</FieldLabel>
                <FieldInput
                  type="number"
                  step="0.01"
                  value={payslipData.netSalary}
                  disabled
                  style={{
                    fontWeight: theme.typography.fontWeight.bold,
                    backgroundColor: theme.colors.success.light + '20',
                    borderColor: theme.colors.success.light
                  }}
                />
              </div>
            </FieldGroup>
          </FieldGrid>

          <div style={{
            marginTop: theme.spacing[8],
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
            padding: theme.spacing[4],
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.lg
          }}>
            <p style={{ margin: 0 }}>This payslip is computer generated and does not require signature.</p>
            <p style={{ margin: `${theme.spacing[1]} 0` }}>Generated on: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0 }}>Customer: {selectedCustomer.full_name} | Year: {payslipData.year}</p>
          </div>
        </PayslipSheet>
      )}

      {!selectedCustomer && (
        <Card variant="glassmorphism" padding="xl" style={{
          textAlign: 'center',
          margin: `${theme.spacing[6]} 0`
        }}>
          <h3 style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[3],
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold
          }}>👤 Select a Person</h3>
          <p style={{
            color: theme.colors.text.tertiary,
            margin: 0,
            fontSize: theme.typography.fontSize.sm
          }}>Choose a person from the dropdown above to view and edit their payslip data.</p>
        </Card>
      )}
    </Container>
  );
};

export default CustomerBasicView;