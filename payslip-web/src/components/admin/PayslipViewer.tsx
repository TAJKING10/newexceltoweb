import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { EmployeePayslip, PayslipTemplate, DEFAULT_TEMPLATE } from '../../types/PayslipTypes';
import { Customer } from '../../utils/customerManager';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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
  width: 95%;
  max-width: 1200px;
  height: 90vh;
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

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[1]};
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.isActive ? 'white' : 'transparent'};
  color: ${props => props.isActive ? theme.colors.primary.main : 'white'};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  white-space: nowrap;

  &:hover {
    background: ${props => props.isActive ? 'white' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.lg};
  background: transparent;
  color: white;
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }

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
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PayslipContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${theme.spacing[6]};
  background: #f8f9fa;
`;

const PayslipDocument = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin: 0 auto;
  max-width: 800px;
  min-height: 1000px;
`;

const BasicView = styled.div`
  padding: ${theme.spacing[8]};
  font-family: 'Calibri', Arial, sans-serif;
  line-height: 1.6;
`;

const ExcelView = styled.div`
  padding: ${theme.spacing[4]};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 12px;
`;

const PayslipHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid ${theme.colors.primary.main};
  padding-bottom: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const CompanyLogo = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing[4]};
`;

const CompanyName = styled.h1`
  margin: 0 0 ${theme.spacing[2]} 0;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.black};
`;

const PayslipTitle = styled.h2`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const CompanyInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const InfoLabel = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.primary.main};
  color: white;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const TableHeader = styled.th`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  text-align: left;
  border-bottom: 1px solid ${theme.colors.border.light};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const TableCell = styled.td`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.border.light};
  color: ${theme.colors.text.primary};

  &:last-child {
    text-align: right;
    font-weight: ${theme.typography.fontWeight.medium};
  }
`;

const SummarySection = styled.div`
  background: ${theme.colors.primary[50]};
  border: 2px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin-top: ${theme.spacing[6]};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: ${theme.spacing[2]} 0;
  border-bottom: 1px solid ${theme.colors.primary.light};

  &:last-child {
    border-bottom: none;
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.fontSize.lg};
    color: ${theme.colors.primary.main};
  }
`;

const ExcelTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: 'Calibri', sans-serif;
`;

const ExcelCell = styled.td<{
  header?: boolean;
  numeric?: boolean;
  bold?: boolean;
  background?: string;
  border?: string;
}>`
  padding: 4px 8px;
  border: 1px solid #d0d7de;
  ${props => props.header && `
    background: #f6f8fa;
    font-weight: bold;
    text-align: center;
  `}
  ${props => props.numeric && `text-align: right;`}
  ${props => props.bold && `font-weight: bold;`}
  ${props => props.background && `background: ${props.background};`}
  ${props => props.border && `border: ${props.border};`}
`;

