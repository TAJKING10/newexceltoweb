import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { EmployeePayslip, PayslipTemplate, DEFAULT_TEMPLATE, FieldDefinition } from '../../types/PayslipTypes';
import { Customer } from '../../utils/customerManager';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing[4]};
`;

const Modal = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  width: 98%;
  max-width: 1400px;
  height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.light};
  background: ${theme.colors.gradients.primary};
  color: white;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0 0 ${theme.spacing[2]} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Subtitle = styled.div`
  opacity: 0.9;
  font-size: ${theme.typography.fontSize.sm};
`;

const HeaderRight = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.lg};
  background: transparent;
  color: white;
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  ${props => props.variant === 'success' && `
    background: ${theme.colors.success.main};
    border-color: ${theme.colors.success.main};

    &:hover {
      background: ${theme.colors.success.dark};
      border-color: ${theme.colors.success.dark};
    }
  `}

  ${props => props.variant === 'danger' && `
    border-color: ${theme.colors.error.light};
    color: ${theme.colors.error.light};

    &:hover {
      background: ${theme.colors.error.light}20;
    }
  `}
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const EditorPanel = styled.div`
  flex: 1;
  padding: ${theme.spacing[6]};
  overflow-y: auto;
  background: ${theme.colors.background.secondary};
`;

const PreviewPanel = styled.div`
  flex: 1;
  border-left: 1px solid ${theme.colors.border.light};
  background: white;
  overflow-y: auto;
`;

const Section = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  margin-bottom: ${theme.spacing[6]};
  overflow: hidden;
  border: 1px solid ${theme.colors.border.light};
`;

const SectionHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.primary.main};
  color: white;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const SectionContent = styled.div`
  padding: ${theme.spacing[6]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.animation.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(91, 124, 255, 0.1);
  }

  &:disabled {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.tertiary};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  transition: all ${theme.animation.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(91, 124, 255, 0.1);
  }
`;

const CalculatedField = styled.div`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.gray[50]};
  border: 2px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddFieldButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary.main};
  border: 1px dashed ${theme.colors.primary.light};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  width: 100%;

  &:hover {
    background: ${theme.colors.primary[100]};
    border-color: ${theme.colors.primary.main};
  }
`;

const PreviewDocument = styled.div`
  padding: ${theme.spacing[8]};
  background: white;
  font-family: 'Calibri', Arial, sans-serif;
  line-height: 1.6;
  min-height: 100%;
`;

const PreviewHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid ${theme.colors.primary.main};
  padding-bottom: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const PreviewTableHeader = styled.th`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  text-align: left;
  border-bottom: 1px solid ${theme.colors.border.light};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const PreviewTableCell = styled.td`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.border.light};

  &:last-child {
    text-align: right;
    font-weight: ${theme.typography.fontWeight.medium};
  }
