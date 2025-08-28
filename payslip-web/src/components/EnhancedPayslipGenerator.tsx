import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FormulaParser } from '../utils/formulaParser';
import { templateManager } from '../utils/templateManager';
import { personManager } from '../utils/personManager';
import { PayslipTemplate } from '../types/PayslipTypes';
import { PersonProfile, PERSON_TYPE_CONFIG } from '../types/PersonTypes';
import '../styles/print.css';

const Container = styled.div`
  padding: 20px;
  font-family: 'Calibri', Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
`;

const PayslipSheet = styled.div`
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  
  @media print {
    border: none;
    border-radius: 0;
    box-shadow: none;
    margin: 0;
    padding: 20px;
  }
`;

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

// Removed unused Title component

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
  
  @media print {
    display: none;
  }
`;

const ControlPanel = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
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

const Title = styled.h2`
  text-align: center;
  color: #1565c0;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
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
  
  @media print {
    display: none;
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

interface Props {
  analysisData?: any;
}

const EnhancedPayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [payPeriod, setPayPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10)
  });
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');

  const [payslipData, setPayslipData] = useState<PayslipState>({
    // Headers and Labels
    A1: "EMPLOYEE PAYSLIP",
    A3: "Employee Name:",
    B3: "John Doe",
    A4: "Employee ID:",
    B4: "EMP001",
    A5: "Department:",
    B5: "Information Technology",
    A6: "Position:",
    B6: "Software Developer",
    A7: "Pay Period:",
    B7: new Date().toISOString().substr(0, 7),
    
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

  // Load templates and persons
  useEffect(() => {
    const loadedTemplates = templateManager.getAllTemplates();
    const loadedPersons = personManager.getAllPersons();
    setTemplates(loadedTemplates);
    setPersons(loadedPersons);
    
    if (loadedTemplates.length > 0) {
      setSelectedTemplate(loadedTemplates[0]);
    }
    if (loadedPersons.length > 0) {
      setSelectedPerson(loadedPersons[0]);
      // Auto-fill person data
      const person = loadedPersons[0];
      setPayslipData(prev => ({
        ...prev,
        B3: person.personalInfo.fullName,
        B4: person.workInfo.personId,
        B5: person.workInfo.department || 'N/A',
        B6: person.workInfo.position || person.workInfo.title || 'N/A'
      }));
    }
  }, []);

  const handlePersonChange = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
      setPayslipData(prev => ({
        ...prev,
        B3: person.personalInfo.fullName,
        B4: person.workInfo.personId,
        B5: person.workInfo.department || 'N/A',
        B6: person.workInfo.position || person.workInfo.title || 'N/A'
      }));
    }
  };

  const filteredPersons = selectedPersonType === 'all' 
    ? persons 
    : persons.filter(person => person.type === selectedPersonType);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleCellChange = (cellRef: string, value: string | number) => {
    setPayslipData(prev => ({
      ...prev,
      [cellRef]: value
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(payslipData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payslip_${payslipData.B4}_${payslipData.B7}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
    <Container>
      <Title>Excel-Style Payslip Generator</Title>
      
      <ControlPanel>
        <InputGroup>
          <Label>Person Type Filter:</Label>
          <Select 
            value={selectedPersonType} 
            onChange={(e) => setSelectedPersonType(e.target.value as any)}
          >
            <option value="all">🌟 All Types</option>
            {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => (
              <option key={type} value={type}>
                {config.icon} {config.label}s
              </option>
            ))}
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label>Select Person:</Label>
          <Select 
            value={selectedPerson?.id || ''} 
            onChange={(e) => handlePersonChange(e.target.value)}
          >
            <option value="">Choose Person...</option>
            {filteredPersons.map(person => (
              <option key={person.id} value={person.id}>
                {PERSON_TYPE_CONFIG[person.type].icon} {person.personalInfo.fullName} - {person.workInfo.personId} ({PERSON_TYPE_CONFIG[person.type].label})
              </option>
            ))}
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label>Select Template:</Label>
          <Select 
            value={selectedTemplate?.id || ''} 
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">Choose Template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.type})
              </option>
            ))}
          </Select>
        </InputGroup>

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
      </ControlPanel>

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
          <p>This payslip is computer generated and does not require signature.</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </PayslipSheet>
    </Container>
  );
};

export default EnhancedPayslipGenerator;