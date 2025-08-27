import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  PayslipTemplate, 
  EmployeePayslip,
  FieldDefinition,
  SectionDefinition,
  DynamicTable
} from '../types/PayslipTypes';
import { templateManager } from '../utils/templateManager';

const Container = styled.div`
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  color: #1565c0;
  margin: 0;
  flex: 1;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#2196f3';
      case 'success': return '#4caf50';
      case 'danger': return '#f44336';
      case 'warning': return '#ff9800';
      case 'secondary': 
      default: return '#6c757d';
    }
  }};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: white;
  min-width: 200px;
`;

const MainArea = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const EmployeeList = styled.div`
  margin-top: 20px;
`;

const EmployeeItem = styled.div<{ active?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  background: ${props => props.active ? '#e3f2fd' : '#f8f9fa'};
  border: 1px solid ${props => props.active ? '#2196f3' : '#e0e0e0'};
  
  &:hover {
    background: #e3f2fd;
  }
`;

const PayslipArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const SectionContainer = styled.div<{ collapsible?: boolean; collapsed?: boolean }>`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionHeader = styled.div<{ clickable?: boolean }>`
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${props => props.clickable ? '#eeeeee' : '#f5f5f5'};
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CollapseIcon = styled.span<{ collapsed?: boolean }>`
  transform: ${props => props.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
  font-size: 18px;
  color: #666;
`;

const SectionContent = styled.div<{ collapsed?: boolean }>`
  padding: ${props => props.collapsed ? '0' : '20px'};
  max-height: ${props => props.collapsed ? '0' : 'none'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const FieldsGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.columns || 2}, 1fr)`};
  gap: 20px;
  margin-bottom: 20px;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldLabel = styled.label`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
`;

const FieldInput = styled.input<{ readonly?: boolean }>`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: ${props => props.readonly ? '#f8f9fa' : 'white'};
  color: ${props => props.readonly ? '#666' : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.readonly ? '#ddd' : '#2196f3'};
  }
`;

const CalculatedValue = styled.div`
  padding: 10px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 5px;
  font-weight: bold;
  color: #2e7d32;
`;

const TableContainer = styled.div`
  margin: 20px 0;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
`;

const TableHeader = styled.th`
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-weight: bold;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 8px 10px;
  border: 1px solid #ddd;
`;

const TableInput = styled.input`
  width: 100%;
  border: none;
  padding: 5px;
  font-size: 14px;
  
  &:focus {
    outline: 2px solid #2196f3;
    background: #f0f8ff;
  }
`;

const AddButton = styled.button`
  padding: 8px 15px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #45a049;
  }
`;

const RemoveButton = styled.button`
  padding: 5px 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #d32f2f;
  }
`;

const PrintActions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  
  @media print {
    display: none;
  }
`;

interface Props {
  analysisData?: any;
}

const AdvancedPayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [employees, setEmployees] = useState<EmployeePayslip[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayslip | null>(null);
  const [sectionStates, setSectionStates] = useState<{ [sectionId: string]: boolean }>({});

  useEffect(() => {
    // Load templates
    const allTemplates = templateManager.getAllTemplates();
    setTemplates(allTemplates);
    
    if (allTemplates.length > 0) {
      setSelectedTemplate(allTemplates[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      // Initialize section states
      const states: { [sectionId: string]: boolean } = {};
      selectedTemplate.sections.forEach(section => {
        states[section.id] = section.collapsed || false;
      });
      setSectionStates(states);
    }
  }, [selectedTemplate]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    setEmployees([]);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = () => {
    if (!selectedTemplate) return;
    
    const employeeId = `emp-${Date.now()}`;
    const employeeData: { [fieldId: string]: any } = {};
    
    // Initialize with default values
    selectedTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'text') {
          employeeData[field.id] = field.value || '';
        } else if (field.type === 'number') {
          employeeData[field.id] = field.value || 0;
        } else if (field.type === 'date') {
          employeeData[field.id] = field.value || new Date().toISOString().substr(0, 10);
        }
      });
    });

    const payslipId = templateManager.createPayslip(selectedTemplate.id, employeeId, employeeData);
    const newPayslip = templateManager.getPayslip(payslipId);
    
    if (newPayslip) {
      setEmployees(prev => [...prev, newPayslip]);
      setSelectedEmployee(newPayslip);
    }
  };

  const handleDuplicateEmployee = () => {
    if (!selectedEmployee || !selectedTemplate) return;
    
    const employeeId = `emp-${Date.now()}`;
    const payslipId = templateManager.createPayslip(selectedTemplate.id, employeeId, selectedEmployee.data);
    const newPayslip = templateManager.getPayslip(payslipId);
    
    if (newPayslip) {
      setEmployees(prev => [...prev, newPayslip]);
      setSelectedEmployee(newPayslip);
    }
  };

  const handleRemoveEmployee = (payslipId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== payslipId));
    if (selectedEmployee?.id === payslipId) {
      setSelectedEmployee(employees.find(emp => emp.id !== payslipId) || null);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!selectedEmployee) return;
    
    const updatedData = { ...selectedEmployee.data, [fieldId]: value };
    templateManager.updatePayslip(selectedEmployee.id, updatedData);
    
    // Update local state
    setSelectedEmployee(prev => prev ? { ...prev, data: updatedData } : null);
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, data: updatedData } : emp
    ));
  };

  const handleTableChange = (tableId: string, rowIndex: number, columnId: string, value: any) => {
    if (!selectedEmployee) return;
    
    const updatedTableData = { ...selectedEmployee.tableData };
    if (!updatedTableData[tableId]) {
      updatedTableData[tableId] = [];
    }
    
    if (!updatedTableData[tableId][rowIndex]) {
      updatedTableData[tableId][rowIndex] = {};
    }
    
    updatedTableData[tableId][rowIndex][columnId] = value;
    
    templateManager.updatePayslip(selectedEmployee.id, selectedEmployee.data, updatedTableData);
    
    // Update local state
    setSelectedEmployee(prev => prev ? { ...prev, tableData: updatedTableData } : null);
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, tableData: updatedTableData } : emp
    ));
  };

  const handleAddTableRow = (tableId: string) => {
    if (!selectedEmployee || !selectedTemplate) return;
    
    const table = selectedTemplate.tables.find(t => t.id === tableId);
    if (!table) return;
    
    const newRow: { [columnId: string]: any } = {};
    table.columns.forEach(col => {
      newRow[col.id] = col.type === 'number' ? 0 : '';
    });
    
    const updatedTableData = { ...selectedEmployee.tableData };
    if (!updatedTableData[tableId]) {
      updatedTableData[tableId] = [];
    }
    updatedTableData[tableId].push(newRow);
    
    templateManager.updatePayslip(selectedEmployee.id, selectedEmployee.data, updatedTableData);
    
    // Update local state
    setSelectedEmployee(prev => prev ? { ...prev, tableData: updatedTableData } : null);
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, tableData: updatedTableData } : emp
    ));
  };

  const handleRemoveTableRow = (tableId: string, rowIndex: number) => {
    if (!selectedEmployee) return;
    
    const updatedTableData = { ...selectedEmployee.tableData };
    if (updatedTableData[tableId] && updatedTableData[tableId][rowIndex]) {
      updatedTableData[tableId].splice(rowIndex, 1);
    }
    
    templateManager.updatePayslip(selectedEmployee.id, selectedEmployee.data, updatedTableData);
    
    // Update local state
    setSelectedEmployee(prev => prev ? { ...prev, tableData: updatedTableData } : null);
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, tableData: updatedTableData } : emp
    ));
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handleExportBatch = () => {
    if (!selectedTemplate || employees.length === 0) return;
    
    const batchData = {
      template: selectedTemplate,
      employees: employees,
      generatedDate: new Date().toISOString(),
      totalEmployees: employees.length
    };
    
    const dataStr = JSON.stringify(batchData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payslip_batch_${new Date().toISOString().substr(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleSection = (sectionId: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderField = (section: SectionDefinition, field: FieldDefinition) => {
    if (!selectedEmployee) return null;
    
    const value = field.type === 'formula' 
      ? selectedEmployee.calculatedValues[field.id] || 0
      : selectedEmployee.data[field.id] || field.value || '';

    return (
      <FieldContainer key={field.id}>
        <FieldLabel>{field.label}:</FieldLabel>
        {field.readonly || field.type === 'formula' ? (
          <CalculatedValue>
            {field.type === 'number' || field.type === 'formula' 
              ? `$${Number(value).toFixed(2)}` 
              : value}
          </CalculatedValue>
        ) : (
          <FieldInput
            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => {
              const newValue = field.type === 'number' 
                ? parseFloat(e.target.value) || 0 
                : e.target.value;
              handleFieldChange(field.id, newValue);
            }}
            step={field.type === 'number' ? '0.01' : undefined}
          />
        )}
      </FieldContainer>
    );
  };

  const renderTable = (table: DynamicTable) => {
    if (!selectedEmployee) return null;
    
    const tableData = selectedEmployee.tableData[table.id] || [];
    
    return (
      <TableContainer key={table.id}>
        <h4>{table.title}</h4>
        <Table>
          <thead>
            <tr>
              {table.columns.map(col => (
                <TableHeader key={col.id}>{col.header}</TableHeader>
              ))}
              {table.canRemoveRows && <TableHeader>Actions</TableHeader>}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.columns.map(col => (
                  <TableCell key={col.id}>
                    {col.readonly || col.type === 'formula' ? (
                      <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {col.type === 'number' || col.type === 'formula'
                          ? `$${Number(row[col.id] || 0).toFixed(2)}`
                          : row[col.id] || ''}
                      </span>
                    ) : (
                      <TableInput
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={row[col.id] || (col.type === 'number' ? 0 : '')}
                        onChange={(e) => {
                          const newValue = col.type === 'number'
                            ? parseFloat(e.target.value) || 0
                            : e.target.value;
                          handleTableChange(table.id, rowIndex, col.id, newValue);
                        }}
                        step={col.type === 'number' ? '0.01' : undefined}
                      />
                    )}
                  </TableCell>
                ))}
                {table.canRemoveRows && (
                  <TableCell>
                    <RemoveButton onClick={() => handleRemoveTableRow(table.id, rowIndex)}>
                      Remove
                    </RemoveButton>
                  </TableCell>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        {table.canAddRows && (
          <div style={{ marginTop: '10px' }}>
            <AddButton onClick={() => handleAddTableRow(table.id)}>
              Add Row
            </AddButton>
          </div>
        )}
      </TableContainer>
    );
  };

  return (
    <Container>
      <Header>
        <Title>Advanced Payslip Generator</Title>
        <Controls>
          <Select
            value={selectedTemplate?.id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">Select Template</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </Select>
          <Button variant="success" onClick={handleAddEmployee} disabled={!selectedTemplate}>
            Add Employee
          </Button>
          <Button variant="primary" onClick={handleDuplicateEmployee} disabled={!selectedEmployee}>
            Duplicate
          </Button>
          <Button variant="warning" onClick={handlePrintAll} disabled={employees.length === 0}>
            Print All
          </Button>
          <Button variant="secondary" onClick={handleExportBatch} disabled={employees.length === 0}>
            Export Batch
          </Button>
        </Controls>
      </Header>

      <MainArea>
        <Sidebar>
          <h3>Employees ({employees.length})</h3>
          <EmployeeList>
            {employees.map(employee => (
              <EmployeeItem
                key={employee.id}
                active={selectedEmployee?.id === employee.id}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {employee.data.emp_name || employee.data.employeeName || 'Unnamed Employee'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {employee.data.emp_id || employee.data.employeeId || 'No ID'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Net: ${Number(employee.calculatedValues.net_salary || employee.calculatedValues.netSalary || 0).toFixed(2)}
                </div>
                <RemoveButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEmployee(employee.id);
                  }}
                  style={{ marginTop: '5px', fontSize: '10px' }}
                >
                  Remove
                </RemoveButton>
              </EmployeeItem>
            ))}
            {employees.length === 0 && (
              <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No employees added yet
              </div>
            )}
          </EmployeeList>
        </Sidebar>

        <PayslipArea>
          {selectedTemplate && selectedEmployee ? (
            <>
              <PrintActions>
                <Button variant="success" onClick={() => window.print()}>
                  Print This
                </Button>
              </PrintActions>

              {selectedTemplate.sections.map(section => (
                <SectionContainer
                  key={section.id}
                  collapsible={section.collapsible}
                  collapsed={sectionStates[section.id]}
                >
                  <SectionHeader
                    clickable={section.collapsible}
                    onClick={() => section.collapsible && toggleSection(section.id)}
                  >
                    <SectionTitle>{section.title}</SectionTitle>
                    {section.collapsible && (
                      <CollapseIcon collapsed={sectionStates[section.id]}>▼</CollapseIcon>
                    )}
                  </SectionHeader>
                  <SectionContent collapsed={sectionStates[section.id]}>
                    <FieldsGrid columns={selectedTemplate.layout.columnsPerRow}>
                      {section.fields.map(field => renderField(section, field))}
                    </FieldsGrid>
                  </SectionContent>
                </SectionContainer>
              ))}

              {selectedTemplate.tables.map(table => renderTable(table))}

              <div style={{ marginTop: '30px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                <p>Generated on: {new Date().toLocaleDateString()}</p>
                <p>Template: {selectedTemplate.name} v{selectedTemplate.version}</p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              {!selectedTemplate ? (
                <div>
                  <h3>Select a Template</h3>
                  <p>Choose a template from the dropdown to get started</p>
                </div>
              ) : (
                <div>
                  <h3>Add an Employee</h3>
                  <p>Click "Add Employee" to create your first payslip</p>
                </div>
              )}
            </div>
          )}
        </PayslipArea>
      </MainArea>
    </Container>
  );
};

export default AdvancedPayslipGenerator;