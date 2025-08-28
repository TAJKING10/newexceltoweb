import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { templateManager } from '../utils/templateManager';
import { personManager } from '../utils/personManager';
import { PayslipTemplate } from '../types/PayslipTypes';
import { PersonProfile, PERSON_TYPE_CONFIG } from '../types/PersonTypes';
import '../styles/print.css';

const Container = styled.div`
  padding: 20px;
  font-family: 'Calibri', Arial, sans-serif;
  max-width: 100%;
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
  overflow-x: auto;
  
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
  grid-template-columns: 200px repeat(12, 120px) 140px;
  gap: 1px;
  background-color: #e5e5e5;
  border: 1px solid #ccc;
  margin: 20px 0;
  min-width: 1800px;
`;

const Cell = styled.div<{ 
  isHeader?: boolean; 
  isCalculated?: boolean; 
  isEditable?: boolean;
  colSpan?: number;
  isTotal?: boolean;
}>`
  background-color: ${props => 
    props.isHeader ? '#4472c4' : 
    props.isTotal ? '#ffd700' :
    props.isCalculated ? '#f2f2f2' : 
    props.isEditable ? 'white' : '#fafafa'
  };
  color: ${props => props.isHeader || props.isTotal ? 'white' : '#333'};
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: ${props => props.isHeader ? '12px' : '14px'};
  font-weight: ${props => props.isHeader || props.isCalculated || props.isTotal ? 'bold' : 'normal'};
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.isHeader ? 'center' : 'flex-start'};
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
  text-align: center;
  
  &:focus {
    outline: 2px solid #1976d2;
    background-color: white;
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
  
  @media print {
    display: none;
  }
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

const Title = styled.h2`
  text-align: center;
  color: #1565c0;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
