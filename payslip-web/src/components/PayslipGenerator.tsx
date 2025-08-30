import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { personManager } from '../utils/personManager';
import { templateSync } from '../utils/templateSync';
import { viewSync } from '../utils/viewSync';
import { dataSync } from '../utils/dataSync';
import { PayslipTemplate, SectionDefinition, FieldDefinition } from '../types/PayslipTypes';
import { PersonProfile, PERSON_TYPE_CONFIG } from '../types/PersonTypes';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
`;

const PayslipContainer = styled.div`
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  position: relative;
  
  @media print {
    border: none;
    border-radius: 0;
    box-shadow: none;
    margin: 0;
    padding: 20px;
  }
`;

const EditModeToggle = styled.button<{ isActive: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background-color: ${props => props.isActive ? '#ff9800' : '#4caf50'};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  z-index: 10;
  
  &:hover {
    background-color: ${props => props.isActive ? '#f57c00' : '#45a049'};
  }
`;

const TemplateEditor = styled.div`
  background-color: #f8f9fa;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionEditor = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const FieldEditor = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
`;

const HeaderEditor = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.columns || 2}, 1fr)`};
  gap: 15px;
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
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  
  &:hover {
    background-color: #1565c0;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #f44336;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const CalculatedValue = styled.div`
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
`;

const Section = styled.div<{ borderColor?: string; backgroundColor?: string }>`
  border: 2px solid ${props => props.borderColor || '#ddd'};
  margin: 20px 0;
  border-radius: 8px;
  background-color: ${props => props.backgroundColor || 'white'};
