// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { EmployeePayslip, PayslipTemplate, DEFAULT_TEMPLATE, FieldDefinition } from '../../types/PayslipTypes';
import { Customer } from '../../utils/customerManager';
import { FormulaParser } from '../../utils/formulaParser';

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
  width: 98vw;
  max-width: 1600px;
  height: 98vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${theme.colors.border.light};

  @media (max-width: ${theme.breakpoints.lg}) {
    width: 95vw;
    height: 95vh;
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

const ControlPanel = styled.div`
  width: 300px;
  background: ${theme.colors.background.secondary};
  border-right: 1px solid ${theme.colors.border.light};
  padding: ${theme.spacing[4]};
  overflow-y: auto;
`;

const EditorPanel = styled.div`
  flex: 1;
  padding: ${theme.spacing[6]};
  overflow-y: auto;
  background: #f8f9fa;
`;

const PayslipSheet = styled.div`
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: 'Calibri', Arial, sans-serif;
`;

// Excel-style grid components from user panel
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

  &:hover {
    background-color: ${props => props.isEditable ? '#e3f2fd' : 'inherit'};
  }
`;

const CellInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: 2px solid #1976d2;
    background-color: white;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const SectionHeader = styled.h3`
  color: ${theme.colors.primary.main};
  border-bottom: 2px solid ${theme.colors.primary.main};
  padding-bottom: 8px;
  margin-bottom: 16px;
`;

const SaveButton = styled.button`
  position: absolute;
  top: 20px;
  right: 140px;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #1976d2;
  }
`;

const PrintButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #45a049;
  }
`;

interface PayslipState {
  [key: string]: any;
  // Employee Info
  A1: string; // "EMPLOYEE PAYSLIP"
  A3: string; // "Employee Name:"
  B3: string; // Employee Name Value
  A4: string; // "Employee ID:"
  B4: string; // Employee ID Value
  A5: string; // "Department:"
  B5: string; // Department Value
  A6: string; // "Position:"
  B6: string; // Position Value
  A7: string; // "Pay Period:"
  B7: string; // Pay Period Value

  // Earnings Section
  A9: string;  // "EARNINGS"
  A10: string; // "Basic Salary"
  B10: number; // Basic Salary Amount
  A11: string; // "Housing Allowance"
  B11: number; // Housing Allowance Amount
  A12: string; // "Transport Allowance"
  B12: number; // Transport Allowance Amount
  A13: string; // "Overtime"
  B13: number; // Overtime Amount
  A14: string; // "Other Allowances"
  B14: number; // Other Allowances Amount
  A15: string; // "GROSS SALARY"
  B15: number; // Gross Salary (Formula)

  // Deductions Section
  A17: string; // "DEDUCTIONS"
  A18: string; // "Income Tax"
  B18: number; // Income Tax (Formula)
  A19: string; // "Social Security"
  B19: number; // Social Security (Formula)
  A20: string; // "Health Insurance"
  B20: number; // Health Insurance Amount
  A21: string; // "Other Deductions"
  B21: number; // Other Deductions Amount
  A22: string; // "TOTAL DEDUCTIONS"
  B22: number; // Total Deductions (Formula)