`;

interface Props {
  analysisData?: any;
}

interface MonthlyPayslipState {
  [key: string]: any;
  // Person Info
  personName: string;
  personId: string;
  department: string;
  position: string;
  year: number;
  
  // Monthly data structure
  months: {
    [monthIndex: number]: {
      basicSalary: number;
      housingAllowance: number;
      transportAllowance: number;
      overtimePay: number;
      bonus: number;
      grossSalary: number;
      incomeTax: number;
      socialSecurity: number;
      healthInsurance: number;
      totalDeductions: number;
      netSalary: number;
    };
  };
  
  // Annual totals
  totals: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    overtimePay: number;
    bonus: number;
    grossSalary: number;
    incomeTax: number;
    socialSecurity: number;
    healthInsurance: number;
    totalDeductions: number;
    netSalary: number;
  };
}

const MonthlyPayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [persons, setPersons] = useState<PersonProfile[]>([]);

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const [payslipData, setPayslipData] = useState<MonthlyPayslipState>({
    personName: 'John Doe',
    personId: 'EMP001',
    department: 'IT Department',
    position: 'Software Engineer',
    year: new Date().getFullYear(),
    months: {},
    totals: {
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      overtimePay: 0,
      bonus: 0,
      grossSalary: 0,
      incomeTax: 0,
      socialSecurity: 0,
      healthInsurance: 0,
      totalDeductions: 0,
      netSalary: 0
    }
  });

  // Initialize monthly data with default values
  useEffect(() => {
    const initialMonths: any = {};
    for (let i = 0; i < 12; i++) {
      initialMonths[i] = {
        basicSalary: 5000,
        housingAllowance: 1000,
        transportAllowance: 500,
        overtimePay: 200,
        bonus: 300,
        grossSalary: 7000,
        incomeTax: 1050,
        socialSecurity: 350,
        healthInsurance: 200,
        totalDeductions: 1600,
        netSalary: 5400
      };
    }
    setPayslipData(prev => ({ ...prev, months: initialMonths }));
  }, []);

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
      const person = loadedPersons[0];
      setPayslipData(prev => ({
        ...prev,
        personName: person.personalInfo.fullName,
        personId: person.workInfo.personId,
        department: person.workInfo.department || 'N/A',
        position: person.workInfo.position || person.workInfo.title || 'N/A'
      }));
    }
  }, []);

  // Calculate totals whenever monthly data changes
  useEffect(() => {
    const months = payslipData.months;
    const totals = {
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      overtimePay: 0,
      bonus: 0,
      grossSalary: 0,
      incomeTax: 0,
      socialSecurity: 0,
      healthInsurance: 0,
      totalDeductions: 0,
      netSalary: 0
    };

    Object.values(months).forEach((month: any) => {
      totals.basicSalary += month.basicSalary;
      totals.housingAllowance += month.housingAllowance;
      totals.transportAllowance += month.transportAllowance;
      totals.overtimePay += month.overtimePay;
      totals.bonus += month.bonus;
      totals.grossSalary += month.grossSalary;
      totals.incomeTax += month.incomeTax;
      totals.socialSecurity += month.socialSecurity;
      totals.healthInsurance += month.healthInsurance;
      totals.totalDeductions += month.totalDeductions;
      totals.netSalary += month.netSalary;
    });

    setPayslipData(prev => ({ ...prev, totals }));
  }, [payslipData.months]);

  const handlePersonChange = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
      setPayslipData(prev => ({
        ...prev,
        personName: person.personalInfo.fullName,
        personId: person.workInfo.personId,
        department: person.workInfo.department || 'N/A',
        position: person.workInfo.position || person.workInfo.title || 'N/A'
      }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const filteredPersons = selectedPersonType === 'all' 
    ? persons 
    : persons.filter(person => person.type === selectedPersonType);

  const handleMonthlyValueChange = (monthIndex: number, field: string, value: number) => {
    setPayslipData(prev => {
      const newMonths = { ...prev.months };
      const month = { ...newMonths[monthIndex] };
      (month as any)[field] = value;
      
      // Recalculate dependent values
      month.grossSalary = month.basicSalary + month.housingAllowance + month.transportAllowance + month.overtimePay + month.bonus;
      month.incomeTax = Math.round(month.grossSalary * 0.15);
      month.socialSecurity = Math.round(month.basicSalary * 0.07);
      month.totalDeductions = month.incomeTax + month.socialSecurity + month.healthInsurance;
      month.netSalary = month.grossSalary - month.totalDeductions;
      
      newMonths[monthIndex] = month;
      return { ...prev, months: newMonths };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(payslipData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `annual_payslip_${payslipData.personId}_${payslipData.year}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderMonthlyRow = (rowLabel: string, field: keyof typeof payslipData.months[0], isEditable: boolean = true) => {
    const months = payslipData.months;
    const total = payslipData.totals[field as keyof typeof payslipData.totals];
    
    return (
      <>
        <Cell>{rowLabel}</Cell>
        {monthNames.map((_, monthIndex) => (
          <Cell key={monthIndex} isEditable={isEditable}>
            {isEditable ? (
              <CellInput
                type="number"
                value={months[monthIndex]?.[field] || 0}
                onChange={(e) => handleMonthlyValueChange(monthIndex, field, parseFloat(e.target.value) || 0)}
              />
            ) : (
              (months[monthIndex]?.[field] || 0).toLocaleString()
            )}
          </Cell>
        ))}
        <Cell isTotal>{total.toLocaleString()}</Cell>
      </>
    );
  };

  return (
    <Container>
      <Title>📊 Annual Payslip Summary</Title>
      
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
          <Label>Year:</Label>
          <Select 
            value={selectedYear} 
            onChange={(e) => {
              const year = parseInt(e.target.value);
              setSelectedYear(year);
              setPayslipData(prev => ({ ...prev, year }));
            }}
          >
            {Array.from({length: 10}, (_, i) => (
              <option key={2020 + i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </Select>
        </InputGroup>
      </ControlPanel>

      <PayslipSheet>
        <SaveButton onClick={handleSave}>💾 Save Data</SaveButton>
        <PrintButton onClick={handlePrint}>🖨️ Print</PrintButton>
        
        <ExcelGrid>
          {/* Title Row */}
          <Cell isHeader colSpan={14}>
            📊 ANNUAL PAYSLIP SUMMARY - {payslipData.year}
          </Cell>

          {/* Person Info */}
          <Cell>Person Name:</Cell>
          <Cell colSpan={5}>{payslipData.personName}</Cell>
          <Cell>Person ID:</Cell>
          <Cell colSpan={3}>{payslipData.personId}</Cell>
          <Cell>Department:</Cell>
          <Cell colSpan={3}>{payslipData.department}</Cell>

          <Cell>Position:</Cell>
          <Cell colSpan={5}>{payslipData.position}</Cell>
          <Cell>Year:</Cell>
          <Cell colSpan={7}>{payslipData.year}</Cell>

          {/* Month Headers */}
          <Cell isHeader>EARNINGS</Cell>
          {monthNames.map(month => (
            <Cell key={month} isHeader>{month}</Cell>
          ))}
          <Cell isHeader isTotal>TOTAL</Cell>

          {/* Monthly Earnings */}
          {renderMonthlyRow('Basic Salary', 'basicSalary')}
          {renderMonthlyRow('Housing Allowance', 'housingAllowance')}
          {renderMonthlyRow('Transport Allowance', 'transportAllowance')}
          {renderMonthlyRow('Overtime Pay', 'overtimePay')}
          {renderMonthlyRow('Bonus', 'bonus')}
          {renderMonthlyRow('GROSS SALARY', 'grossSalary', false)}

          {/* Deductions Header */}
          <Cell isHeader>DEDUCTIONS</Cell>
          {monthNames.map(month => (
            <Cell key={month} isHeader>{month}</Cell>
          ))}
          <Cell isHeader isTotal>TOTAL</Cell>

          {/* Monthly Deductions */}
          {renderMonthlyRow('Income Tax (15%)', 'incomeTax', false)}
          {renderMonthlyRow('Social Security (7%)', 'socialSecurity', false)}
          {renderMonthlyRow('Health Insurance', 'healthInsurance')}
          {renderMonthlyRow('TOTAL DEDUCTIONS', 'totalDeductions', false)}

          {/* Net Salary */}
          <Cell isHeader>NET SALARY</Cell>
          {monthNames.map(month => (
            <Cell key={month} isHeader>{month}</Cell>
          ))}
          <Cell isHeader isTotal>TOTAL</Cell>
          
          {renderMonthlyRow('NET SALARY', 'netSalary', false)}
        </ExcelGrid>
      </PayslipSheet>
    </Container>
  );
};

export default MonthlyPayslipGenerator;