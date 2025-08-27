import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { templateManager } from '../utils/templateManager';
import { employeeManager } from '../utils/employeeManager';
import { PayslipTemplate } from '../types/PayslipTypes';
import { EmployeeProfile } from '../types/EmployeeTypes';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
`;

const PayslipContainer = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin: 20px 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const CalculatedValue = styled.div`
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 3px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
`;

const Section = styled.div`
  border: 1px solid #ddd;
  margin: 15px 0;
  border-radius: 5px;
`;

const SectionHeader = styled.div`
  background-color: #f1f3f4;
  padding: 10px 15px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
`;

const SectionContent = styled.div`
  padding: 15px;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
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

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

interface PayslipData {
  // Employee Information
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  payPeriod: string;
  
  // Basic Salary Components
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    food: number;
    other: number;
  };
  
  // Overtime
  overtimeHours: number;
  overtimeRate: number;
  
  // Deductions
  tax: number;
  socialSecurity: number;
  insurance: number;
  otherDeductions: number;
  
  // Calculated Fields (read-only)
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  overtimePay: number;
}

interface Props {
  analysisData: any;
}

const PayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [payPeriod, setPayPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10)
  });
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  
  const [payslipData, setPayslipData] = useState<PayslipData>({
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'IT',
    position: 'Software Developer',
    payPeriod: new Date().toISOString().substr(0, 7), // YYYY-MM format
    
    basicSalary: 5000,
    allowances: {
      housing: 1000,
      transport: 300,
      food: 200,
      other: 100
    },
    
    overtimeHours: 10,
    overtimeRate: 25,
    
    tax: 0,
    socialSecurity: 0,
    insurance: 200,
    otherDeductions: 50,
    
    grossSalary: 0,
    totalDeductions: 0,
    netSalary: 0,
    overtimePay: 0
  });

  // Load templates and employees
  useEffect(() => {
    const loadedTemplates = templateManager.getAllTemplates();
    const loadedEmployees = employeeManager.getAllEmployees();
    setTemplates(loadedTemplates);
    setEmployees(loadedEmployees);
    
    if (loadedTemplates.length > 0) {
      setSelectedTemplate(loadedTemplates[0]);
    }
    if (loadedEmployees.length > 0) {
      setSelectedEmployee(loadedEmployees[0]);
      // Auto-fill employee data
      const emp = loadedEmployees[0];
      setPayslipData(prev => ({
        ...prev,
        employeeName: emp.personalInfo.fullName,
        employeeId: emp.employment.employeeId,
        department: emp.employment.department,
        position: emp.employment.position
      }));
    }
  }, []);

  // Calculate derived values whenever input data changes
  useEffect(() => {
    const totalAllowances = Object.values(payslipData.allowances).reduce((sum, val) => sum + val, 0);
    const overtimePay = payslipData.overtimeHours * payslipData.overtimeRate;
    const grossSalary = payslipData.basicSalary + totalAllowances + overtimePay;
    
    // Calculate tax (example: 10% of gross salary)
    const tax = grossSalary * 0.10;
    
    // Calculate social security (example: 5% of basic salary)
    const socialSecurity = payslipData.basicSalary * 0.05;
    
    const totalDeductions = tax + socialSecurity + payslipData.insurance + payslipData.otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    setPayslipData(prev => ({
      ...prev,
      overtimePay,
      grossSalary,
      tax,
      socialSecurity,
      totalDeductions,
      netSalary
    }));
  }, [
    payslipData.basicSalary,
    payslipData.allowances,
    payslipData.overtimeHours,
    payslipData.overtimeRate,
    payslipData.insurance,
    payslipData.otherDeductions
  ]);

  const handleInputChange = (field: keyof PayslipData, value: string | number) => {
    setPayslipData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllowanceChange = (allowanceType: keyof PayslipData['allowances'], value: number) => {
    setPayslipData(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [allowanceType]: value
      }
    }));
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setPayslipData(prev => ({
        ...prev,
        employeeName: employee.personalInfo.fullName,
        employeeId: employee.employment.employeeId,
        department: employee.employment.department,
        position: employee.employment.position
      }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  return (
    <Container>
      <Title>Employee Payslip Generator</Title>
      
      <ControlPanel>
        <InputGroup>
          <Label>Select Employee:</Label>
          <Select 
            value={selectedEmployee?.id || ''} 
            onChange={(e) => handleEmployeeChange(e.target.value)}
          >
            <option value="">Choose Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.personalInfo.fullName} - {emp.employment.employeeId}
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
            onChange={(e) => setPayPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
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
            onChange={(e) => setPayPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
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
      
      <PayslipContainer>
        <Section>
          <SectionHeader>Employee Information</SectionHeader>
          <SectionContent>
            <Grid>
              <InputGroup>
                <Label>Employee Name:</Label>
                <Input
                  type="text"
                  value={payslipData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Employee ID:</Label>
                <Input
                  type="text"
                  value={payslipData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Department:</Label>
                <Input
                  type="text"
                  value={payslipData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Position:</Label>
                <Input
                  type="text"
                  value={payslipData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Pay Period:</Label>
                <Input
                  type="month"
                  value={payslipData.payPeriod}
                  onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                />
              </InputGroup>
            </Grid>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>Salary Components</SectionHeader>
          <SectionContent>
            <Grid>
              <InputGroup>
                <Label>Basic Salary:</Label>
                <Input
                  type="number"
                  value={payslipData.basicSalary}
                  onChange={(e) => handleInputChange('basicSalary', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Housing Allowance:</Label>
                <Input
                  type="number"
                  value={payslipData.allowances.housing}
                  onChange={(e) => handleAllowanceChange('housing', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Transport Allowance:</Label>
                <Input
                  type="number"
                  value={payslipData.allowances.transport}
                  onChange={(e) => handleAllowanceChange('transport', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Food Allowance:</Label>
                <Input
                  type="number"
                  value={payslipData.allowances.food}
                  onChange={(e) => handleAllowanceChange('food', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Other Allowances:</Label>
                <Input
                  type="number"
                  value={payslipData.allowances.other}
                  onChange={(e) => handleAllowanceChange('other', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
            </Grid>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>Overtime</SectionHeader>
          <SectionContent>
            <Grid>
              <InputGroup>
                <Label>Overtime Hours:</Label>
                <Input
                  type="number"
                  value={payslipData.overtimeHours}
                  onChange={(e) => handleInputChange('overtimeHours', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Overtime Rate (per hour):</Label>
                <Input
                  type="number"
                  value={payslipData.overtimeRate}
                  onChange={(e) => handleInputChange('overtimeRate', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Overtime Pay:</Label>
                <CalculatedValue>${payslipData.overtimePay.toFixed(2)}</CalculatedValue>
              </InputGroup>
            </Grid>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>Deductions</SectionHeader>
          <SectionContent>
            <Grid>
              <InputGroup>
                <Label>Tax (10% of Gross):</Label>
                <CalculatedValue>${payslipData.tax.toFixed(2)}</CalculatedValue>
              </InputGroup>
              
              <InputGroup>
                <Label>Social Security (5% of Basic):</Label>
                <CalculatedValue>${payslipData.socialSecurity.toFixed(2)}</CalculatedValue>
              </InputGroup>
              
              <InputGroup>
                <Label>Insurance:</Label>
                <Input
                  type="number"
                  value={payslipData.insurance}
                  onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Other Deductions:</Label>
                <Input
                  type="number"
                  value={payslipData.otherDeductions}
                  onChange={(e) => handleInputChange('otherDeductions', parseFloat(e.target.value) || 0)}
                />
              </InputGroup>
            </Grid>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>Summary</SectionHeader>
          <SectionContent>
            <Grid>
              <InputGroup>
                <Label>Gross Salary:</Label>
                <CalculatedValue style={{ fontWeight: 'bold', fontSize: '16px', color: '#28a745' }}>
                  ${payslipData.grossSalary.toFixed(2)}
                </CalculatedValue>
              </InputGroup>
              
              <InputGroup>
                <Label>Total Deductions:</Label>
                <CalculatedValue style={{ fontWeight: 'bold', fontSize: '16px', color: '#dc3545' }}>
                  ${payslipData.totalDeductions.toFixed(2)}
                </CalculatedValue>
              </InputGroup>
              
              <InputGroup>
                <Label>Net Salary:</Label>
                <CalculatedValue style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff' }}>
                  ${payslipData.netSalary.toFixed(2)}
                </CalculatedValue>
              </InputGroup>
            </Grid>
          </SectionContent>
        </Section>
      </PayslipContainer>
    </Container>
  );
};

export default PayslipGenerator;