`;

interface PayslipEditorProps {
  payslip: EmployeePayslip;
  customer: Customer;
  template?: PayslipTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPayslip: EmployeePayslip) => void;
}

export const PayslipEditor: React.FC<PayslipEditorProps> = ({
  payslip,
  customer,
  template = DEFAULT_TEMPLATE,
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [editedPayslip, setEditedPayslip] = useState<EmployeePayslip>(payslip);
  const [earnings, setEarnings] = useState([
    { id: 'basic_salary', label: 'Basic Salary', amount: 5000, type: 'number' as const },
    { id: 'housing_allowance', label: 'Housing Allowance', amount: 1500, type: 'number' as const },
    { id: 'transport_allowance', label: 'Transport Allowance', amount: 500, type: 'number' as const },
    { id: 'overtime_pay', label: 'Overtime Pay', amount: 300, type: 'number' as const },
    { id: 'bonus', label: 'Bonus', amount: 0, type: 'number' as const }
  ]);

  const [deductions, setDeductions] = useState([
    { id: 'income_tax', label: 'Income Tax', amount: 750, type: 'formula' as const, formula: 'gross_salary * 0.15' },
    { id: 'social_security', label: 'Social Security', amount: 350, type: 'formula' as const, formula: 'basic_salary * 0.07' },
    { id: 'health_insurance', label: 'Health Insurance', amount: 200, type: 'number' as const },
    { id: 'retirement_fund', label: 'Retirement Fund', amount: 250, type: 'formula' as const, formula: 'basic_salary * 0.05' },
    { id: 'loan_deduction', label: 'Loan Deduction', amount: 0, type: 'number' as const }
  ]);

  const [employeeInfo, setEmployeeInfo] = useState({
    payPeriod: payslip.payPeriod,
    payDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Direct Deposit',
    notes: ''
  });

  useEffect(() => {
    calculateTotals();
  }, [earnings, deductions]);

  if (!isOpen) return null;

  const calculateTotals = () => {
    const grossSalary = earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

    // Update formula-based deductions
    const updatedDeductions = deductions.map(deduction => {
      if (deduction.type === 'formula') {
        switch (deduction.id) {
          case 'income_tax':
            return { ...deduction, amount: grossSalary * 0.15 };
          case 'social_security':
            const basicSalary = earnings.find(e => e.id === 'basic_salary')?.amount || 0;
            return { ...deduction, amount: basicSalary * 0.07 };
          case 'retirement_fund':
            const basic = earnings.find(e => e.id === 'basic_salary')?.amount || 0;
            return { ...deduction, amount: basic * 0.05 };
          default:
            return deduction;
        }
      }
      return deduction;
    });

    if (JSON.stringify(updatedDeductions) !== JSON.stringify(deductions)) {
      setDeductions(updatedDeductions);
    }
  };

  const handleEarningChange = (id: string, value: number) => {
    setEarnings(prev => prev.map(item =>
      item.id === id ? { ...item, amount: value } : item
    ));
  };

  const handleDeductionChange = (id: string, value: number) => {
    setDeductions(prev => prev.map(item =>
      item.id === id && item.type === 'number' ? { ...item, amount: value } : item
    ));
  };

  const handleAddEarning = () => {
    const newEarning = {
      id: `custom_earning_${Date.now()}`,
      label: 'New Earning',
      amount: 0,
      type: 'number' as const
    };
    setEarnings(prev => [...prev, newEarning]);
  };

  const handleAddDeduction = () => {
    const newDeduction = {
      id: `custom_deduction_${Date.now()}`,
      label: 'New Deduction',
      amount: 0,
      type: 'number' as const
    };
    setDeductions(prev => [...prev, newDeduction]);
  };

  const handleSave = () => {
    const updatedPayslip: EmployeePayslip = {
      ...editedPayslip,
      data: {
        ...editedPayslip.data,
        earnings,
        deductions,
        employeeInfo
      },
      calculatedValues: {
        grossSalary: earnings.reduce((sum, item) => sum + item.amount, 0),
        totalDeductions: deductions.reduce((sum, item) => sum + item.amount, 0),
        netSalary: earnings.reduce((sum, item) => sum + item.amount, 0) - deductions.reduce((sum, item) => sum + item.amount, 0)
      },
      payPeriod: employeeInfo.payPeriod
    };

    onSave(updatedPayslip);
  };

  const grossSalary = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netSalary = grossSalary - totalDeductions;

  return (
    <Container onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              ✏️ Edit Payslip - {customer.full_name}
            </Title>
            <Subtitle>
              Pay Period: {employeeInfo.payPeriod} | Employee ID: {customer.person_id}
            </Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <ActionButton variant="success" onClick={handleSave}>
              💾 Save Changes
            </ActionButton>
            <ActionButton onClick={onClose}>
              ✕ Cancel
            </ActionButton>
          </HeaderRight>
        </Header>

        <Content>
          <EditorPanel>
            {/* Employee Information Section */}
            <Section>
              <SectionHeader>
                <SectionTitle>👤 Employee Information</SectionTitle>
              </SectionHeader>
              <SectionContent>
                <FormGrid>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input value={customer.full_name} disabled />
                  </FormGroup>
                  <FormGroup>
                    <Label>Employee ID</Label>
                    <Input value={customer.person_id} disabled />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input value={customer.email} disabled />
                  </FormGroup>
                  <FormGroup>
                    <Label>Department</Label>
                    <Input value={customer.department || 'N/A'} disabled />
                  </FormGroup>
                  <FormGroup>
                    <Label>Pay Period *</Label>
                    <Input
                      value={employeeInfo.payPeriod}
                      onChange={(e) => setEmployeeInfo(prev => ({ ...prev, payPeriod: e.target.value }))}
                      placeholder="e.g., 2024-01"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Pay Date *</Label>
                    <Input
                      type="date"
                      value={employeeInfo.payDate}
                      onChange={(e) => setEmployeeInfo(prev => ({ ...prev, payDate: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Payment Method</Label>
                    <Select
                      value={employeeInfo.paymentMethod}
                      onChange={(e) => setEmployeeInfo(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="Direct Deposit">Direct Deposit</option>
                      <option value="Check">Check</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </Select>
                  </FormGroup>
                </FormGrid>
              </SectionContent>
            </Section>

            {/* Earnings Section */}
            <Section>
              <SectionHeader>
                <SectionTitle>💰 Earnings</SectionTitle>
              </SectionHeader>
              <SectionContent>
                <FormGrid>
                  {earnings.map(earning => (
                    <FormGroup key={earning.id}>
                      <Label>{earning.label}</Label>
                      <Input
                        type="number"
                        value={earning.amount}
                        onChange={(e) => handleEarningChange(earning.id, parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </FormGroup>
                  ))}
                  <AddFieldButton onClick={handleAddEarning}>
                    ➕ Add Custom Earning
                  </AddFieldButton>
                </FormGrid>
              </SectionContent>
            </Section>

            {/* Deductions Section */}
            <Section>
              <SectionHeader>
                <SectionTitle>📉 Deductions</SectionTitle>
              </SectionHeader>
              <SectionContent>
                <FormGrid>
                  {deductions.map(deduction => (
                    <FormGroup key={deduction.id}>
                      <Label>
                        {deduction.label}
                        {deduction.type === 'formula' && ' (Auto-calculated)'}
                      </Label>
                      {deduction.type === 'formula' ? (
                        <CalculatedField>
                          <span>Formula: {deduction.formula}</span>
                          <span>${deduction.amount.toFixed(2)}</span>
                        </CalculatedField>
                      ) : (
                        <Input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => handleDeductionChange(deduction.id, parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                        />
                      )}
                    </FormGroup>
                  ))}
                  <AddFieldButton onClick={handleAddDeduction}>
                    ➕ Add Custom Deduction
                  </AddFieldButton>
                </FormGrid>
              </SectionContent>
            </Section>

            {/* Summary Section */}
            <Section>
              <SectionHeader>
                <SectionTitle>📊 Summary</SectionTitle>
              </SectionHeader>
              <SectionContent>
                <FormGrid>
                  <FormGroup>
                    <Label>Gross Salary</Label>
                    <CalculatedField>
                      <span>Auto-calculated</span>
                      <span>${grossSalary.toFixed(2)}</span>
                    </CalculatedField>
                  </FormGroup>
                  <FormGroup>
                    <Label>Total Deductions</Label>
                    <CalculatedField>
                      <span>Auto-calculated</span>
                      <span>${totalDeductions.toFixed(2)}</span>
                    </CalculatedField>
                  </FormGroup>
                  <FormGroup>
                    <Label>Net Salary</Label>
                    <CalculatedField style={{ background: theme.colors.success[50], borderColor: theme.colors.success.main }}>
                      <span><strong>Final Amount</strong></span>
                      <span><strong>${netSalary.toFixed(2)}</strong></span>
                    </CalculatedField>
                  </FormGroup>
                </FormGrid>
              </SectionContent>
            </Section>
          </EditorPanel>

          <PreviewPanel>
            <PreviewDocument>
              <PreviewHeader>
                <h1 style={{ color: theme.colors.primary.main, margin: '0 0 10px 0' }}>
                  {template.header.companyInfo.name}
                </h1>
                <h2 style={{ margin: '0 0 20px 0' }}>PAYSLIP</h2>
                <div style={{ fontSize: '14px', color: theme.colors.text.secondary }}>
                  {template.header.companyInfo.address}<br />
                  📞 {template.header.companyInfo.phone} | 📧 {template.header.companyInfo.email}
                </div>
              </PreviewHeader>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', padding: '20px', background: theme.colors.background.secondary, borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>Employee Information</h4>
                  <div><strong>Name:</strong> {customer.full_name}</div>
                  <div><strong>ID:</strong> {customer.person_id}</div>
                  <div><strong>Email:</strong> {customer.email}</div>
                  {customer.department && <div><strong>Department:</strong> {customer.department}</div>}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>Pay Information</h4>
                  <div><strong>Pay Period:</strong> {employeeInfo.payPeriod}</div>
                  <div><strong>Pay Date:</strong> {new Date(employeeInfo.payDate).toLocaleDateString()}</div>
                  <div><strong>Payment Method:</strong> {employeeInfo.paymentMethod}</div>
                </div>
              </div>

              <h3 style={{ color: theme.colors.primary.main, marginBottom: '15px' }}>💰 Earnings</h3>
              <PreviewTable>
                <thead>
                  <tr>
                    <PreviewTableHeader>Description</PreviewTableHeader>
                    <PreviewTableHeader>Amount</PreviewTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map(earning => (
                    <tr key={earning.id}>
                      <PreviewTableCell>{earning.label}</PreviewTableCell>
                      <PreviewTableCell>${earning.amount.toFixed(2)}</PreviewTableCell>
                    </tr>
                  ))}
                </tbody>
              </PreviewTable>

              <h3 style={{ color: theme.colors.primary.main, marginBottom: '15px' }}>📉 Deductions</h3>
              <PreviewTable>
                <thead>
                  <tr>
                    <PreviewTableHeader>Description</PreviewTableHeader>
                    <PreviewTableHeader>Amount</PreviewTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map(deduction => (
                    <tr key={deduction.id}>
                      <PreviewTableCell>
                        {deduction.label}
                        {deduction.type === 'formula' && ' (Auto)'}
                      </PreviewTableCell>
                      <PreviewTableCell>${deduction.amount.toFixed(2)}</PreviewTableCell>
                    </tr>
                  ))}
                </tbody>
              </PreviewTable>

              <div style={{ background: theme.colors.primary[50], padding: '20px', borderRadius: '8px', marginTop: '30px', border: `2px solid ${theme.colors.primary.main}` }}>
                <h3 style={{ color: theme.colors.primary.main, marginBottom: '15px' }}>📊 Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.colors.primary.light}` }}>
                    <span>Gross Salary:</span>
                    <span>${grossSalary.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.colors.primary.light}` }}>
                    <span>Total Deductions:</span>
                    <span>${totalDeductions.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '18px', color: theme.colors.primary.main, gridColumn: '1 / -1' }}>
                    <span>NET SALARY:</span>
                    <span>${netSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </PreviewDocument>
          </PreviewPanel>
        </Content>
      </Modal>
    </Container>
  );
};