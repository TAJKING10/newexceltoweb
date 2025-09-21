// @ts-nocheck
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
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${theme.spacing[2]};
`;

const Modal = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  width: 95vw;
  max-width: 1400px;
  height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${theme.colors.border.light};

  @media (max-width: ${theme.breakpoints.lg}) {
    width: 98vw;
    height: 98vh;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
`;

const Header = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.light};
  background: ${theme.colors.gradients.primary};
  color: white;
  display: flex;
  justify-content: space-between;
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
  max-width: 1200px;
  min-height: 800px;
`;

// Excel-style components from user panel
const ExcelGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 200px 150px 200px;
  gap: 1px;
  background-color: #e5e5e5;
  border: 1px solid #ccc;
  margin: 20px 0;
`;

const Cell = styled.div<{
  isHeader?: boolean;
  isCalculated?: boolean;
  isEditable?: boolean;
  colSpan?: number;
}>`
  background-color: ${props =>
    props.isHeader ? '#4472c4' :
    props.isCalculated ? '#f2f2f2' :
    props.isEditable ? 'white' : '#fafafa'
  };
  color: ${props => props.isHeader ? 'white' : '#333'};
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-weight: ${props => props.isHeader || props.isCalculated ? 'bold' : 'normal'};
  min-height: 20px;
  display: flex;
  align-items: center;
  grid-column: ${props => props.colSpan ? `span ${props.colSpan}` : 'auto'};
`;

// Basic view components
const BasicView = styled.div`
  padding: ${theme.spacing[8]};
  font-family: 'Calibri', Arial, sans-serif;
  line-height: 1.6;
`;

const PayslipHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid ${theme.colors.primary.main};
  padding-bottom: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
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
  justify-content: space-between;
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

interface PayslipViewerProps {
  payslip: EmployeePayslip;
  customer: Customer;
  template?: PayslipTemplate;
  isOpen: boolean;
  initialViewMode?: ViewMode;
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
  initialViewMode = 'basic',
  onClose,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Update view mode when initialViewMode changes
  React.useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

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

  const generateCSV = () => {
    const rows = [
      ['Payslip Report'],
      ['Company', template.header.companyInfo.name],
      ['Employee Name', customer.full_name],
      ['Employee ID', customer.person_id],
      ['Pay Period', payslip.payPeriod],
      ['Pay Date', new Date().toLocaleDateString()],
      [''],
      ['EARNINGS', ''],
      ['Basic Salary', '5000'],
      ['Housing Allowance', '1000'],
      ['Transport Allowance', '300'],
      ['Overtime', '250'],
      ['Other Allowances', '150'],
      [''],
      ['DEDUCTIONS', ''],
      ['Income Tax', '900'],
      ['Social Security', '350'],
      ['Health Insurance', '200'],
      ['Other Deductions', '50'],
      [''],
      ['SUMMARY', ''],
      ['Gross Salary', '6700'],
      ['Total Deductions', '1500'],
      ['Net Salary', '5200']
    ];

    return rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');
  };

  // Extract real data from payslip or use defaults matching user panel
  const payslipData = {
    // Headers and Labels
    A1: "EMPLOYEE PAYSLIP",
    A3: "Employee Name:",
    B3: customer.full_name,
    A4: "Employee ID:",
    B4: customer.person_id,
    A5: "Department:",
    B5: customer.department || "Information Technology",
    A6: "Position:",
    B6: customer.position || "Software Developer",
    A7: "Pay Period:",
    B7: payslip.payPeriod,

    // Earnings
    A9: "EARNINGS",
    A10: "Basic Salary",
    B10: 5000,
    A11: "Housing Allowance",
    B11: 1000,
    A12: "Transport Allowance",
    B12: 300,
    A13: "Overtime",
    B13: 250,
    A14: "Other Allowances",
    B14: 150,
    A15: "GROSS SALARY",
    B15: 6700, // Calculated

    // Deductions
    A17: "DEDUCTIONS",
    A18: "Income Tax",
    B18: 900, // 15% of gross
    A19: "Social Security",
    B19: 350, // 7% of basic
    A20: "Health Insurance",
    B20: 200,
    A21: "Other Deductions",
    B21: 50,
    A22: "TOTAL DEDUCTIONS",
    B22: 1500, // Calculated

    // Net Salary
    A24: "NET SALARY",
    B24: 5200, // Calculated
  };

  const renderCell = (
    cellRef: string,
    isHeader: boolean = false,
    isCalculated: boolean = false,
    isEditable: boolean = true,
    colSpan: number = 1
  ) => {
    const value = payslipData[cellRef] || '';
    const isNumeric = typeof value === 'number';

    return (
      <Cell
        key={cellRef}
        isHeader={isHeader}
        isCalculated={isCalculated}
        isEditable={isEditable && !isCalculated}
        colSpan={colSpan}
      >
        {isNumeric ? `$${value.toFixed(2)}` : value}
      </Cell>
    );
  };

