import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { personManager } from '../utils/personManager';
import { templateSync } from '../utils/templateSync';
import { viewSync } from '../utils/viewSync';
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

const HeaderEditor = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const HeaderInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
`;

const SubHeaderEditor = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
`;

const GroupEditor = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
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
  isGroupHeader?: boolean;
}>`
  background-color: ${props => 
    props.isHeader ? '#4472c4' : 
    props.isGroupHeader ? '#2e7d32' :
    props.isTotal ? '#ffd700' :
    props.isCalculated ? '#f2f2f2' : 
    props.isEditable ? 'white' : '#fafafa'
  };
  color: ${props => props.isHeader || props.isTotal || props.isGroupHeader ? 'white' : '#333'};
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: ${props => props.isHeader ? '12px' : '14px'};
  font-weight: ${props => props.isHeader || props.isCalculated || props.isTotal || props.isGroupHeader ? 'bold' : 'normal'};
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.isHeader || props.isGroupHeader ? 'center' : 'flex-start'};
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
  color: inherit;
  
  &:focus {
    outline: 2px solid #1976d2;
    background-color: white;
    color: #333;
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

interface PayslipGroup {
  id: string;
  name: string;
  rows: string[];
  isCollapsed: boolean;
}

interface CustomHeader {
  id: string;
  title: string;
  subtitle?: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

interface CustomSubHeader {
  id: string;
  sections: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

interface MonthlyPayslipState {
  [key: string]: any;
  personName: string;
  personId: string;
  department: string;
  position: string;
  year: number;
  
  months: {
    [monthIndex: number]: {
      [key: string]: number;
    };
  };
  
  totals: {
    [key: string]: number;
  };
  
  customRows: string[];
  groups: PayslipGroup[];
  header: CustomHeader;
  subHeaders: CustomSubHeader[];
}

const MonthlyPayslipGenerator: React.FC<Props> = ({ analysisData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingRowName, setEditingRowName] = useState<string | null>(null);
  const [tempRowName, setTempRowName] = useState<string>('');

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const defaultRows = React.useMemo(() => [
    'Basic Salary',
    'Housing Allowance', 
    'Transport Allowance',
    'Overtime Pay',
    'Bonus',
    'Gross Salary',
    'Income Tax',
    'Social Security',
    'Health Insurance',
    'Total Deductions',
    'Net Salary'
  ], []);

  const [payslipData, setPayslipData] = useState<MonthlyPayslipState>({
    personName: 'John Doe',
    personId: 'EMP001',
    department: 'IT Department',
    position: 'Software Engineer',
    year: new Date().getFullYear(),
    months: {},
    totals: {},
    customRows: [...defaultRows],
    groups: [
      {
        id: 'earnings',
        name: 'EARNINGS',
        rows: ['Basic Salary', 'Housing Allowance', 'Transport Allowance', 'Overtime Pay', 'Bonus'],
        isCollapsed: false
      },
      {
        id: 'summary',
        name: 'SUMMARY',
        rows: ['Gross Salary'],
        isCollapsed: false
      },
      {
        id: 'deductions',
        name: 'DEDUCTIONS',
        rows: ['Income Tax', 'Social Security', 'Health Insurance', 'Total Deductions'],
        isCollapsed: false
      },
      {
        id: 'final',
        name: 'NET PAY',
        rows: ['Net Salary'],
        isCollapsed: false
      }
    ],
    header: {
      id: 'main-header',
      title: 'ANNUAL PAYSLIP REPORT',
      subtitle: 'Employee Annual Statement',
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
          { id: 'year', label: 'Year', value: new Date().getFullYear().toString() },
          { id: 'department', label: 'Department', value: 'IT Department' },
          { id: 'generated', label: 'Generated On', value: new Date().toLocaleDateString() }
        ]
      }
    ]
  });

  // Safe array utility
  const safeArray = useCallback(<T,>(arr: T[] | undefined | null): T[] => {
    return Array.isArray(arr) ? arr : [];
  }, []);

  // Initialize fresh monthly data (everything starts at 0)
  useEffect(() => {
    const initialMonths: any = {};
    const initialTotals: any = {};
    
    for (let i = 0; i < 12; i++) {
      initialMonths[i] = {};
      defaultRows.forEach(row => {
        // Start everything at 0 for fresh template
        initialMonths[i][row] = 0;
      });
    }
    
    // Calculate initial totals (all 0)
    defaultRows.forEach(row => {
      initialTotals[row] = 0;
    });
    
    setPayslipData(prev => ({ 
      ...prev, 
      months: initialMonths,
      totals: initialTotals
    }));
  }, [defaultRows]);


  // Force create essential templates immediately
  const createEssentialTemplates = useCallback(() => {
    const basicTemplate = {
      id: 'basic-monthly-template',
      name: '📝 Basic Payslip Template',
      version: '1.0',
      description: 'Simple monthly payslip template - perfect for regular payslips',
      type: 'basic' as const,
      header: {
        id: 'basic-header',
        title: 'MONTHLY PAYSLIP',
        subtitle: 'Employee Pay Statement',
        companyInfo: {
          name: 'Your Company Name',
          address: 'Company Address',
          phone: 'Phone Number',
          email: 'Email Address'
        }
      },
      subHeaders: [{
        id: 'basic-subheader',
        sections: [
          { id: 'pay-period', label: 'Pay Period', value: 'Monthly', type: 'text' as const, editable: true },
          { id: 'pay-date', label: 'Pay Date', value: new Date().toLocaleDateString(), type: 'date' as const, editable: true }
        ]
      }],
      sections: [],
      tables: [],
      globalFormulas: {},
      styling: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        primaryColor: '#1565c0',
        secondaryColor: '#f5f5f5',
        borderStyle: 'solid' as const
      },
      layout: {
        columnsPerRow: 2,
        sectionSpacing: 15,
        printOrientation: 'portrait' as const
      },
      isEditable: true,
      createdDate: new Date(),
      lastModified: new Date()
    };

    const advancedTemplate = {
      id: 'advanced-annual-template',
      name: '⚡ Advanced Annual Template',
      version: '1.0', 
      description: 'Comprehensive yearly Excel-style template - perfect for detailed annual reports',
      type: 'annual' as const,
      header: {
        id: 'advanced-header',
        title: 'ADVANCED ANNUAL PAYROLL',
        subtitle: 'Comprehensive Yearly Financial Analysis',
        companyInfo: {
          name: 'Advanced Analytics Corp.',
          address: 'Advanced Drive, Data City',
          phone: '+1 (555) 999-8888',
          email: 'advanced@company.com'
        }
      },
      subHeaders: [{
        id: 'advanced-subheader',
        sections: [
          { id: 'fiscal-year', label: 'Fiscal Year', value: new Date().getFullYear().toString(), type: 'text' as const, editable: true },
          { id: 'report-type', label: 'Report Type', value: 'Advanced Analysis', type: 'text' as const, editable: true },
          { id: 'generated-date', label: 'Generated', value: new Date().toLocaleDateString(), type: 'date' as const, editable: true }
        ]
      }],
      sections: [],
      tables: [],
      globalFormulas: {},
      styling: {
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 14,
        primaryColor: '#6a1b9a',
        secondaryColor: '#f3e5f5',
        borderStyle: 'solid' as const
      },
      layout: {
        columnsPerRow: 3,
        sectionSpacing: 25,
        printOrientation: 'landscape' as const
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
      console.log('📊 Excel View: Loading templates via TemplateSync');
      
      // Load templates from unified sync service
      const loadedTemplates = templateSync.getAllTemplates();
      const loadedPersons = personManager.getAllPersons();

      setTemplates(safeArray(loadedTemplates));
      setPersons(safeArray(loadedPersons));
      
      // Debug: Log templates found
      console.log(`✅ Excel View: Loaded ${loadedTemplates.length} synchronized templates`);
      loadedTemplates.forEach((template: any) => {
        console.log(`  - ${template.type === 'basic' ? '📝' : template.type === 'annual' ? '📊' : '⚡'} ${template.name} (${template.type})`);
      });
      
      // Default to basic template
      const basicTemplate = loadedTemplates.find(t => t.type === 'basic');
      if (basicTemplate) {
        setSelectedTemplate(basicTemplate);
        console.log('✅ Excel View: Default template set to:', basicTemplate.name);
      } else if (safeArray(loadedTemplates).length > 0) {
        setSelectedTemplate(loadedTemplates[0]);
        console.log('✅ Excel View: Default template set to:', loadedTemplates[0].name);
      }

      if (safeArray(loadedPersons).length > 0) {
        setSelectedPerson(loadedPersons[0]);
        const person = loadedPersons[0];
        setPayslipData(prev => ({
          ...prev,
          personName: person.personalInfo?.fullName || 'Unknown',
          personId: person.workInfo?.personId || 'N/A',
          department: person.workInfo?.department || 'N/A',
          position: person.workInfo?.position || person.workInfo?.title || 'N/A'
        }));
      }

      // Subscribe to template changes from other views
      const unsubscribeTemplateSync = templateSync.subscribe(() => {
        console.log('📊 Excel View: Received template sync notification');
        const updatedTemplates = templateSync.getAllTemplates();
        setTemplates(safeArray(updatedTemplates));
        console.log(`🔄 Excel View: Updated with ${updatedTemplates.length} templates`);
      });

      // Subscribe to cross-view selection changes
      const unsubscribeViewSync = viewSync.onTemplateChange((templateId) => {
        if (templateId) {
          const template = loadedTemplates.find(t => t.id === templateId);
          if (template && (!selectedTemplate || selectedTemplate.id !== templateId)) {
            console.log('📊 Excel View: Received cross-view template selection:', template.name);
            setSelectedTemplate(template);
          }
        }
      });

      // Set initial selections from viewSync
      const syncedTemplateId = viewSync.getSelectedTemplate();
      if (syncedTemplateId) {
        const syncedTemplate = loadedTemplates.find(t => t.id === syncedTemplateId);
        if (syncedTemplate) {
          setSelectedTemplate(syncedTemplate);
          console.log('📊 Excel View: Applied synced template:', syncedTemplate.name);
        }
      }
      
      return () => {
        unsubscribeTemplateSync();
        unsubscribeViewSync();
      };
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [safeArray]);

  // Calculate totals whenever monthly data changes
  useEffect(() => {
    const months = payslipData.months;
    const newTotals: any = {};
    
    payslipData.customRows.forEach(row => {
      newTotals[row] = 0;
      for (let i = 0; i < 12; i++) {
        newTotals[row] += months[i]?.[row] || 0;
      }
    });
    
    setPayslipData(prev => ({ ...prev, totals: newTotals }));
  }, [payslipData.months, payslipData.customRows]);

  // Filtered persons based on type
  const filteredPersons = React.useMemo(() => {
    const safePeople = safeArray(persons);
    return selectedPersonType === 'all' 
      ? safePeople 
      : safePeople.filter(person => person && person.type === selectedPersonType);
  }, [selectedPersonType, persons, safeArray]);

  // Handle cell value change
  const handleCellChange = (monthIndex: number, rowName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPayslipData(prev => ({
      ...prev,
      months: {
        ...prev.months,
        [monthIndex]: {
          ...prev.months[monthIndex],
          [rowName]: numValue
        }
      }
    }));
  };

  // Handle person selection - create fresh personalized template
  const handlePersonChange = (personId: string) => {
    const person = safeArray(filteredPersons).find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
      
      // Create fresh personalized template for this user
      const personalizedData = createFreshPersonalizedTemplate(person);
      setPayslipData(personalizedData);
      
      // Try to load existing data for this person
      loadPersonalizedData(person.id);
    }
  };

  // Apply selected template to payslip
  const applyTemplateToPayslip = useCallback((template: PayslipTemplate) => {
    if (!template) return;

    try {
      // Update header information from template
      const templateHeader = template.header;
      const templateSubHeaders = safeArray(template.subHeaders);

      setPayslipData(prev => ({
        ...prev,
        header: {
          id: templateHeader.id || 'applied-header',
          title: templateHeader.title || 'PAYSLIP',
          subtitle: templateHeader.subtitle || 'Employee Pay Statement',
          companyInfo: {
            name: templateHeader.companyInfo?.name || 'Company Name',
            address: templateHeader.companyInfo?.address || 'Company Address',
            phone: templateHeader.companyInfo?.phone || 'Phone Number',
            email: templateHeader.companyInfo?.email || 'Email Address'
          }
        },
        subHeaders: templateSubHeaders.length > 0 ? templateSubHeaders.map(sh => ({
          id: sh.id,
          sections: safeArray(sh.sections).map(section => ({
            id: section.id,
            label: section.label,
            value: section.value
          }))
        })) : prev.subHeaders
      }));

      // Show template applied message
      const templateTypeText = template.type === 'basic' ? '📝 Basic Monthly Template' : 
                              template.type === 'annual' ? '📊 Annual Excel Template' : 
                              '⚡ Custom Template';
      
      alert(`✅ Template Applied Successfully!\n\n${templateTypeText}\n\n"${template.name}" has been applied to your payslip.\n\n${template.description || 'Template is ready to use.'}`);
      
    } catch (error) {
      console.error('Error applying template:', error);
      alert('❌ Error applying template. Please try again.');
    }
  }, [safeArray]);

  // Create fresh personalized template for user
  const createFreshPersonalizedTemplate = (person: PersonProfile): MonthlyPayslipState => {
    const freshMonths: any = {};
    const freshTotals: any = {};
    
    // Initialize all months with 0 values
    for (let i = 0; i < 12; i++) {
      freshMonths[i] = {};
      defaultRows.forEach(row => {
        freshMonths[i][row] = 0; // Everything starts at 0
      });
    }
    
    // All totals start at 0
    defaultRows.forEach(row => {
      freshTotals[row] = 0;
    });

    return {
      // Editable common information from person (pre-populated but editable)
      personName: person.personalInfo?.fullName || '',
      personId: person.workInfo?.personId || '',
      department: person.workInfo?.department || '',
      position: person.workInfo?.position || person.workInfo?.title || '',
      year: new Date().getFullYear(),
      months: freshMonths,
      totals: freshTotals,
      customRows: [...defaultRows],
      groups: [
        {
          id: 'earnings',
          name: 'EARNINGS',
          rows: ['Basic Salary', 'Housing Allowance', 'Transport Allowance', 'Overtime Pay', 'Bonus'],
          isCollapsed: false
        },
        {
          id: 'summary',
          name: 'SUMMARY',
          rows: ['Gross Salary'],
          isCollapsed: false
        },
        {
          id: 'deductions',
          name: 'DEDUCTIONS',
          rows: ['Income Tax', 'Social Security', 'Health Insurance', 'Total Deductions'],
          isCollapsed: false
        },
        {
          id: 'final',
          name: 'NET PAY',
          rows: ['Net Salary'],
          isCollapsed: false
        }
      ],
      header: {
        id: 'main-header',
        title: `ANNUAL PAYSLIP REPORT - ${person.personalInfo?.fullName || 'Employee'}`,
        subtitle: `${PERSON_TYPE_CONFIG[person.type]?.label || person.type} Annual Statement`,
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
            { id: 'year', label: 'Year', value: new Date().getFullYear().toString() },
            { id: 'type', label: 'Person Type', value: PERSON_TYPE_CONFIG[person.type]?.label || person.type },
            { id: 'department', label: 'Department', value: person.workInfo?.department || 'N/A' },
            { id: 'generated', label: 'Generated On', value: new Date().toLocaleDateString() }
          ]
        }
      ]
    };
  };

  // Load personalized data if exists
  const loadPersonalizedData = (personId: string) => {
    try {
      const savedData = localStorage.getItem(`annual-payslip-${personId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setPayslipData(parsedData);
      }
    } catch (error) {
      console.error('Error loading personalized data:', error);
    }
  };

  // Add new row
  const addCustomRow = () => {
    // Create a temporary unique placeholder name
    const tempId = Date.now();
    const newRowName = `__NEW_ROW_${tempId}__`;
    
    setPayslipData(prev => {
      const newRows = [...prev.customRows, newRowName];
      const newMonths = { ...prev.months };
      const newTotals = { ...prev.totals };
      
      // Initialize new row data
      for (let i = 0; i < 12; i++) {
        newMonths[i] = { ...newMonths[i], [newRowName]: 0 };
      }
      newTotals[newRowName] = 0;
      
      return {
        ...prev,
        customRows: newRows,
        months: newMonths,
        totals: newTotals
      };
    });
    
    // Immediately enter edit mode for the new row
    setTimeout(() => {
      setEditingRowName(newRowName);
      setTempRowName('');
    }, 50);
  };

  // Add new group
  const addGroup = () => {
    const newGroup: PayslipGroup = {
      id: `group-${Date.now()}`,
      name: 'NEW GROUP',
      rows: [],
      isCollapsed: false
    };
    setPayslipData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));
  };

  // Add row to specific group
  const addRowToGroup = (groupId: string) => {
    // Create a temporary unique placeholder name
    const tempId = Date.now();
    const newRowName = `__NEW_ROW_${tempId}__`;
    
    setPayslipData(prev => {
      // Add row to customRows
      const newCustomRows = [...prev.customRows, newRowName];
      
      // Initialize monthly data for new row
      const newMonths = { ...prev.months };
      const newTotals = { ...prev.totals };
      
      for (let i = 0; i < 12; i++) {
        newMonths[i] = { ...newMonths[i], [newRowName]: 0 };
      }
      newTotals[newRowName] = 0;
      
      // Add row to specific group
      const newGroups = prev.groups.map(group => 
        group.id === groupId 
          ? { ...group, rows: [...group.rows, newRowName] }
          : group
      );
      
      return {
        ...prev,
        customRows: newCustomRows,
        months: newMonths,
        totals: newTotals,
        groups: newGroups
      };
    });
    
    // Immediately enter edit mode for the new row
    setTimeout(() => {
      setEditingRowName(newRowName);
      setTempRowName('');
    }, 50);
  };

  // Remove row from group
  const removeRowFromGroup = (groupId: string, rowName: string) => {
    if (window.confirm(`Remove "${rowName}" from this group? The row data will be preserved but moved to ungrouped rows.`)) {
      setPayslipData(prev => ({
        ...prev,
        groups: prev.groups.map(group => 
          group.id === groupId 
            ? { ...group, rows: group.rows.filter(row => row !== rowName) }
            : group
        )
      }));
    }
  };

  // Delete row completely
  const deleteRowCompletely = (rowName: string) => {
    if (window.confirm(`Permanently delete "${rowName}"? This will remove all data for this row and cannot be undone.`)) {
      setPayslipData(prev => {
        // Remove from customRows
        const newCustomRows = prev.customRows.filter(row => row !== rowName);
        
        // Remove from all monthly data
        const newMonths = { ...prev.months };
        for (let i = 0; i < 12; i++) {
          const monthData = { ...newMonths[i] };
          delete monthData[rowName];
          newMonths[i] = monthData;
        }
        
        // Remove from totals
        const newTotals = { ...prev.totals };
        delete newTotals[rowName];
        
        // Remove from all groups
        const newGroups = prev.groups.map(group => ({
          ...group,
          rows: group.rows.filter(row => row !== rowName)
        }));
        
        return {
          ...prev,
          customRows: newCustomRows,
          months: newMonths,
          totals: newTotals,
          groups: newGroups
        };
      });
    }
  };

  // Move row to different group
  const moveRowToGroup = (rowName: string, fromGroupId: string | null, toGroupId: string) => {
    if (fromGroupId === toGroupId) return;
    
    setPayslipData(prev => {
      const newGroups = prev.groups.map(group => {
        // Remove from source group
        if (group.id === fromGroupId) {
          return { ...group, rows: group.rows.filter(row => row !== rowName) };
        }
        // Add to target group (only if not ungrouped)
        if (group.id === toGroupId && toGroupId !== 'ungrouped') {
          return { ...group, rows: [...group.rows, rowName] };
        }
        return group;
      });
      
      return { ...prev, groups: newGroups };
    });
  };

  // Rename row
  const renameRow = (oldName: string, newName: string) => {
    // If new name is empty and this is a temporary row, delete it
    if (!newName.trim() && oldName.startsWith('__NEW_ROW_')) {
      deleteRowCompletely(oldName);
      return true;
    }
    
    if (!newName.trim()) return false;
    
    // If it's the same name and not a temporary row, no change needed
    if (oldName === newName && !oldName.startsWith('__NEW_ROW_')) return true;
    
    // Check if new name already exists (but not if it's the same row or a temp row)
    if (payslipData.customRows.includes(newName.trim()) && !oldName.startsWith('__NEW_ROW_')) {
      alert(`Row name "${newName}" already exists. Please choose a different name.`);
      return false;
    }
    
    setPayslipData(prev => {
      // Update customRows
      const newCustomRows = prev.customRows.map(row => 
        row === oldName ? newName.trim() : row
      );
      
      // Update monthly data
      const newMonths = { ...prev.months };
      for (let i = 0; i < 12; i++) {
        const monthData = { ...newMonths[i] };
        if (monthData[oldName] !== undefined) {
          monthData[newName.trim()] = monthData[oldName];
          delete monthData[oldName];
        }
        newMonths[i] = monthData;
      }
      
      // Update totals
      const newTotals = { ...prev.totals };
      if (newTotals[oldName] !== undefined) {
        newTotals[newName.trim()] = newTotals[oldName];
        delete newTotals[oldName];
      }
      
      // Update groups
      const newGroups = prev.groups.map(group => ({
        ...group,
        rows: group.rows.map(row => row === oldName ? newName.trim() : row)
      }));
      
      return {
        ...prev,
        customRows: newCustomRows,
        months: newMonths,
        totals: newTotals,
        groups: newGroups
      };
    });
    
    return true;
  };

  // Start editing row name
  const startEditingRowName = (rowName: string) => {
    console.log('=== START EDITING ===');
    console.log('Row to edit:', rowName);
    console.log('Current editingRowName:', editingRowName);
    console.log('Current tempRowName:', tempRowName);
    
    setEditingRowName(rowName);
    // If it's a temporary row, start with empty name
    if (rowName.startsWith('__NEW_ROW_')) {
      setTempRowName('');
      console.log('Set tempRowName to empty for new row');
    } else {
      setTempRowName(rowName);
      console.log('Set tempRowName to:', rowName);
    }
    
    console.log('=== END START EDITING ===');
  };

  // Finish editing row name
  const finishEditingRowName = () => {
    if (editingRowName && tempRowName.trim()) {
      // For new rows or any renaming, call renameRow
      const success = renameRow(editingRowName, tempRowName.trim());
      if (success) {
        setEditingRowName(null);
        setTempRowName('');
      }
    } else if (editingRowName && !tempRowName.trim()) {
      // If no name provided, handle appropriately
      if (editingRowName.startsWith('__NEW_ROW_')) {
        // Delete new unnamed rows
        deleteRowCompletely(editingRowName);
      }
      setEditingRowName(null);
      setTempRowName('');
    } else {
      setEditingRowName(null);
      setTempRowName('');
    }
  };

  // Cancel editing row name
  const cancelEditingRowName = () => {
    // If canceling edit on a new temporary row, delete it
    if (editingRowName && editingRowName.startsWith('__NEW_ROW_')) {
      deleteRowCompletely(editingRowName);
    }
    setEditingRowName(null);
    setTempRowName('');
  };

  // Get display name for row (handle temp rows)
  const getDisplayRowName = (rowName: string): string => {
    if (!rowName) {
      return '[NO NAME]';
    }
    if (rowName.startsWith('__NEW_ROW_')) {
      return 'New Row - Click Edit to name';
    }
    return rowName;
  };

  // Update group
  const updateGroup = (groupId: string, updates: Partial<PayslipGroup>) => {
    setPayslipData(prev => ({
      ...prev,
      groups: prev.groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      )
    }));
  };

  // Add subheader
  const addSubHeader = () => {
    const newSubHeader: CustomSubHeader = {
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

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Save function
  const handleSave = () => {
    try {
      localStorage.setItem(`annual-payslip-${payslipData.personId}`, JSON.stringify(payslipData));
      alert('Payslip data saved successfully!');
    } catch (error) {
      alert('Error saving payslip data');
    }
  };

  return (
    <Container>
      <Title>📊 Annual Excel View - Enhanced Editor</Title>
      
      <ControlPanel>
        <InputGroup>
          <Label>Person Type Filter:</Label>
          <Select 
            value={selectedPersonType} 
            onChange={(e) => setSelectedPersonType(e.target.value as any)}
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
            onChange={(e) => handlePersonChange(e.target.value)}
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
          <Label>📋 Select Template:</Label>
          <Select 
            value={selectedTemplate?.id || ''} 
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value);
              setSelectedTemplate(template || null);
              
              // Sync selection across views
              if (template) {
                viewSync.setSelectedTemplate(template.id);
                applyTemplateToPayslip(template);
                console.log('📊 Excel View: Template selected and synced to Basic View:', template.name);
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
                    color: template.type === 'basic' ? '#1565c0' : template.type === 'annual' ? '#7b1fa2' : '#e65100'
                  }}
                >
                  {template.type === 'basic' ? '📝 Basic: ' : template.type === 'annual' ? '📊 Advanced: ' : '⚡ Custom: '}
                  {template.name?.replace('📝 ', '').replace('📊 ', '').replace('⚡ ', '') || 'Unnamed Template'}
                  {template.type === 'basic' && ' - Monthly Payslip'}
                  {template.type === 'annual' && ' - Annual Excel Report'}
                  {template.type === 'custom' && ' - Custom Template'}
                </option>
              ) : null
            ))}
          </Select>
          {selectedTemplate ? (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              backgroundColor: selectedTemplate.type === 'basic' ? '#e3f2fd' : selectedTemplate.type === 'annual' ? '#f3e5f5' : '#fff3e0',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedTemplate.type === 'basic' ? '#1565c0' : selectedTemplate.type === 'annual' ? '#7b1fa2' : '#e65100'
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
                🔄 Synced with Basic View
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
              📝 Basic Template - For monthly payslips
              <br />
              📊 Annual Template - For yearly Excel-style reports
            </div>
          )}
        </InputGroup>

        <InputGroup>
          <Label>Year:</Label>
          <Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2022, 2023, 2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label style={{ color: '#f44336' }}>Fresh Start:</Label>
          <Button 
            onClick={() => {
              if (selectedPerson && window.confirm(`Reset all data for ${selectedPerson.personalInfo?.fullName}? This will create a completely fresh template with all values at 0.`)) {
                const freshData = createFreshPersonalizedTemplate(selectedPerson);
                setPayslipData(freshData);
                // Remove saved data
                localStorage.removeItem(`annual-payslip-${selectedPerson.id}`);
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
            <HeaderInput
              type="text"
              placeholder="Main Title"
              value={payslipData.header.title}
              onChange={(e) => updateHeader('title', e.target.value)}
            />
            <HeaderInput
              type="text"
              placeholder="Subtitle"
              value={payslipData.header.subtitle}
              onChange={(e) => updateHeader('subtitle', e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <HeaderInput
                type="text"
                placeholder="Company Name"
                value={payslipData.header.companyInfo.name}
                onChange={(e) => updateCompanyInfo('name', e.target.value)}
              />
              <HeaderInput
                type="text"
                placeholder="Phone"
                value={payslipData.header.companyInfo.phone}
                onChange={(e) => updateCompanyInfo('phone', e.target.value)}
              />
            </div>
            <HeaderInput
              type="text"
              placeholder="Address"
              value={payslipData.header.companyInfo.address}
              onChange={(e) => updateCompanyInfo('address', e.target.value)}
            />
            <HeaderInput
              type="email"
              placeholder="Email"
              value={payslipData.header.companyInfo.email}
              onChange={(e) => updateCompanyInfo('email', e.target.value)}
            />
          </HeaderEditor>

          {/* SubHeaders Editor */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>📊 Sub Headers</h4>
              <Button onClick={addSubHeader}>+ Add Sub Header</Button>
            </div>
            {safeArray(payslipData.subHeaders).map((subHeader, index) => (
              <SubHeaderEditor key={subHeader.id}>
                <h5>Sub Header {index + 1}</h5>
                {safeArray(subHeader.sections).map(section => (
                  <div key={section.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Label"
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
                      style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
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
                      style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
                    />
                  </div>
                ))}
              </SubHeaderEditor>
            ))}
          </div>

          {/* Groups Editor */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>📁 Groups Management</h4>
              <Button onClick={addGroup}>+ Add Group</Button>
            </div>
            {safeArray(payslipData.groups).map(group => (
              <GroupEditor key={group.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                    style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontWeight: 'bold', flex: 1 }}
                  />
                  <Button 
                    onClick={() => addRowToGroup(group.id)}
                    style={{ backgroundColor: '#2196f3', fontSize: '12px', padding: '6px 12px' }}
                  >
                    + Add Row
                  </Button>
                  <Button 
                    onClick={() => updateGroup(group.id, { isCollapsed: !group.isCollapsed })}
                    style={{ backgroundColor: group.isCollapsed ? '#ff9800' : '#4caf50', fontSize: '12px', padding: '6px 12px' }}
                  >
                    {group.isCollapsed ? 'Expand' : 'Collapse'}
                  </Button>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    Rows in this group ({safeArray(group.rows).length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {safeArray(group.rows).map(row => (
                      <div key={row} style={{
                        padding: '4px 8px',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {editingRowName === row ? (
                          <input
                            type="text"
                            value={tempRowName}
                            onChange={(e) => setTempRowName(e.target.value)}
                            onBlur={finishEditingRowName}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                finishEditingRowName();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEditingRowName();
                              }
                            }}
                            placeholder="Enter row name..."
                            autoFocus
                            style={{
                              flex: 1,
                              padding: '2px 4px',
                              border: '1px solid #2196f3',
                              borderRadius: '2px',
                              fontSize: '11px',
                              fontFamily: 'inherit'
                            }}
                          />
                        ) : (
                          <span 
                            style={{ 
                              flex: 1, 
                              cursor: 'default' 
                            }}
                            title="Use the edit button to rename this row"
                          >
                            {getDisplayRowName(row)}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            console.log('=== TEMPLATE EDITOR BUTTON CLICKED ===');
                            console.log('Button clicked for row:', row);
                            e.stopPropagation();
                            e.preventDefault();
                            try {
                              startEditingRowName(row);
                            } catch (error) {
                              console.error('Error in startEditingRowName:', error);
                            }
                          }}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '3px 6px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginLeft: '6px',
                            position: 'relative',
                            zIndex: 10000,
                            pointerEvents: 'auto',
                            display: 'block',
                            isolation: 'isolate'
                          }}
                          title="Click to edit row name"
                        >
                          ✏️ Edit
                        </button>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              moveRowToGroup(row, group.id, e.target.value);
                              e.target.value = ''; // Reset selection
                            }
                          }}
                          style={{
                            fontSize: '9px',
                            padding: '1px 2px',
                            border: '1px solid #ccc',
                            borderRadius: '2px'
                          }}
                          title={`Move "${row}" to another group`}
                        >
                          <option value="">Move to...</option>
                          {payslipData.groups
                            .filter(g => g.id !== group.id)
                            .map(targetGroup => (
                              <option key={targetGroup.id} value={targetGroup.id}>
                                {targetGroup.name}
                              </option>
                            ))}
                          <option value="ungrouped">Ungrouped</option>
                        </select>
                        <button
                          onClick={() => removeRowFromGroup(group.id, row)}
                          style={{
                            background: '#ff5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            padding: '2px 4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          title={`Remove "${row}" from ${group.name}`}
                        >
                          ×
                        </button>
                        <button
                          onClick={() => deleteRowCompletely(row)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            padding: '2px 4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          title={`Delete "${row}" completely`}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GroupEditor>
            ))}
          </div>

          {/* Row Management */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>📋 Row Management</h4>
              <Button onClick={addCustomRow}>+ Add Row</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {safeArray(payslipData.customRows).map((row, index) => (
                <div key={index} style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {editingRowName === row ? (
                    <input
                      type="text"
                      value={tempRowName}
                      onChange={(e) => setTempRowName(e.target.value)}
                      onBlur={finishEditingRowName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          finishEditingRowName();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEditingRowName();
                        }
                      }}
                      placeholder="Enter row name..."
                      autoFocus
                      style={{ 
                        flex: 1, 
                        border: '1px solid #2196f3', 
                        padding: '4px',
                        borderRadius: '3px',
                        fontWeight: 'bold' 
                      }}
                    />
                  ) : (
                    <span
                      style={{ 
                        flex: 1, 
                        fontWeight: 'bold', 
                        cursor: 'default',
                        padding: '4px'
                      }}
                      title="Use the edit button to rename this row"
                    >
                      {getDisplayRowName(row)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      console.log('=== ROW MANAGEMENT BUTTON CLICKED ===');
                      console.log('Button clicked for row:', row);
                      e.stopPropagation();
                      e.preventDefault();
                      try {
                        startEditingRowName(row);
                      } catch (error) {
                        console.error('Error in startEditingRowName:', error);
                      }
                    }}
                    style={{
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginLeft: '8px',
                      position: 'relative',
                      zIndex: 10000,
                      pointerEvents: 'auto'
                    }}
                    title="Click to edit row name"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteRowCompletely(row)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '4px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                    title="Delete row completely"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TemplateEditor>
      )}

      <PayslipSheet>
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(safeArray(subHeader.sections).length, 4)}, 1fr)`, 
              gap: '15px' 
            }}>
              {safeArray(subHeader.sections).map(section => (
                <div key={section.id}>
                  <strong>{section.label}:</strong>
                  <div style={{ marginTop: '5px' }}>{section.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Person Info - Editable */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px'
        }}>
          <div>
            <strong>Name:</strong>
            {editMode ? (
              <input
                type="text"
                value={payslipData.personName}
                onChange={(e) => setPayslipData(prev => ({ ...prev, personName: e.target.value }))}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '10px' }}>{payslipData.personName}</span>
            )}
          </div>
          <div>
            <strong>ID:</strong>
            {editMode ? (
              <input
                type="text"
                value={payslipData.personId}
                onChange={(e) => setPayslipData(prev => ({ ...prev, personId: e.target.value }))}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '10px' }}>{payslipData.personId}</span>
            )}
          </div>
          <div>
            <strong>Department:</strong>
            {editMode ? (
              <input
                type="text"
                value={payslipData.department}
                onChange={(e) => setPayslipData(prev => ({ ...prev, department: e.target.value }))}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '10px' }}>{payslipData.department}</span>
            )}
          </div>
          <div>
            <strong>Position:</strong>
            {editMode ? (
              <input
                type="text"
                value={payslipData.position}
                onChange={(e) => setPayslipData(prev => ({ ...prev, position: e.target.value }))}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '10px' }}>{payslipData.position}</span>
            )}
          </div>
        </div>

        {/* Excel Grid */}
        <ExcelGrid>
          {/* Header Row */}
          <Cell isHeader>DESCRIPTION</Cell>
          {monthNames.map(month => (
            <Cell key={month} isHeader>{month}</Cell>
          ))}
          <Cell isHeader>TOTAL</Cell>

          {/* Data Rows organized by Groups */}
          {safeArray(payslipData.groups).map(group => (
            <React.Fragment key={group.id}>
              {/* Group Header with Add Row Button */}
              <Cell isGroupHeader colSpan={13}>
                {group.name}
              </Cell>
              {editMode && (
                <Cell isGroupHeader>
                  <button
                    onClick={() => addRowToGroup(group.id)}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    title={`Add new row to ${group.name}`}
                  >
                    + Row
                  </button>
                </Cell>
              )}
              {!editMode && <Cell isGroupHeader></Cell>}
              
              {/* Group Rows */}
              {!group.isCollapsed && safeArray(group.rows).map(row => (
                <React.Fragment key={row}>
                  <Cell>
                    {editingRowName === row ? (
                      (() => {
                        console.log('=== RENDERING INPUT ===');
                        console.log('editingRowName:', editingRowName);
                        console.log('row:', row);
                        console.log('tempRowName:', tempRowName);
                        return true;
                      })() && 
                      <input
                        type="text"
                        value={tempRowName}
                        onChange={(e) => setTempRowName(e.target.value)}
                        onBlur={finishEditingRowName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            finishEditingRowName();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEditingRowName();
                          }
                        }}
                        placeholder="Enter row name..."
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: '2px solid #2196f3',
                          borderRadius: '3px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          backgroundColor: '#f0f8ff'
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          cursor: 'default'
                        }}
                        title="Use the edit button to rename this row"
                      >
                        <span 
                          style={{ 
                            flex: 1,
                            color: row.startsWith('__NEW_ROW_') ? '#999' : 'inherit',
                            fontStyle: row.startsWith('__NEW_ROW_') ? 'italic' : 'normal',
                            pointerEvents: 'none',
                            userSelect: 'none'
                          }}
                        >
                          {getDisplayRowName(row)}
                        </span>
                        <button
                          onClick={(e) => {
                            console.log('=== EXCEL GRID BUTTON CLICKED ===');
                            console.log('Button clicked for row:', row);
                            console.log('Edit mode:', editMode);
                            e.stopPropagation();
                            e.preventDefault();
                            try {
                              startEditingRowName(row);
                            } catch (error) {
                              console.error('Error in startEditingRowName:', error);
                            }
                          }}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginLeft: '8px',
                            position: 'relative',
                            zIndex: 10000,
                            pointerEvents: 'auto',
                            display: 'block',
                            isolation: 'isolate'
                          }}
                          title="Click to edit row name"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                  </Cell>
                  {monthNames.map((_, monthIndex) => (
                    <Cell key={monthIndex} isEditable>
                      <CellInput
                        type="number"
                        value={payslipData.months[monthIndex]?.[row] || 0}
                        onChange={(e) => handleCellChange(monthIndex, row, e.target.value)}
                      />
                    </Cell>
                  ))}
                  <Cell isTotal>
                    {(payslipData.totals[row] || 0).toLocaleString()}
                  </Cell>
                </React.Fragment>
              ))}
              
              {/* Add Row Button for expanded groups */}
              {!group.isCollapsed && editMode && (
                <React.Fragment>
                  <Cell style={{ backgroundColor: '#e8f5e8', border: '1px dashed #4caf50' }}>
                    <button
                      onClick={() => addRowToGroup(group.id)}
                      style={{
                        background: 'transparent',
                        color: '#4caf50',
                        border: '1px dashed #4caf50',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '100%'
                      }}
                    >
                      + Add Row to {group.name}
                    </button>
                  </Cell>
                  {monthNames.map((_, monthIndex) => (
                    <Cell key={monthIndex} style={{ backgroundColor: '#f0f8f0', border: '1px dashed #4caf50' }}>
                      <span style={{ color: '#999', fontSize: '11px' }}>0</span>
                    </Cell>
                  ))}
                  <Cell style={{ backgroundColor: '#f0f8f0', border: '1px dashed #4caf50' }}>
                    <span style={{ color: '#999', fontSize: '11px' }}>0</span>
                  </Cell>
                </React.Fragment>
              )}
            </React.Fragment>
          ))}

          {/* Ungrouped Rows */}
          {payslipData.customRows
            .filter(row => !payslipData.groups.some(group => group.rows.includes(row)))
            .length > 0 && (
            <>
              <Cell isGroupHeader colSpan={13}>
                UNGROUPED ROWS
              </Cell>
              <Cell isGroupHeader></Cell>
            </>
          )}
          
          {payslipData.customRows
            .filter(row => !payslipData.groups.some(group => group.rows.includes(row)))
            .map(row => (
              <React.Fragment key={row}>
                <Cell>
                  {editingRowName === row ? (
                    (() => {
                      console.log('=== RENDERING INPUT (UNGROUPED) ===');
                      console.log('editingRowName:', editingRowName);
                      console.log('row:', row);
                      console.log('tempRowName:', tempRowName);
                      return true;
                    })() && 
                    <input
                      type="text"
                      value={tempRowName}
                      onChange={(e) => setTempRowName(e.target.value)}
                      onBlur={finishEditingRowName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          finishEditingRowName();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEditingRowName();
                        }
                      }}
                      placeholder="Enter row name..."
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '2px solid #2196f3',
                        borderRadius: '3px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        backgroundColor: '#f0f8ff'
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          flex: 1,
                          cursor: 'default',
                          pointerEvents: 'none',
                          userSelect: 'none'
                        }}
                        title="Use the edit button to rename this row"
                      >
                        {getDisplayRowName(row)}
                      </span>
                      <button
                        onClick={(e) => {
                          console.log('=== UNGROUPED BUTTON CLICKED ===');
                          console.log('Button clicked for row:', row);
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            startEditingRowName(row);
                          } catch (error) {
                            console.error('Error in startEditingRowName:', error);
                          }
                        }}
                        style={{
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          marginLeft: '8px',
                          position: 'relative',
                          zIndex: 10000,
                          pointerEvents: 'auto'
                        }}
                        title="Click to edit row name"
                      >
                        ✏️ Edit
                      </button>
                      {editMode && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              moveRowToGroup(row, null, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          style={{
                            fontSize: '9px',
                            padding: '1px 2px',
                            border: '1px solid #ccc',
                            borderRadius: '2px'
                          }}
                          title={`Move "${row}" to a group`}
                        >
                          <option value="">Move to...</option>
                          {payslipData.groups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {editMode && (
                        <button
                          onClick={() => deleteRowCompletely(row)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            padding: '2px 4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          title={`Delete "${row}" completely`}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </Cell>
                {monthNames.map((_, monthIndex) => (
                  <Cell key={monthIndex} isEditable>
                    <CellInput
                      type="number"
                      value={payslipData.months[monthIndex]?.[row] || 0}
                      onChange={(e) => handleCellChange(monthIndex, row, e.target.value)}
                    />
                  </Cell>
                ))}
                <Cell isTotal>
                  {(payslipData.totals[row] || 0).toLocaleString()}
                </Cell>
              </React.Fragment>
            ))}
        </ExcelGrid>

        {/* Summary */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#fff3e0', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#e65100' }}>Annual Summary for {selectedYear}</h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
            Total Net Pay: {(payslipData.totals['Net Salary'] || 0).toLocaleString()} 
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </PayslipSheet>
    </Container>
  );
};

export default MonthlyPayslipGenerator;