interface PayslipViewerProps {
  payslip: EmployeePayslip;
  customer: Customer;
  template?: PayslipTemplate;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

type ViewMode = 'basic' | 'excel';

export const PayslipViewer: React.FC<PayslipViewerProps> = ({
  payslip,
  customer,
  template = DEFAULT_TEMPLATE,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('basic');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=800,width=1200');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Payslip - ${customer.full_name} - ${payslip.payPeriod}</title>
              <style>
                body { font-family: Calibri, Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { background-color: #e3f2fd; padding: 15px; border-radius: 5px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const mockEarnings = [
    { label: 'Basic Salary', amount: 5000 },
    { label: 'Housing Allowance', amount: 1500 },
    { label: 'Transport Allowance', amount: 500 },
    { label: 'Overtime Pay', amount: 300 }
  ];

  const mockDeductions = [
    { label: 'Income Tax', amount: 750 },
    { label: 'Social Security', amount: 350 },
    { label: 'Health Insurance', amount: 200 },
    { label: 'Retirement Fund', amount: 250 }
  ];

  const grossSalary = mockEarnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = mockDeductions.reduce((sum, item) => sum + item.amount, 0);
  const netSalary = grossSalary - totalDeductions;

  const renderBasicView = () => (
    <BasicView>
      <PayslipHeader>
        <CompanyLogo>🏢</CompanyLogo>
        <CompanyName>{template.header.companyInfo.name}</CompanyName>
        <PayslipTitle>PAYSLIP</PayslipTitle>
        <CompanyInfo>
          <div>{template.header.companyInfo.address}</div>
          <div>📞 {template.header.companyInfo.phone} | 📧 {template.header.companyInfo.email}</div>
          {template.header.companyInfo.website && (
            <div>🌐 {template.header.companyInfo.website}</div>
          )}
        </CompanyInfo>
      </PayslipHeader>

      <InfoSection>
        <InfoGroup>
          <InfoLabel>Employee Information</InfoLabel>
          <InfoValue><strong>Name:</strong> {customer.full_name}</InfoValue>
          <InfoValue><strong>ID:</strong> {customer.person_id}</InfoValue>
          <InfoValue><strong>Email:</strong> {customer.email}</InfoValue>
          {customer.department && <InfoValue><strong>Department:</strong> {customer.department}</InfoValue>}
          {customer.position && <InfoValue><strong>Position:</strong> {customer.position}</InfoValue>}
        </InfoGroup>
        <InfoGroup>
          <InfoLabel>Pay Period Information</InfoLabel>
          <InfoValue><strong>Pay Period:</strong> {payslip.payPeriod}</InfoValue>
          <InfoValue><strong>Pay Date:</strong> {new Date().toLocaleDateString()}</InfoValue>
          <InfoValue><strong>Generated:</strong> {payslip.generatedDate.toLocaleDateString()}</InfoValue>
          <InfoValue><strong>Payment Method:</strong> Direct Deposit</InfoValue>
        </InfoGroup>
      </InfoSection>

      <Section>
        <SectionTitle>💰 Earnings</SectionTitle>
        <Table>
          <thead>
            <tr>
              <TableHeader>Description</TableHeader>
              <TableHeader>Amount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {mockEarnings.map((item, index) => (
              <tr key={index}>
                <TableCell>{item.label}</TableCell>
                <TableCell>${item.amount.toLocaleString()}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section>
        <SectionTitle>📉 Deductions</SectionTitle>
        <Table>
          <thead>
            <tr>
              <TableHeader>Description</TableHeader>
              <TableHeader>Amount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {mockDeductions.map((item, index) => (
              <tr key={index}>
                <TableCell>{item.label}</TableCell>
                <TableCell>${item.amount.toLocaleString()}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <SummarySection>
        <SectionTitle style={{ margin: '0 0 20px 0' }}>📊 Summary</SectionTitle>
        <SummaryGrid>
          <SummaryItem>
            <span>Gross Salary:</span>
            <span>${grossSalary.toLocaleString()}</span>
          </SummaryItem>
          <SummaryItem>
            <span>Total Deductions:</span>
            <span>${totalDeductions.toLocaleString()}</span>
          </SummaryItem>
          <SummaryItem>
            <span><strong>Net Salary:</strong></span>
            <span><strong>${netSalary.toLocaleString()}</strong></span>
          </SummaryItem>
        </SummaryGrid>
      </SummarySection>
    </BasicView>
  );

  const renderExcelView = () => (
    <ExcelView>
      <ExcelTable>
        <tbody>
          {/* Header */}
          <tr>
            <ExcelCell header background="#1565c0" style={{ color: 'white', fontSize: '16px' }} colSpan={4}>
              {template.header.companyInfo.name} - PAYSLIP
            </ExcelCell>
          </tr>
          <tr>
            <ExcelCell colSpan={4} style={{ textAlign: 'center', padding: '8px' }}>
              {template.header.companyInfo.address} | {template.header.companyInfo.phone} | {template.header.companyInfo.email}
            </ExcelCell>
          </tr>
          <tr><ExcelCell colSpan={4}></ExcelCell></tr>

          {/* Employee Info */}
          <tr>
            <ExcelCell header background="#e3f2fd">Employee Name</ExcelCell>
            <ExcelCell>{customer.full_name}</ExcelCell>
            <ExcelCell header background="#e3f2fd">Pay Period</ExcelCell>
            <ExcelCell>{payslip.payPeriod}</ExcelCell>
          </tr>
          <tr>
            <ExcelCell header background="#e3f2fd">Employee ID</ExcelCell>
            <ExcelCell>{customer.person_id}</ExcelCell>
            <ExcelCell header background="#e3f2fd">Pay Date</ExcelCell>
            <ExcelCell>{new Date().toLocaleDateString()}</ExcelCell>
          </tr>
          <tr>
            <ExcelCell header background="#e3f2fd">Department</ExcelCell>
            <ExcelCell>{customer.department || 'N/A'}</ExcelCell>
            <ExcelCell header background="#e3f2fd">Position</ExcelCell>
            <ExcelCell>{customer.position || 'N/A'}</ExcelCell>
          </tr>
          <tr><ExcelCell colSpan={4}></ExcelCell></tr>

          {/* Earnings */}
          <tr>
            <ExcelCell header background="#4caf50" style={{ color: 'white' }} colSpan={2}>EARNINGS</ExcelCell>
            <ExcelCell header background="#f44336" style={{ color: 'white' }} colSpan={2}>DEDUCTIONS</ExcelCell>
          </tr>
          {Math.max(mockEarnings.length, mockDeductions.length) &&
            Array.from({ length: Math.max(mockEarnings.length, mockDeductions.length) }).map((_, index) => (
              <tr key={index}>
                <ExcelCell>{mockEarnings[index]?.label || ''}</ExcelCell>
                <ExcelCell numeric>{mockEarnings[index]?.amount ? `$${mockEarnings[index].amount.toLocaleString()}` : ''}</ExcelCell>
                <ExcelCell>{mockDeductions[index]?.label || ''}</ExcelCell>
                <ExcelCell numeric>{mockDeductions[index]?.amount ? `$${mockDeductions[index].amount.toLocaleString()}` : ''}</ExcelCell>
              </tr>
            ))
          }

          <tr><ExcelCell colSpan={4}></ExcelCell></tr>

          {/* Summary */}
          <tr>
            <ExcelCell header background="#ff9800" style={{ color: 'white' }} colSpan={4}>SUMMARY</ExcelCell>
          </tr>
          <tr>
            <ExcelCell bold>Gross Salary</ExcelCell>
            <ExcelCell numeric bold>${grossSalary.toLocaleString()}</ExcelCell>
            <ExcelCell bold>Total Deductions</ExcelCell>
            <ExcelCell numeric bold>${totalDeductions.toLocaleString()}</ExcelCell>
          </tr>
          <tr>
            <ExcelCell bold background="#e8f5e8">NET SALARY</ExcelCell>
            <ExcelCell numeric bold background="#e8f5e8" colSpan={3}>${netSalary.toLocaleString()}</ExcelCell>
          </tr>
        </tbody>
      </ExcelTable>
    </ExcelView>
  );

  return (
    <Container onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              Payslip - {customer.full_name}
            </Title>
            <Subtitle>
              Pay Period: {payslip.payPeriod} | Generated: {payslip.generatedDate.toLocaleDateString()}
            </Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <ViewToggle>
              <ToggleButton
                isActive={viewMode === 'basic'}
                onClick={() => setViewMode('basic')}
              >
                📝 Basic View
              </ToggleButton>
              <ToggleButton
                isActive={viewMode === 'excel'}
                onClick={() => setViewMode('excel')}
              >
                📊 Excel View
              </ToggleButton>
            </ViewToggle>

            <ActionButton onClick={handlePrint}>
              🖨️ Print
            </ActionButton>

            {onEdit && (
              <ActionButton onClick={onEdit}>
                ✏️ Edit
              </ActionButton>
            )}

            {onDelete && (
              <ActionButton variant="danger" onClick={onDelete}>
                🗑️ Delete
              </ActionButton>
            )}

            <ActionButton onClick={onClose}>
              ✕ Close
            </ActionButton>
          </HeaderRight>
        </Header>

        <Content>
          <PayslipContainer>
            <PayslipDocument ref={printRef}>
              {viewMode === 'basic' ? renderBasicView() : renderExcelView()}
            </PayslipDocument>
          </PayslipContainer>
        </Content>
      </Modal>
    </Container>
  );
};