`;

const SectionHeader = styled.div<{ textColor?: string; backgroundColor?: string }>`
  background-color: ${props => props.backgroundColor || '#f1f3f4'};
  color: ${props => props.textColor || '#333'};
  padding: 15px 20px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionContent = styled.div`
  padding: 20px;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
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

interface Props {
  analysisData?: any;
}

interface CustomPayslipData {
  [fieldId: string]: any;
  header: {
    title: string;
    subtitle: string;
    companyInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
  };
  subHeaders: Array<{
    id: string;
    sections: Array<{
      id: string;
      label: string;
      value: string;
    }>;
  }>;
}

const PayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [editMode, setEditMode] = useState(false);

  const [payslipData, setPayslipData] = useState<CustomPayslipData>({
    header: {
      title: 'PAYSLIP',
      subtitle: 'Employee Pay Statement',
      companyInfo: {
        name: 'Universal Company Ltd.',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'hr@company.com'
      }
    },
    subHeaders: [
      {
        id: 'info-header',
        sections: [
          { id: 'period', label: 'Pay Period', value: `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` },
          { id: 'date', label: 'Pay Date', value: new Date().toLocaleDateString() },
          { id: 'method', label: 'Payment Method', value: 'Direct Deposit' }
        ]
      }
    ]
  });

  const [calculatedValues, setCalculatedValues] = useState<{ [fieldId: string]: number }>({});

  // Safe array utility
  const safeArray = useCallback(<T,>(arr: T[] | undefined | null): T[] => {
    return Array.isArray(arr) ? arr : [];
  }, []);

  // Force create essential templates for Basic View
  const createBasicViewTemplates = useCallback(() => {
    const basicTemplate: PayslipTemplate = {
      id: 'basic-view-template',
      name: '📝 Basic Payslip Template',
      version: '1.0',
      description: 'Simple monthly payslip template - perfect for basic payslips',
      type: 'basic',
      compatibleViews: ['basic', 'excel'],
      header: {
        id: 'basic-header',
        title: 'PAYSLIP',
        subtitle: 'Employee Pay Statement',
        companyInfo: {
          name: 'Universal Company Ltd.',
          address: '123 Business Street, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'hr@company.com'
        }
      },
      subHeaders: [{
        id: 'basic-subheader',
        sections: [
          { id: 'pay-period', label: 'Pay Period', value: 'January 2025', type: 'text', editable: true },
          { id: 'pay-date', label: 'Pay Date', value: new Date().toLocaleDateString(), type: 'date', editable: true },
          { id: 'pay-method', label: 'Payment Method', value: 'Direct Deposit', type: 'text', editable: true },
          { id: 'generated-date', label: 'Generated on', value: new Date().toLocaleDateString(), type: 'text', editable: false }
        ]
      }],
      sections: [
        {
          id: 'employee-info',
          title: 'Employee Information',
          type: 'static',
          fields: [
            { id: 'emp_name', label: 'Employee Name', type: 'text', required: true },
            { id: 'emp_id', label: 'Employee ID', type: 'text', required: true },
            { id: 'department', label: 'Department', type: 'text' },
            { id: 'position', label: 'Position', type: 'text' }
          ],
          canAddFields: true,
          canRemove: false
        }
      ],
      tables: [],
      globalFormulas: {},
      styling: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        primaryColor: '#1565c0',
        secondaryColor: '#f5f5f5',
        borderStyle: 'solid'
      },
      layout: {
        columnsPerRow: 2,
        sectionSpacing: 15,
        printOrientation: 'portrait'
      },
      isEditable: true,
      createdDate: new Date(),
      lastModified: new Date()
    };

    const advancedTemplate: PayslipTemplate = {
      id: 'advanced-view-template',
      name: '⚡ Advanced Payslip Template',
      version: '1.0',
      description: 'Comprehensive advanced payslip template with detailed sections',
      type: 'advanced',
      compatibleViews: ['basic', 'excel'],
      header: {
        id: 'advanced-header',
        title: 'ADVANCED PAYROLL STATEMENT',
        subtitle: 'Comprehensive Employee Pay Analysis',
        companyInfo: {
          name: 'Advanced Analytics Corp.',
          address: '456 Advanced Drive, Tech City, State 67890',
          phone: '+1 (555) 999-8888',
          email: 'advanced@company.com'
        }
      },
      subHeaders: [{
        id: 'advanced-subheader',
        sections: [
          { id: 'pay-period', label: 'Pay Period', value: 'January 2025', type: 'text', editable: true },
          { id: 'pay-date', label: 'Pay Date', value: new Date().toLocaleDateString(), type: 'date', editable: true },
          { id: 'pay-method', label: 'Payment Method', value: 'Direct Deposit', type: 'text', editable: true },
          { id: 'report-type', label: 'Report Type', value: 'Advanced Analysis', type: 'text', editable: true },
          { id: 'generated-date', label: 'Generated on', value: new Date().toLocaleDateString(), type: 'text', editable: false }
        ]
      }],
      sections: [
        {
          id: 'employee-details',
          title: 'Employee Details',
          type: 'static',
          fields: [
            { id: 'emp_name', label: 'Full Name', type: 'text', required: true },
            { id: 'emp_id', label: 'Employee ID', type: 'text', required: true },
            { id: 'department', label: 'Department', type: 'text' },
            { id: 'position', label: 'Position', type: 'text' },
            { id: 'hire_date', label: 'Hire Date', type: 'date' },
            { id: 'emp_status', label: 'Employment Status', type: 'text' }
          ],
          canAddFields: true,
          canRemove: false
        }
      ],
      tables: [],
      globalFormulas: {},
      styling: {
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 14,
        primaryColor: '#6a1b9a',
        secondaryColor: '#f3e5f5',
        borderStyle: 'solid'
      },
      layout: {
        columnsPerRow: 3,
        sectionSpacing: 20,
        printOrientation: 'portrait'
      },
      isEditable: true,
      createdDate: new Date(),
      lastModified: new Date()
    };

    return [basicTemplate, advancedTemplate];
  }, []);

  // Load templates and persons using unified sync service
  useEffect(() => {
    try {
      console.log('📝 Basic View: Loading templates via TemplateSync');
      
      // Load templates from unified sync service
      const loadedTemplates = templateSync.getAllTemplates();
      const loadedPersons = personManager.getAllPersons();
      
      setTemplates(safeArray(loadedTemplates));
      setPersons(safeArray(loadedPersons));
      
      // Debug: Log templates found
      console.log(`✅ Basic View: Loaded ${loadedTemplates.length} synchronized templates`);
      loadedTemplates.forEach((template: any) => {
        console.log(`  - ${template.type === 'basic' ? '📝' : '⚡'} ${template.name} (${template.type}) - Compatible with: ${template.compatibleViews?.join(', ') || 'basic'}`);
      });
      
      // Default to basic template that works in both views
      const basicTemplate = loadedTemplates.find(t => t.type === 'basic' && t.compatibleViews?.includes('basic'));
      if (basicTemplate) {
        setSelectedTemplate(basicTemplate);
        initializeFromTemplate(basicTemplate);
        console.log('✅ Basic View: Default template set to:', basicTemplate.name);
      } else if (safeArray(loadedTemplates).length > 0) {
        setSelectedTemplate(loadedTemplates[0]);
        initializeFromTemplate(loadedTemplates[0]);
        console.log('✅ Basic View: Default template set to:', loadedTemplates[0].name);
      }
      
      if (safeArray(loadedPersons).length > 0) {
        setSelectedPerson(loadedPersons[0]);
        populatePersonData(loadedPersons[0]);
      }

      // Subscribe to template changes from other views
      const unsubscribeTemplateSync = templateSync.subscribe(() => {
        console.log('📝 Basic View: Received template sync notification');
        const updatedTemplates = templateSync.getAllTemplates();
        setTemplates(safeArray(updatedTemplates));
        console.log(`🔄 Basic View: Updated with ${updatedTemplates.length} templates`);
      });

      // Subscribe to cross-view selection changes
      const unsubscribeViewSync = viewSync.onTemplateChange((templateId) => {
        if (templateId) {
          const template = loadedTemplates.find(t => t.id === templateId);
          if (template && (!selectedTemplate || selectedTemplate.id !== templateId)) {
            console.log('📝 Basic View: Received cross-view template selection:', template.name);
            setSelectedTemplate(template);
            initializeFromTemplate(template);
          }
        }
      });

      const unsubscribePersonSync = viewSync.onPersonChange((personId) => {
        if (personId) {
          const person = loadedPersons.find(p => p.id === personId);
          if (person && (!selectedPerson || selectedPerson.id !== personId)) {
            console.log('📝 Basic View: Received cross-view person selection:', person.personalInfo?.fullName);
            setSelectedPerson(person);
            handlePersonChange(personId);
          }
        }
      });

      const unsubscribePersonTypeSync = viewSync.onPersonTypeChange((personType) => {
        if (personType !== selectedPersonType) {
          console.log('📝 Basic View: Received cross-view person type selection:', personType);
          setSelectedPersonType(personType as any);
        }
      });

      // Set initial selections from viewSync
      const syncedTemplateId = viewSync.getSelectedTemplate();
      if (syncedTemplateId) {
        const syncedTemplate = loadedTemplates.find(t => t.id === syncedTemplateId);
        if (syncedTemplate) {
          setSelectedTemplate(syncedTemplate);
          initializeFromTemplate(syncedTemplate);
          console.log('📝 Basic View: Applied synced template:', syncedTemplate.name);
        }
      }

      const syncedPersonId = viewSync.getSelectedPerson();
      if (syncedPersonId) {
        const syncedPerson = loadedPersons.find(p => p.id === syncedPersonId);
        if (syncedPerson) {
          setSelectedPerson(syncedPerson);
          handlePersonChange(syncedPersonId);
          console.log('📝 Basic View: Applied synced person:', syncedPerson.personalInfo?.fullName);
        }
      }

      const syncedPersonType = viewSync.getSelectedPersonType();
      if (syncedPersonType !== 'all') {
        setSelectedPersonType(syncedPersonType as any);
        console.log('📝 Basic View: Applied synced person type:', syncedPersonType);
      }

      // Subscribe to data synchronization changes from Excel View
      const unsubscribeDataSync = dataSync.subscribe((templateId, personId) => {
        // Only reload if it's for the currently selected template/person
        if (selectedTemplate?.id === templateId && selectedPerson?.id === personId) {
          const syncedData = dataSync.loadData(templateId, personId);
          if (syncedData) {
            console.log('📂 Basic View: Received synchronized data from Excel View');
            setPayslipData(syncedData);
          }
        }
      });
      
      return () => {
        unsubscribeTemplateSync();
        unsubscribeViewSync();
        unsubscribePersonSync();
        unsubscribePersonTypeSync();
        unsubscribeDataSync();
      };
    } catch (error) {
      console.error('Error loading Basic View data:', error);
    }
  }, [safeArray]);

  // Initialize template with synchronized data
  const initializeFromTemplate = (template: PayslipTemplate, person?: PersonProfile) => {
    // First, try to load existing synchronized data
    const existingSyncedData = dataSync.loadData(template.id, person?.id);
    
    if (existingSyncedData) {
      console.log(`📂 Basic View: Loading existing synced data for template ${template.name}`);
      setPayslipData(existingSyncedData);
      return;
    }
    
    // If no synced data exists, create fresh template data
    const newData: any = {};
    
    // Initialize header from template (personalized if person provided)
    if (template.header) {
      newData.header = {
        title: person ? `${template.header.title || 'PAYSLIP'} - ${person.personalInfo?.fullName || 'Employee'}` : (template.header.title || 'PAYSLIP'),
        subtitle: person ? `${PERSON_TYPE_CONFIG[person.type]?.label || person.type} Pay Statement` : (template.header.subtitle || 'Pay Statement'),
        companyInfo: {
          name: template.header.companyInfo?.name || 'Universal Company Ltd.',
          address: template.header.companyInfo?.address || '123 Business Street, City, State 12345',
          phone: template.header.companyInfo?.phone || '+1 (555) 123-4567',
          email: template.header.companyInfo?.email || 'hr@company.com'
        }
      };
    }

    // Initialize subheaders from template (personalized)
    if (template.subHeaders) {
      newData.subHeaders = safeArray(template.subHeaders).map(sh => ({
        id: sh.id,
        sections: safeArray(sh.sections).map(s => ({
          id: s.id,
          label: s.label,
          value: s.value || ''
        }))
      }));
    } else {
      // Default subheaders with personalization
      newData.subHeaders = [
        {
          id: 'info-header',
          sections: [
            { id: 'period', label: 'Pay Period', value: 'January 2025' },
            { id: 'date', label: 'Pay Date', value: new Date().toLocaleDateString() },
            { id: 'method', label: 'Payment Method', value: 'Direct Deposit' },
            ...(person ? [{ id: 'type', label: 'Person Type', value: PERSON_TYPE_CONFIG[person.type]?.label || person.type }] : [])
          ]
        }
      ];
    }
    
    // Initialize fields from template sections - everything starts FRESH at 0
    safeArray(template.sections).forEach(section => {
      safeArray(section.fields).forEach(field => {
        // Start all values fresh (0 for numbers, empty for text)
        if (field.type === 'number') {
          newData[field.id] = 0; // All numbers start at 0
        } else {
          newData[field.id] = ''; // All text fields start empty
        }
      });
    });
    
    setPayslipData(newData);
    
    // Save this fresh data as the initial synchronized state
    dataSync.saveData(template.id, newData, person?.id);
    console.log(`💾 Basic View: Saved fresh template data for ${template.name}`);
  };

  // Populate ONLY editable common person data (rest stays at 0/empty)
  const populatePersonData = (person: PersonProfile) => {
    setPayslipData(prev => ({
      ...prev,
      // Pre-populate common editable fields from person data
      employeeName: person.personalInfo?.fullName || '',
      employeeId: person.workInfo?.personId || '',
      department: person.workInfo?.department || '',
      position: person.workInfo?.position || person.workInfo?.title || '',
      email: person.personalInfo?.email || '',
      phone: person.personalInfo?.phone || '',
      // Keep financial fields at 0 for fresh start
      basicSalary: 0,
      allowances: 0,
      overtime: 0,
      bonus: 0,
      deductions: 0,
      tax: 0,
      netSalary: 0,
      grossSalary: 0,
      taxClass: 1,
      hasChildren: false
    }));
  };

  // Filtered persons based on type
  const filteredPersons = React.useMemo(() => {
    const safePeople = safeArray(persons);
    return selectedPersonType === 'all' 
      ? safePeople 
      : safePeople.filter(person => person && person.type === selectedPersonType);
  }, [selectedPersonType, persons, safeArray]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      initializeFromTemplate(template);
    }
  };

  // Handle person selection - create fresh personalized payslip
  const handlePersonChange = (personId: string) => {
    const person = safeArray(filteredPersons).find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
      
      // Re-initialize template with personalization if template is selected
      if (selectedTemplate) {
        initializeFromTemplate(selectedTemplate, person);
      }
      
      // Populate common editable fields only
      populatePersonData(person);
      
      // Try to load existing personalized payslip for this person
      loadPersonalizedPayslip(person.id);
    }
  };

  // Load personalized payslip if exists
  const loadPersonalizedPayslip = (personId: string) => {
    try {
      const savedPayslip = localStorage.getItem(`basic-payslip-${personId}`);
      if (savedPayslip) {
        const parsedPayslip = JSON.parse(savedPayslip);
        setPayslipData(parsedPayslip);
      }
    } catch (error) {
      console.error('Error loading personalized payslip:', error);
    }
  };

  // Handle field value change with data synchronization
  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = {
      ...payslipData,
      [fieldId]: value
    };
    
    setPayslipData(newData);
    
    // Synchronize data across views
    if (selectedTemplate) {
      dataSync.saveData(selectedTemplate.id, newData, selectedPerson?.id);
      console.log(`🔄 Basic View: Data synced for field ${fieldId} in template ${selectedTemplate.name}`);
    }
  };

  // Luxembourg tax calculations for Basic View - Enhanced version
  useEffect(() => {
    if (!selectedTemplate) return;
    
    const newCalculatedValues: { [fieldId: string]: number } = {};
    
    // Enhanced gross salary calculation - ALL 5 COMPONENTS as requested
    // Calculate from the 5 main components as requested - check both underscore and camelCase versions
    const basicSalary = payslipData.basic_salary || payslipData.basicSalary || payslipData.basic || payslipData.salary || payslipData.basePay || 0;
    const allowances = payslipData.allowances || payslipData.allowance || payslipData.benefits || 0;
    const overtime = payslipData.overtime || payslipData.overtimePay || payslipData.extraHours || 0;
    const bonus = payslipData.bonus || payslipData.bonuses || payslipData.incentives || 0;
    const commission = payslipData.commission || payslipData.commissions || 0;
    
    // DEBUG: Log individual component values
    console.log('🔍 DEBUG: Individual components:', {
      basicSalary: basicSalary,
      allowances: allowances,
      overtime: overtime,
      bonus: bonus,
      commission: commission,
      payslipDataKeys: Object.keys(payslipData),
      payslipDataValues: payslipData
    });
    
    // Sum ALL 5 components for total gross salary
    const grossSalary = basicSalary + allowances + overtime + bonus + commission;
    console.log('🔍 DEBUG: Calculated gross salary:', grossSalary);
    
    console.log(`🇱🇺 Basic View: Enhanced calculation - Gross salary: €${grossSalary.toFixed(2)} (Basic: €${payslipData.basic_salary || payslipData.basicSalary || 0}, Allowances: €${payslipData.allowances || 0}, Overtime: €${payslipData.overtime || 0}, Bonus: €${payslipData.bonus || 0}, Commission: €${payslipData.commission || 0})`);
    
    if (grossSalary > 0) {
      // Import and calculate Luxembourg taxes
      import('../utils/luxembourgTaxCalculator').then(({ LuxembourgTaxCalculator }) => {
        try {
          const taxResult = LuxembourgTaxCalculator.calculate({
            monthlyGrossSalary: grossSalary,
            taxClass: (payslipData.taxClass || 1) as 1 | 2,
            hasChildren: payslipData.hasChildren || false,
            isOver65: false
          });
          
          const employerContributions = LuxembourgTaxCalculator.calculateEmployerContributions(grossSalary);
          
          // Enhanced other deductions calculation
          const otherDeductions = payslipData.deductions || payslipData.otherDeductions || payslipData.miscDeductions || 0;
          
          // Calculate all Luxembourg tax values with improved precision
          const calculatedTaxValues = {
            grossSalary: Math.round(grossSalary * 100) / 100,
            incomeTax: Math.round(taxResult.incomeTax * 100) / 100,
            socialSecurityTotal: Math.round(taxResult.socialSecurity.total * 100) / 100,
            sicknessInsurance: Math.round(taxResult.socialSecurity.sickness * 100) / 100,
            pensionContribution: Math.round(taxResult.socialSecurity.pension * 100) / 100,
            dependencyInsurance: Math.round(taxResult.socialSecurity.dependency * 100) / 100,
            totalDeductions: Math.round((taxResult.incomeTax + taxResult.socialSecurity.total + otherDeductions) * 100) / 100,
            netSalary: Math.round((grossSalary - (taxResult.incomeTax + taxResult.socialSecurity.total + otherDeductions)) * 100) / 100,
            employerCost: Math.round((grossSalary + employerContributions.total) * 100) / 100
          };
          
          console.log(`✅ Basic View: Luxembourg taxes calculated - Income Tax: €${calculatedTaxValues.incomeTax}, Social Security: €${calculatedTaxValues.socialSecurityTotal}, Net: €${calculatedTaxValues.netSalary}`);
          
          // Update payslip data with calculated values - sync with main data (both field name formats)
          setPayslipData(prev => ({
            ...prev,
            gross_pay: calculatedTaxValues.grossSalary, // underscore version for template
            grossSalary: calculatedTaxValues.grossSalary, // camelCase version for backwards compatibility
            tax: calculatedTaxValues.incomeTax,
            incomeTax: calculatedTaxValues.incomeTax,
            socialSecurity: calculatedTaxValues.socialSecurityTotal,
            socialSecurityTotal: calculatedTaxValues.socialSecurityTotal,
            sickness: calculatedTaxValues.sicknessInsurance,
            sicknessInsurance: calculatedTaxValues.sicknessInsurance,
            pension: calculatedTaxValues.pensionContribution,
            pensionContribution: calculatedTaxValues.pensionContribution,
            dependency: calculatedTaxValues.dependencyInsurance,
            dependencyInsurance: calculatedTaxValues.dependencyInsurance,
            totalDeductions: calculatedTaxValues.totalDeductions,
            netSalary: calculatedTaxValues.netSalary,
            employerCost: calculatedTaxValues.employerCost
          }));
          
          // Enhanced field mapping - covers more field label variations
          safeArray(selectedTemplate.sections).forEach(section => {
            safeArray(section.fields).forEach(field => {
              const fieldLabel = field.label.toLowerCase().trim();
              
              // Gross Salary matching - check both Luxembourg tax calculated value AND our component sum
              if (fieldLabel.includes('gross salary') || fieldLabel.includes('total earnings') || fieldLabel.includes('gross pay') || fieldLabel.includes('total pay') || fieldLabel.includes('brutto')) {
                // Use our calculated gross salary (sum of 5 components) instead of tax calculator value
                newCalculatedValues[field.id] = grossSalary;
              }
              // Special handling for gross_pay field with formula
              else if (field.id === 'gross_pay' && field.type === 'formula') {
                newCalculatedValues[field.id] = grossSalary;
              } 
              // Income Tax matching
              else if (fieldLabel.includes('income tax') || fieldLabel.includes('impôt') || fieldLabel.includes('tax') || fieldLabel.includes('withholding')) {
                newCalculatedValues[field.id] = calculatedTaxValues.incomeTax;
              } 
              // Social Security Total matching
              else if ((fieldLabel.includes('social security') || fieldLabel.includes('social contrib')) && !fieldLabel.includes('sickness') && !fieldLabel.includes('pension') && !fieldLabel.includes('dependency')) {
                newCalculatedValues[field.id] = calculatedTaxValues.socialSecurityTotal;
              } 
              // Sickness Insurance matching
              else if (fieldLabel.includes('sickness') || fieldLabel.includes('maladie') || fieldLabel.includes('health insurance')) {
                newCalculatedValues[field.id] = calculatedTaxValues.sicknessInsurance;
              } 
              // Pension matching
              else if (fieldLabel.includes('pension') || fieldLabel.includes('retraite') || fieldLabel.includes('retirement')) {
                newCalculatedValues[field.id] = calculatedTaxValues.pensionContribution;
              } 
              // Dependency Insurance matching
              else if (fieldLabel.includes('dependency') || fieldLabel.includes('dépendance') || fieldLabel.includes('long-term care')) {
                newCalculatedValues[field.id] = calculatedTaxValues.dependencyInsurance;
              } 
              // Total Deductions matching
              else if (fieldLabel.includes('total deduction') || fieldLabel.includes('total contrib') || fieldLabel.includes('total taxes')) {
                newCalculatedValues[field.id] = calculatedTaxValues.totalDeductions;
              } 
              // Net Salary matching
              else if (fieldLabel.includes('net salary') || fieldLabel.includes('net pay') || fieldLabel.includes('take home') || fieldLabel.includes('netto')) {
                newCalculatedValues[field.id] = calculatedTaxValues.netSalary;
              } 
              // Employer Cost matching
              else if (fieldLabel.includes('employer cost') || fieldLabel.includes('employer contrib') || fieldLabel.includes('total cost')) {
                newCalculatedValues[field.id] = calculatedTaxValues.employerCost;
              } 
              // Custom formulas with enhanced variable substitution
              else if (field.type === 'formula' && field.formula) {
                try {
                  let formula = field.formula;
                  
                  // Replace calculated values first
                  Object.keys(calculatedTaxValues).forEach(key => {
                    const value = calculatedTaxValues[key as keyof typeof calculatedTaxValues];
                    formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
                  });
                  
                  // Replace payslip data values
                  Object.keys(payslipData).forEach(key => {
                    const value = payslipData[key as keyof typeof payslipData];
                    if (typeof value === 'number') {
                      formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
                    }
                  });
                  
                  const result = eval(formula);
                  newCalculatedValues[field.id] = typeof result === 'number' ? Math.round(result * 100) / 100 : 0;
                } catch (error) {
                  console.error(`❌ Error calculating formula for ${field.id} (${field.label}):`, error);
                  newCalculatedValues[field.id] = 0;
                }
              }
            });
          });
          
          setCalculatedValues(newCalculatedValues);
          console.log(`🎯 Basic View: Set ${Object.keys(newCalculatedValues).length} calculated field values:`, newCalculatedValues);
          
        } catch (error) {
          console.error('❌ Error calculating Luxembourg taxes in Basic View:', error);
          // Set error state or show user feedback
          setCalculatedValues({});
        }
      }).catch(error => {
        console.error('❌ Error importing Luxembourg Tax Calculator:', error);
        setCalculatedValues({});
      });
    } else {
      // No gross salary, clear calculated values and update payslip data
      console.log('⚠️ Basic View: No gross salary detected, clearing calculated values');
      setCalculatedValues({});
      setPayslipData(prev => ({
        ...prev,
        gross_pay: 0, // underscore version for template
        grossSalary: 0, // camelCase version for backwards compatibility
        tax: 0,
        incomeTax: 0,
        socialSecurity: 0,
        socialSecurityTotal: 0,
        sicknessInsurance: 0,
        pensionContribution: 0,
        dependencyInsurance: 0,
        totalDeductions: 0,
        netSalary: 0,
        employerCost: 0
      }));
    }
  }, [
    // Monitor the 5 main salary components as requested - both underscore and camelCase versions
    payslipData.basic_salary, payslipData.basicSalary, payslipData.basic, payslipData.salary, payslipData.basePay,
    payslipData.allowances, payslipData.allowance, payslipData.benefits,
    payslipData.overtime, payslipData.overtimePay, payslipData.extraHours,
    payslipData.bonus, payslipData.bonuses, payslipData.incentives,
    payslipData.commission, payslipData.commissions,
    payslipData.gross_pay, payslipData.grossSalary, // Both gross salary field variants
    payslipData.deductions, payslipData.otherDeductions, payslipData.miscDeductions,
    payslipData.taxClass, payslipData.hasChildren, 
    selectedTemplate, safeArray
  ]);

  // Add new section
  const addSection = () => {
    if (!selectedTemplate) return;
    
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type: 'dynamic',
      fields: [
        {
          id: `field-${Date.now()}`,
          label: 'New Field',
          type: 'text',
          required: false
        }
      ],
      canAddFields: true,
      canRemove: true
    };
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: [...safeArray(selectedTemplate.sections), newSection]
    };
    
    setSelectedTemplate(updatedTemplate);
    // Save to localStorage
    const updatedTemplates = templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t);
    setTemplates(updatedTemplates);
    localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
  };

  // Remove section
  const removeSection = (sectionId: string) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: safeArray(selectedTemplate.sections).filter(s => s.id !== sectionId)
    };
    
    setSelectedTemplate(updatedTemplate);
    // Save to localStorage
    const updatedTemplates = templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t);
    setTemplates(updatedTemplates);
    localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
  };

  // Add field to section
  const addFieldToSection = (sectionId: string) => {
    if (!selectedTemplate) return;
    
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: safeArray(selectedTemplate.sections).map(section =>
        section.id === sectionId
          ? { ...section, fields: [...safeArray(section.fields), newField] }
          : section
      )
    };
    
    setSelectedTemplate(updatedTemplate);
    // Initialize field value
    setPayslipData(prev => ({ ...prev, [newField.id]: '' }));
    // Save to localStorage
    const updatedTemplates = templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t);
    setTemplates(updatedTemplates);
    localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
  };

  // Remove field from section
  const removeFieldFromSection = (sectionId: string, fieldId: string) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: safeArray(selectedTemplate.sections).map(section =>
        section.id === sectionId
          ? { ...section, fields: safeArray(section.fields).filter(f => f.id !== fieldId) }
          : section
      )
    };
    
    setSelectedTemplate(updatedTemplate);
    // Remove field value
    const newPayslipData = { ...payslipData };
    delete newPayslipData[fieldId];
    setPayslipData(newPayslipData);
    // Save to localStorage
    const updatedTemplates = templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t);
    setTemplates(updatedTemplates);
    localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
  };

  // Update field properties
  const updateField = (sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: safeArray(selectedTemplate.sections).map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: safeArray(section.fields).map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    };
    
    setSelectedTemplate(updatedTemplate);
    // Save to localStorage
    const updatedTemplates = templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t);
    setTemplates(updatedTemplates);
    localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
  };

  // Update header
  const updateHeader = (field: string, value: string) => {
    setPayslipData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value
      }
    }));
  };

  // Update company info
  const updateCompanyInfo = (field: string, value: string) => {
    setPayslipData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        companyInfo: {
          ...prev.header.companyInfo,
          [field]: value
        }
      }
    }));
  };

  // Add subheader
  const addSubHeader = () => {
    const newSubHeader = {
      id: `subheader-${Date.now()}`,
      sections: [
        { id: 'new-field', label: 'New Field', value: 'New Value' }
      ]
    };
    
    setPayslipData(prev => ({
      ...prev,
      subHeaders: [...prev.subHeaders, newSubHeader]
    }));
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Save function
  const handleSave = () => {
    try {
      localStorage.setItem(`basic-payslip-${selectedPerson?.id || 'unknown'}`, JSON.stringify(payslipData));
      alert('Payslip saved successfully!');
    } catch (error) {
      alert('Error saving payslip');
    }
  };

  // Enhanced field input renderer with automatic Luxembourg tax field detection
  const renderFieldInput = (field: FieldDefinition) => {
    const fieldLabel = field.label.toLowerCase().trim();
    const isLuxembourgTaxField = fieldLabel.includes('income tax') || 
                                fieldLabel.includes('social security') || 
                                fieldLabel.includes('sickness') || 
                                fieldLabel.includes('pension') || 
                                fieldLabel.includes('dependency') || 
                                fieldLabel.includes('net salary') || 
                                fieldLabel.includes('total deduction') || 
                                fieldLabel.includes('employer cost') ||
                                fieldLabel.includes('gross salary');
    
    const calculatedValue = calculatedValues[field.id];
    const userValue = payslipData[field.id];
    
    // Priority: calculated value > user value > default
    let displayValue: string | number = '';
    if (calculatedValue !== undefined && calculatedValue !== null) {
      displayValue = calculatedValue;
    } else if (userValue !== undefined && userValue !== null && userValue !== '') {
      displayValue = userValue;
    }

    // Format currency values for Luxembourg tax fields
    if (field.type === 'formula' || (field.type === 'number' && isLuxembourgTaxField && typeof displayValue === 'number')) {
      return (
        <CalculatedValue style={{
          backgroundColor: calculatedValue !== undefined ? '#e8f5e9' : '#f8f9fa',
          border: calculatedValue !== undefined ? '2px solid #4caf50' : '1px solid #e9ecef',
          color: calculatedValue !== undefined ? '#2e7d32' : '#495057',
          fontWeight: calculatedValue !== undefined ? 'bold' : 'normal'
        }}>
          {typeof displayValue === 'number' ? 
            `€${displayValue.toLocaleString('de-LU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
            displayValue || '€0.00'
          }
          {calculatedValue !== undefined && (
            <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
              🇱🇺 Auto-calculated
            </span>
          )}
        </CalculatedValue>
      );
    }

    // Handle manual gross salary input (when user wants to override calculation)
    if (fieldLabel.includes('gross salary') && field.type === 'number') {
      return (
        <Input
          type="number"
          step="0.01"
          value={displayValue || ''}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value) || 0;
            handleFieldChange(field.id, newValue);
          }}
          placeholder={`${field.label} (€)`}
          disabled={field.readonly}
          style={{
            backgroundColor: calculatedValue !== undefined ? '#f1f8e9' : 'white',
            borderColor: calculatedValue !== undefined ? '#8bc34a' : '#ddd'
          }}
        />
      );
    }

    // Standard fields
    return (
      <Input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        step={field.type === 'number' ? '0.01' : undefined}
        value={displayValue || ''}
        onChange={(e) => handleFieldChange(field.id, 
          field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
        )}
        placeholder={field.type === 'number' && fieldLabel.includes('salary') ? `${field.label} (€)` : field.label}
        disabled={field.readonly}
        style={{
          backgroundColor: calculatedValue !== undefined ? '#f1f8e9' : 'white',
          borderColor: calculatedValue !== undefined ? '#8bc34a' : '#ddd',
          fontWeight: calculatedValue !== undefined ? 'bold' : 'normal'
        }}
      />
    );
  };

  return (
    <Container>
      <Title>📝 Basic View - Enhanced Editor</Title>
      
      <ControlPanel>
        {/* Luxembourg Tax Configuration */}
        <InputGroup>
          <Label>🇱🇺 Luxembourg Tax Configuration</Label>
          <Grid columns={3}>
            <div>
              <Label>Tax Class</Label>
              <Select
                value={payslipData.taxClass || 1}
                onChange={(e) => setPayslipData(prev => ({ ...prev, taxClass: parseInt(e.target.value) }))}
              >
                <option value={1}>Class 1 - Single</option>
                <option value={2}>Class 2 - Married/Civil Partner</option>
              </Select>
            </div>
            <div>
              <Label>Has Children</Label>
              <Select
                value={payslipData.hasChildren ? 'yes' : 'no'}
                onChange={(e) => setPayslipData(prev => ({ ...prev, hasChildren: e.target.value === 'yes' }))}
              >
                <option value="no">No</option>
                <option value="yes">Yes (Tax Credits Apply)</option>
              </Select>
            </div>
            <div>
              <Label>Gross Salary (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={payslipData.grossSalary || 0}
                onChange={(e) => setPayslipData(prev => ({ ...prev, grossSalary: parseFloat(e.target.value) || 0 }))}
                placeholder="Monthly gross salary"
              />
            </div>
          </Grid>
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#2e7d32'
          }}>
            💡 Tax calculations use Luxembourg 2025 rates including solidarity tax and social security contributions
          </div>
        </InputGroup>

        <InputGroup>
          <Label>Person Type Filter:</Label>
          <Select 
            value={selectedPersonType} 
            onChange={(e) => {
              const newPersonType = e.target.value as any;
              setSelectedPersonType(newPersonType);
              // Sync person type selection across views
              viewSync.setSelectedPersonType(newPersonType);
              console.log('📝 Basic View: Person type selected and synced to Excel View:', newPersonType);
            }}
          >
            <option value="all">🌟 All Types</option>
            {Object.entries(PERSON_TYPE_CONFIG || {}).map(([type, config]) => (
              <option key={type} value={type}>
                {config?.icon || ''} {config?.label || type}s
              </option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>Select Person:</Label>
          <Select 
            value={selectedPerson?.id || ''} 
            onChange={(e) => {
              const personId = e.target.value;
              handlePersonChange(personId);
              // Sync person selection across views
              if (personId) {
                viewSync.setSelectedPerson(personId);
                console.log('📝 Basic View: Person selected and synced to Excel View:', personId);
              } else {
                viewSync.setSelectedPerson(null);
              }
            }}
          >
            <option value="">Choose Person...</option>
            {safeArray(filteredPersons).map(person => (
              person && person.id && person.personalInfo ? (
                <option key={person.id} value={person.id}>
                  {PERSON_TYPE_CONFIG[person.type]?.icon || ''} {person.personalInfo.fullName || 'Unknown'} - {person.workInfo?.personId || 'No ID'}
                </option>
              ) : null
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>📅 Select Year & Month:</Label>
          <Grid columns={2}>
            <div>
              <Label>Year</Label>
              <Select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setSelectedYear(year);
                  // Update pay period in subHeaders
                  setPayslipData(prev => ({
                    ...prev,
                    subHeaders: prev.subHeaders.map(sh => 
                      sh.id === 'info-header' ? {
                        ...sh,
                        sections: sh.sections.map(s => 
                          s.id === 'period' ? 
                            { ...s, value: `${new Date(year, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` } 
                            : s
                        )
                      } : sh
                    )
                  }));
                }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select
                value={selectedMonth}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  setSelectedMonth(month);
                  // Update pay period in subHeaders
                  setPayslipData(prev => ({
                    ...prev,
                    subHeaders: prev.subHeaders.map(sh => 
                      sh.id === 'info-header' ? {
                        ...sh,
                        sections: sh.sections.map(s => 
                          s.id === 'period' ? 
                            { ...s, value: `${new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` } 
                            : s
                        )
                      } : sh
                    )
                  }));
                }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const monthName = new Date(2025, i).toLocaleDateString('en-US', { month: 'long' });
                  return (
                    <option key={i} value={i}>{monthName}</option>
                  );
                })}
              </Select>
            </div>
          </Grid>
          <div style={{
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#2e7d32',
            fontWeight: '500'
          }}>
            📅 Pay Period: {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </InputGroup>

        <InputGroup>
          <Label>📋 Select Template:</Label>
          <Select 
            value={selectedTemplate?.id || ''} 
            onChange={(e) => {
              const templateId = e.target.value;
              handleTemplateChange(templateId);
              
              const template = templates.find(t => t.id === templateId);
              if (template) {
                // Sync selection across views
                viewSync.setSelectedTemplate(template.id);
                console.log('📝 Basic View: Template selected and synced to Excel View:', template.name);
              } else {
                viewSync.setSelectedTemplate(null);
              }
            }}
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: selectedTemplate ? '#1565c0' : '#666'
            }}
          >
            <option value="" style={{ color: '#999' }}>Choose Template Type...</option>
            {safeArray(templates).map(template => (
              template && template.id ? (
                <option 
                  key={template.id} 
                  value={template.id}
                  style={{
                    fontWeight: 'bold',
                    color: template.type === 'basic' ? '#1565c0' : '#e65100'
                  }}
                >
                  {template.type === 'basic' ? '📝 Basic: ' : '⚡ Advanced: '}
                  {template.name?.replace('📝 ', '').replace('⚡ ', '').replace('📊 ', '').replace('📋 ', '') || 'Unnamed Template'}
                  {template.type === 'basic' && ' - Simple Payslip'}
                  {template.type === 'advanced' && ' - Advanced Features'}  
                </option>
              ) : null
            ))}
          </Select>
          {selectedTemplate ? (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              backgroundColor: selectedTemplate.type === 'basic' ? '#e3f2fd' : '#fff3e0',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedTemplate.type === 'basic' ? '#1565c0' : '#e65100'
            }}>
              ✅ Active: {selectedTemplate.name}
              <br />
              📝 {selectedTemplate.description || 'No description'}
              <br />
              <div style={{ 
                color: '#4caf50', 
                fontSize: '11px', 
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🔄 All selections synced with Excel View
              </div>
            </div>
          ) : (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#e65100',
              border: '1px solid #ffcc80'
            }}>
              💡 <strong>Select a template above to get started!</strong>
              <br />
              📝 Basic Template - For simple monthly payslips
              <br />
              ⚡ Advanced Template - For detailed payroll analysis
              <br />
              📊 Excel Template - For annual/spreadsheet-style reports
            </div>
          )}
        </InputGroup>

        <InputGroup>
          <Label style={{ color: '#f44336' }}>Fresh Start:</Label>
          <Button 
            onClick={() => {
              if (selectedPerson && window.confirm(`Reset all data for ${selectedPerson.personalInfo?.fullName}? This will create a completely fresh payslip with all values at 0.`)) {
                if (selectedTemplate) {
                  initializeFromTemplate(selectedTemplate, selectedPerson);
                  populatePersonData(selectedPerson);
                }
                // Remove saved data
                localStorage.removeItem(`basic-payslip-${selectedPerson.id}`);
              }
            }}
            style={{
              backgroundColor: '#f44336',
              marginTop: '5px'
            }}
            disabled={!selectedPerson}
          >
            🔄 Reset to Fresh Template
          </Button>
        </InputGroup>
      </ControlPanel>

      {editMode && (
        <TemplateEditor>
          <h3 style={{ color: '#1976d2', marginBottom: '20px' }}>🎨 Template Editor</h3>
          
          {/* Header Editor */}
          <HeaderEditor>
            <h4>📋 Header Settings</h4>
            <Grid>
              <InputGroup>
                <Label>Main Title</Label>
                <Input
                  type="text"
                  value={payslipData.header.title}
                  onChange={(e) => updateHeader('title', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Subtitle</Label>
                <Input
                  type="text"
                  value={payslipData.header.subtitle}
                  onChange={(e) => updateHeader('subtitle', e.target.value)}
                />
              </InputGroup>
            </Grid>
            
            <h5>Company Information</h5>
            <Grid>
              <InputGroup>
                <Label>Company Name</Label>
                <Input
                  type="text"
                  value={payslipData.header.companyInfo.name}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Phone</Label>
                <Input
                  type="text"
                  value={payslipData.header.companyInfo.phone}
                  onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={payslipData.header.companyInfo.email}
                  onChange={(e) => updateCompanyInfo('email', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={payslipData.header.companyInfo.address}
                  onChange={(e) => updateCompanyInfo('address', e.target.value)}
                />
              </InputGroup>
            </Grid>
          </HeaderEditor>

          {/* SubHeaders Editor */}
          <SectionEditor>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>📊 Sub Headers</h4>
              <Button onClick={addSubHeader}>+ Add Sub Header</Button>
            </div>
            
            {safeArray(payslipData.subHeaders).map((subHeader, index) => (
              <FieldEditor key={subHeader.id}>
                <h5>Sub Header {index + 1}</h5>
                {safeArray(subHeader.sections).map(section => (
                  <Grid key={section.id}>
                    <InputGroup>
                      <Label>Label</Label>
                      <Input
                        type="text"
                        value={section.label}
                        onChange={(e) => {
                          setPayslipData(prev => ({
                            ...prev,
                            subHeaders: prev.subHeaders.map(sh => 
                              sh.id === subHeader.id ? {
                                ...sh,
                                sections: sh.sections.map(s => 
                                  s.id === section.id ? { ...s, label: e.target.value } : s
                                )
                              } : sh
                            )
                          }));
                        }}
                      />
                    </InputGroup>
                    <InputGroup>
                      <Label>Value</Label>
                      <Input
                        type="text"
                        value={section.value}
                        onChange={(e) => {
                          setPayslipData(prev => ({
                            ...prev,
                            subHeaders: prev.subHeaders.map(sh => 
                              sh.id === subHeader.id ? {
                                ...sh,
                                sections: sh.sections.map(s => 
                                  s.id === section.id ? { ...s, value: e.target.value } : s
                                )
                              } : sh
                            )
                          }));
                        }}
                      />
                    </InputGroup>
                  </Grid>
                ))}
              </FieldEditor>
            ))}
          </SectionEditor>

          {/* Sections Editor */}
          <SectionEditor>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>📝 Sections Management</h4>
              <Button onClick={addSection}>+ Add Section</Button>
            </div>
            
            {safeArray(selectedTemplate?.sections).map(section => (
              <FieldEditor key={section.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5>{section.title}</h5>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={() => addFieldToSection(section.id)}>+ Add Field</Button>
                    {section.canRemove && (
                      <DeleteButton onClick={() => removeSection(section.id)}>Delete Section</DeleteButton>
                    )}
                  </div>
                </div>
                
                {safeArray(section.fields).map(field => (
                  <div key={field.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                    <Grid columns={4}>
                      <InputGroup>
                        <Label>Field Label</Label>
                        <Input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                        />
                      </InputGroup>
                      <InputGroup>
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onChange={(e) => updateField(section.id, field.id, { type: e.target.value as any })}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="formula">Formula</option>
                        </Select>
                      </InputGroup>
                      <InputGroup>
                        <Label>Default Value</Label>
                        <Input
                          type="text"
                          value={field.value || ''}
                          onChange={(e) => updateField(section.id, field.id, { value: e.target.value })}
                        />
                      </InputGroup>
                      <div style={{ alignSelf: 'end' }}>
                        <DeleteButton onClick={() => removeFieldFromSection(section.id, field.id)}>Remove</DeleteButton>
                      </div>
                    </Grid>
                    
                    {field.type === 'formula' && (
                      <InputGroup style={{ marginTop: '10px' }}>
                        <Label>Formula</Label>
                        <Input
                          type="text"
                          value={field.formula || ''}
                          onChange={(e) => updateField(section.id, field.id, { formula: e.target.value })}
                          placeholder="e.g., basicSalary * 0.15"
                        />
                      </InputGroup>
                    )}
                  </div>
                ))}
              </FieldEditor>
            ))}
          </SectionEditor>
        </TemplateEditor>
      )}

      <PayslipContainer>
        <EditModeToggle 
          isActive={editMode}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? '📝 Exit Edit Mode' : '🎨 Edit Mode'}
        </EditModeToggle>

        <SaveButton onClick={handleSave}>💾 Save</SaveButton>
        <PrintButton onClick={handlePrint}>🖨️ Print</PrintButton>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '32px' }}>
            {payslipData.header.title}
          </h1>
          <h2 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '18px' }}>
            {payslipData.header.subtitle}
          </h2>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ fontWeight: 'bold' }}>{payslipData.header.companyInfo.name}</div>
            <div>{payslipData.header.companyInfo.address}</div>
            <div>{payslipData.header.companyInfo.phone} | {payslipData.header.companyInfo.email}</div>
          </div>
        </div>

        {/* Sub Headers */}
        {safeArray(payslipData.subHeaders).map(subHeader => (
          <div key={subHeader.id} style={{
            backgroundColor: '#e3f2fd',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #1976d2'
          }}>
            <Grid columns={Math.min(safeArray(subHeader.sections).length, 4)}>
              {safeArray(subHeader.sections).map(section => (
                <div key={section.id}>
                  <strong>{section.label}:</strong>
                  <div style={{ marginTop: '5px' }}>{section.value}</div>
                </div>
              ))}
            </Grid>
          </div>
        ))}

        {/* Sections */}
        {selectedTemplate && safeArray(selectedTemplate.sections).map(section => (
          <Section 
            key={section.id}
            borderColor={section.styling?.borderColor}
            backgroundColor={section.styling?.backgroundColor}
          >
            <SectionHeader 
              textColor={section.styling?.textColor}
              backgroundColor={section.styling?.backgroundColor}
            >
              <span>{section.title}</span>
              {editMode && section.canRemove && (
                <DeleteButton onClick={() => removeSection(section.id)}>Remove</DeleteButton>
              )}
            </SectionHeader>
            <SectionContent>
              <Grid columns={selectedTemplate.layout?.columnsPerRow || 2}>
                {safeArray(section.fields).map(field => (
                  <InputGroup key={field.id}>
                    <Label>{field.label}</Label>
                    {renderFieldInput(field)}
                    {editMode && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        <DeleteButton 
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => removeFieldFromSection(section.id, field.id)}
                        >
                          Remove
                        </DeleteButton>
                      </div>
                    )}
                  </InputGroup>
                ))}
              </Grid>
              {editMode && section.canAddFields && (
                <div style={{ marginTop: '15px' }}>
                  <Button onClick={() => addFieldToSection(section.id)}>+ Add Field to {section.title}</Button>
                </div>
              )}
            </SectionContent>
          </Section>
        ))}

        {/* Summary */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#fff3e0', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#e65100' }}>Generated on {new Date().toLocaleDateString()}</h3>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            {selectedPerson ? `for ${PERSON_TYPE_CONFIG[selectedPerson.type]?.label || selectedPerson.type} ${selectedPerson.personalInfo?.fullName}` : 'Please select a person'}
          </div>
        </div>
      </PayslipContainer>
    </Container>
  );
};

export default PayslipGenerator;