  // Net Salary
  A24: string; // "NET SALARY"
  B24: number; // Net Salary (Formula)
}

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

  const [payPeriod, setPayPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10)
  });

  const [payslipData, setPayslipData] = useState<PayslipState>({
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
    B7: payslip.payPeriod || new Date().toISOString().substr(0, 7),

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
    B15: 0, // Will be calculated

    // Deductions
    A17: "DEDUCTIONS",
    A18: "Income Tax",
    B18: 0, // Will be calculated
    A19: "Social Security",
    B19: 0, // Will be calculated
    A20: "Health Insurance",
    B20: 200,
    A21: "Other Deductions",
    B21: 50,
    A22: "TOTAL DEDUCTIONS",
    B22: 0, // Will be calculated

    // Net Salary
    A24: "NET SALARY",
    B24: 0, // Will be calculated
  });

  // Define the formulas (Excel-like)
  const formulas = {
    B15: "=B10+B11+B12+B13+B14", // Gross Salary
    B18: "=B15*0.15", // Income Tax (15% of gross)
    B19: "=B10*0.07", // Social Security (7% of basic salary)
    B22: "=B18+B19+B20+B21", // Total Deductions
    B24: "=B15-B22", // Net Salary
  };

  // Calculate formulas
  useEffect(() => {
    const newData = { ...payslipData };

    // Define getCellValue function
    const getCellValue = (ref: string) => payslipData[ref] || 0;

    // Calculate each formula
    Object.entries(formulas).forEach(([cellRef, formula]) => {
      try {
        const result = FormulaParser.parseFormula(formula, getCellValue);
        newData[cellRef] = typeof result === 'number' ? result : 0;
      } catch (error) {
        console.error(`Error calculating ${cellRef}: ${formula}`, error);
        newData[cellRef] = 0;
      }
    });

    setPayslipData(newData);
  }, [
    payslipData.B10, payslipData.B11, payslipData.B12,
    payslipData.B13, payslipData.B14, payslipData.B20, payslipData.B21
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleCellChange = (cellRef: string, value: string | number) => {
    setPayslipData(prev => ({
      ...prev,
      [cellRef]: value
    }));
  };

  const handleSave = () => {
    const updatedPayslip: EmployeePayslip = {
      ...payslip,
      data: {
        ...payslip.data,
        payslipData: payslipData,
        employeeInfo: {
          payPeriod: payslipData.B7,
          payDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Direct Deposit',
          notes: ''
        }
      },
      calculatedValues: {
        grossSalary: payslipData.B15,
        totalDeductions: payslipData.B22,
        netSalary: payslipData.B24
      },
      payPeriod: payslipData.B7
    };

    onSave(updatedPayslip);
  };

  const handlePrint = () => {
    window.print();
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
        {isCalculated || !isEditable ? (
          isNumeric ? `$${value.toFixed(2)}` : value
        ) : (
          <CellInput
            type={isNumeric ? "number" : "text"}
            value={value}
            onChange={(e) => {
              const newValue = isNumeric ? parseFloat(e.target.value) || 0 : e.target.value;
              handleCellChange(cellRef, newValue);
            }}
            step={isNumeric ? "0.01" : undefined}
          />
        )}
      </Cell>
    );
  };

  return (
    <Container onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              ✏️ Edit Payslip - {customer.full_name}
            </Title>
            <Subtitle>
              Pay Period: {payslipData.B7} | Employee ID: {customer.person_id} | Live Excel-Style Editing
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
          <ControlPanel>
            <SectionHeader>🎛️ Controls</SectionHeader>

            <InputGroup>
              <Label>Pay Period Month:</Label>
              <Select
                value={payPeriod.month}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  setPayPeriod(prev => ({ ...prev, month }));
                  handleCellChange('B7', `${new Date(payPeriod.year, month - 1).toLocaleString('default', { month: 'long' })} ${payPeriod.year}`);
                }}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Year:</Label>
              <Select
                value={payPeriod.year}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setPayPeriod(prev => ({ ...prev, year }));
                  handleCellChange('B7', `${new Date(year, payPeriod.month - 1).toLocaleString('default', { month: 'long' })} ${year}`);
                }}
              >
                {Array.from({length: 10}, (_, i) => (
                  <option key={2020 + i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Period Start Date:</Label>
              <DateInput
                type="date"
                value={payPeriod.startDate}
                onChange={(e) => setPayPeriod(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </InputGroup>

            <InputGroup>
              <Label>Period End Date:</Label>
              <DateInput
                type="date"
                value={payPeriod.endDate}
                onChange={(e) => setPayPeriod(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </InputGroup>

            <SectionHeader>📊 Summary</SectionHeader>
            <InputGroup>
              <Label>Gross Salary:</Label>
              <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '4px', fontWeight: 'bold' }}>
                ${payslipData.B15?.toFixed(2) || '0.00'}
              </div>
            </InputGroup>

            <InputGroup>
              <Label>Total Deductions:</Label>
              <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '4px', fontWeight: 'bold' }}>
                ${payslipData.B22?.toFixed(2) || '0.00'}
              </div>
            </InputGroup>

            <InputGroup>
              <Label>Net Salary:</Label>
              <div style={{ padding: '8px', background: '#e8f5e8', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', color: '#2e7d32' }}>
                ${payslipData.B24?.toFixed(2) || '0.00'}
              </div>
            </InputGroup>
          </ControlPanel>

          <EditorPanel>
            <PayslipSheet>
              <SaveButton onClick={handleSave}>Save Data</SaveButton>
              <PrintButton onClick={handlePrint}>Print</PrintButton>

              <ExcelGrid>
                {/* Title Row */}
                {renderCell('A1', true, false, false, 4)}

                {/* Empty Row */}
                <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

                {/* Employee Information */}
                {renderCell('A3', false, false, false)}
                {renderCell('B3', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A4', false, false, false)}
                {renderCell('B4', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A5', false, false, false)}
                {renderCell('B5', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A6', false, false, false)}
                {renderCell('B6', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A7', false, false, false)}
                {renderCell('B7', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {/* Empty Row */}
                <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>

                {/* Earnings Section */}
                {renderCell('A9', true, false, false, 4)}

                {renderCell('A10', false, false, false)}
                {renderCell('B10', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A11', false, false, false)}
                {renderCell('B11', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A12', false, false, false)}
                {renderCell('B12', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A13', false, false, false)}
                {renderCell('B13', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A14', false, false, false)}
                {renderCell('B14', false, false, true)}
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
                {renderCell('B20', false, false, true)}
                <Cell></Cell><Cell></Cell>

                {renderCell('A21', false, false, false)}
                {renderCell('B21', false, false, true)}
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
                <p>💡 Click on any white cell to edit values. Formulas are automatically calculated.</p>
                <p>🧮 Income Tax: 15% of Gross | Social Security: 7% of Basic Salary</p>
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>
            </PayslipSheet>
          </EditorPanel>
        </Content>
      </Modal>
    </Container>
  );
};