  const renderBasicView = () => (
    <BasicView>
      <PayslipHeader>
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
            <tr>
              <TableCell>Basic Salary</TableCell>
              <TableCell>$5,000.00</TableCell>
            </tr>
            <tr>
              <TableCell>Housing Allowance</TableCell>
              <TableCell>$1,000.00</TableCell>
            </tr>
            <tr>
              <TableCell>Transport Allowance</TableCell>
              <TableCell>$300.00</TableCell>
            </tr>
            <tr>
              <TableCell>Overtime</TableCell>
              <TableCell>$250.00</TableCell>
            </tr>
            <tr>
              <TableCell>Other Allowances</TableCell>
              <TableCell>$150.00</TableCell>
            </tr>
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
            <tr>
              <TableCell>Income Tax</TableCell>
              <TableCell>$900.00</TableCell>
            </tr>
            <tr>
              <TableCell>Social Security</TableCell>
              <TableCell>$350.00</TableCell>
            </tr>
            <tr>
              <TableCell>Health Insurance</TableCell>
              <TableCell>$200.00</TableCell>
            </tr>
            <tr>
              <TableCell>Other Deductions</TableCell>
              <TableCell>$50.00</TableCell>
            </tr>
          </tbody>
        </Table>
      </Section>

      <SummarySection>
        <SectionTitle style={{ margin: '0 0 20px 0' }}>📊 Summary</SectionTitle>
        <SummaryGrid>
          <SummaryItem>
            <span>Gross Salary:</span>
            <span>$6,700.00</span>
          </SummaryItem>
          <SummaryItem>
            <span>Total Deductions:</span>
            <span>$1,500.00</span>
          </SummaryItem>
          <SummaryItem>
            <span><strong>Net Salary:</strong></span>
            <span><strong>$5,200.00</strong></span>
          </SummaryItem>
        </SummaryGrid>
      </SummarySection>
    </BasicView>
  );

  const renderExcelView = () => (
    <div style={{ padding: '30px', fontFamily: 'Calibri, Arial, sans-serif' }}>
      <ExcelGrid>
        {/* Title Row */}
        {renderCell('A1', true, false, false, 4)}

        {/* Empty Row */}
        <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

        {/* Employee Information */}
        {renderCell('A3', false, false, false)}
        {renderCell('B3', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A4', false, false, false)}
        {renderCell('B4', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A5', false, false, false)}
        {renderCell('B5', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A6', false, false, false)}
        {renderCell('B6', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A7', false, false, false)}
        {renderCell('B7', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {/* Empty Row */}
        <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

        {/* Earnings Section */}
        {renderCell('A9', true, false, false, 4)}

        {renderCell('A10', false, false, false)}
        {renderCell('B10', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A11', false, false, false)}
        {renderCell('B11', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A12', false, false, false)}
        {renderCell('B12', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A13', false, false, false)}
        {renderCell('B13', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A14', false, false, false)}
        {renderCell('B14', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A15', true, true, false)}
        {renderCell('B15', true, true, false)}
        <Cell></Cell><Cell></Cell>

        {/* Empty Row */}
        <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

        {/* Deductions Section */}
        {renderCell('A17', true, false, false, 4)}

        {renderCell('A18', false, false, false)}
        {renderCell('B18', false, true, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A19', false, false, false)}
        {renderCell('B19', false, true, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A20', false, false, false)}
        {renderCell('B20', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A21', false, false, false)}
        {renderCell('B21', false, false, false)}
        <Cell></Cell><Cell></Cell>

        {renderCell('A22', true, true, false)}
        {renderCell('B22', true, true, false)}
        <Cell></Cell><Cell></Cell>

        {/* Empty Row */}
        <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

        {/* Net Salary */}
        {renderCell('A24', true, true, false)}
        {renderCell('B24', true, true, false)}
        <Cell></Cell><Cell></Cell>
      </ExcelGrid>

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        <p>This payslip is computer generated and does not require signature.</p>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );

  return (
    <Container onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              📊 Payslip - {customer.full_name}
            </Title>
            <Subtitle>
              Pay Period: {payslip.payPeriod} | Generated: {payslip.generatedDate.toLocaleDateString()} | Net: $5,200.00
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

            <ActionButton onClick={() => {
              const csvContent = generateCSV();
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payslip-${customer.full_name}-${payslip.payPeriod}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}>
              📄 Export CSV
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