import React, { useState, useEffect, useCallback } from 'react';
import { PayslipTemplate, TemplateSubHeader, SectionDefinition, FieldDefinition } from '../types/PayslipTypes';
import { PersonProfile, PERSON_TYPE_CONFIG } from '../types/PersonTypes';
import { personManager } from '../utils/personManager';
import { templateSync } from '../utils/templateSync';

interface EnhancedTemplateBuilderProps {
  onTemplateSelect?: (template: PayslipTemplate) => void;
}

export const EnhancedTemplateBuilder: React.FC<EnhancedTemplateBuilderProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PayslipTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'header' | 'sections' | 'styling' | 'preview' | 'persons'>('templates');
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe array getter with fallback
  const safeArray = useCallback(<T,>(arr: T[] | undefined | null): T[] => {
    return Array.isArray(arr) ? arr : [];
  }, []);

  // Load persons with error handling
  const loadPersons = useCallback(() => {
    try {
      const loadedPersons = personManager.getAllPersons();
      setPersons(safeArray(loadedPersons));
      if (safeArray(loadedPersons).length > 0) {
        setSelectedPerson(loadedPersons[0]);
      }
    } catch (error) {
      console.error('Error loading persons:', error);
      setPersons([]);
    }
  }, [safeArray]);

  // Create basic template with safe structure
  const createBasicTemplate = useCallback((): PayslipTemplate => ({
    id: 'basic-template',
    name: '📝 Basic Payslip Template',
    version: '1.0',
    description: 'Simple payslip template with essential fields - ready to use with one click',
    type: 'basic',
    compatibleViews: ['basic', 'excel'],
    header: {
      id: 'basic-header',
      title: 'PAYSLIP',
      subtitle: 'Employee Pay Statement',
      companyInfo: {
        name: 'Company Name',
        address: 'Company Address',
        phone: 'Phone Number',
        email: 'Email Address'
      },
      styling: {
        titleColor: '#1565c0',
        subtitleColor: '#666',
        backgroundColor: '#f8f9fa',
        fontSize: { title: 24, subtitle: 14, info: 12 },
        alignment: 'center'
      }
    },
    subHeaders: [
      {
        id: 'basic-subheader',
        sections: [
          { id: 'pay-period', label: 'Pay Period', value: '', type: 'text', editable: true },
          { id: 'pay-date', label: 'Pay Date', value: '', type: 'date', editable: true }
        ]
      }
    ],
    sections: [
      {
        id: 'employee-info',
        title: 'Employee Information',
        type: 'static',
        fields: [
          { id: 'emp-name', label: 'Full Name', type: 'text', required: true },
          { id: 'emp-id', label: 'Employee ID', type: 'text', required: true },
          { id: 'emp-dept', label: 'Department', type: 'text', required: false },
          { id: 'emp-position', label: 'Position', type: 'text', required: false }
        ],
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'earnings',
        title: 'Earnings',
        type: 'dynamic',
        fields: [
          { id: 'basic-salary', label: 'Basic Salary', type: 'number', required: true },
          { id: 'allowances', label: 'Allowances', type: 'number', required: false },
          { id: 'overtime', label: 'Overtime Pay', type: 'number', required: false }
        ],
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'deductions',
        title: 'Deductions',
        type: 'dynamic',
        fields: [
          { id: 'tax', label: 'Income Tax', type: 'number', required: false },
          { id: 'social-security', label: 'Social Security', type: 'number', required: false },
          { id: 'insurance', label: 'Insurance', type: 'number', required: false }
        ],
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'summary',
        title: 'Pay Summary',
        type: 'static',
        fields: [
          { id: 'gross-pay', label: 'Gross Pay', type: 'formula', formula: 'basic-salary + allowances + overtime', readonly: true },
          { id: 'total-deductions', label: 'Total Deductions', type: 'formula', formula: 'tax + social-security + insurance', readonly: true },
          { id: 'net-pay', label: 'Net Pay', type: 'formula', formula: 'gross-pay - total-deductions', readonly: true }
        ],
        canAddFields: false,
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
  }), [safeArray]);

  // Create advanced template with safe structure  
  const createAdvancedTemplate = useCallback((): PayslipTemplate => ({
    id: 'custom-template',
    name: '⚡ Advanced Payslip Template',
    version: '1.0',
    description: 'Comprehensive payslip template with advanced features - works in both Basic and Excel views',
    type: 'advanced',
    compatibleViews: ['basic', 'excel'],
    header: {
      id: 'custom-header',
      title: 'ANNUAL PAYROLL STATEMENT',
      subtitle: 'Complete Yearly Financial Report',
      logo: '',
      companyInfo: {
        name: 'Annual Reports Corp.',
        address: '456 Annual Drive, Excel City, State 67890',
        phone: '+1 (555) 987-6543',
        email: 'annual@company.com',
        website: 'www.annualreports.com'
      },
      styling: {
        titleColor: '#2e7d32',
        subtitleColor: '#4caf50',
        backgroundColor: '#e8f5e8',
        fontSize: { title: 32, subtitle: 18, info: 14 },
        alignment: 'center'
      }
    },
    subHeaders: [
      {
        id: 'period-info',
        sections: [
          { id: 'reporting-year', label: 'Reporting Year', value: new Date().getFullYear().toString(), type: 'text', editable: true },
          { id: 'pay-frequency', label: 'Pay Frequency', value: 'Monthly', type: 'text', editable: true },
          { id: 'generated-date', label: 'Report Generated', value: new Date().toLocaleDateString(), type: 'date', editable: true },
          { id: 'report-type', label: 'Report Type', value: 'Annual Summary', type: 'text', editable: true }
        ],
        styling: {
          backgroundColor: '#e1f5fe',
          textColor: '#01579b',
          borderStyle: '2px solid #0277bd'
        }
      }
    ],
    sections: [
      {
        id: 'employee-details',
        title: 'Employee Details',
        type: 'static',
        fields: [
          { id: 'emp-name', label: 'Full Name', type: 'text', required: true },
          { id: 'emp-id', label: 'Employee ID', type: 'text', required: true },
          { id: 'emp-dept', label: 'Department', type: 'text', required: false },
          { id: 'emp-position', label: 'Position', type: 'text', required: false },
          { id: 'emp-start-date', label: 'Start Date', type: 'date', required: false },
          { id: 'emp-status', label: 'Employment Status', type: 'text', required: false }
        ],
        canAddFields: true,
        canRemove: false,
        styling: {
          backgroundColor: '#f3e5f5',
          textColor: '#4a148c',
          borderColor: '#7b1fa2',
          headerStyle: 'bold'
        }
      },
      {
        id: 'earnings',
        title: 'Annual Earnings & Allowances',
        type: 'dynamic',
        fields: [
          { id: 'annual-basic', label: 'Annual Basic Salary', type: 'number', required: true },
          { id: 'housing-allowance', label: 'Housing Allowance', type: 'number', required: false },
          { id: 'transport-allowance', label: 'Transport Allowance', type: 'number', required: false },
          { id: 'performance-bonus', label: 'Performance Bonus', type: 'number', required: false },
          { id: 'overtime-total', label: 'Total Overtime', type: 'number', required: false }
        ],
        canAddFields: true,
        canRemove: false,
        styling: {
          backgroundColor: '#e8f5e8',
          textColor: '#1b5e20',
          borderColor: '#2e7d32'
        }
      },
      {
        id: 'deductions',
        title: 'Annual Deductions & Taxes',
        type: 'dynamic',
        fields: [
          { id: 'income-tax', label: 'Annual Income Tax', type: 'number', required: false },
          { id: 'social-security', label: 'Social Security', type: 'number', required: false },
          { id: 'health-insurance', label: 'Health Insurance', type: 'number', required: false },
          { id: 'pension', label: 'Pension Contribution', type: 'number', required: false },
          { id: 'other-deductions', label: 'Other Deductions', type: 'number', required: false }
        ],
        canAddFields: true,
        canRemove: false,
        styling: {
          backgroundColor: '#ffebee',
          textColor: '#c62828',
          borderColor: '#d32f2f'
        }
      },
      {
        id: 'summary',
        title: 'Annual Summary',
        type: 'static',
        fields: [
          { id: 'gross-annual', label: 'Gross Annual Salary', type: 'formula', formula: 'annual-basic + housing-allowance + transport-allowance + performance-bonus + overtime-total', readonly: true },
          { id: 'total-deductions', label: 'Total Annual Deductions', type: 'formula', formula: 'income-tax + social-security + health-insurance + pension + other-deductions', readonly: true },
          { id: 'net-annual', label: 'Net Annual Salary', type: 'formula', formula: 'gross-annual - total-deductions', readonly: true },
          { id: 'monthly-average', label: 'Average Monthly Net', type: 'formula', formula: 'net-annual / 12', readonly: true }
        ],
        canAddFields: false,
        canRemove: false,
        styling: {
          backgroundColor: '#fff3e0',
          textColor: '#e65100',
          borderColor: '#f57c00',
          headerStyle: 'bold'
        }
      }
    ],
    tables: [
      {
        id: 'monthly-breakdown',
        title: 'Monthly Breakdown',
        columns: [
          { id: 'month', header: 'Month', type: 'text' },
          { id: 'basic', header: 'Basic Salary', type: 'number' },
          { id: 'allowances', header: 'Allowances', type: 'number' },
          { id: 'overtime', header: 'Overtime', type: 'number' },
          { id: 'deductions', header: 'Deductions', type: 'number' },
          { id: 'net', header: 'Net Pay', type: 'formula', formula: 'basic + allowances + overtime - deductions', readonly: true }
        ],
        rows: [],
        canAddColumns: true,
        canAddRows: true,
        canRemoveColumns: true,
        canRemoveRows: true
      },
      {
        id: 'tax-summary',
        title: 'Annual Tax Summary',
        columns: [
          { id: 'tax-type', header: 'Tax Type', type: 'text' },
          { id: 'rate', header: 'Rate %', type: 'number' },
          { id: 'taxable-amount', header: 'Taxable Amount', type: 'number' },
          { id: 'tax-amount', header: 'Tax Amount', type: 'formula', formula: 'taxable-amount * rate / 100', readonly: true }
        ],
        rows: [],
        canAddColumns: true,
        canAddRows: true,
        canRemoveColumns: true,
        canRemoveRows: true
      }
    ],
    globalFormulas: {},
    styling: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: 14,
      primaryColor: '#2e7d32',
      secondaryColor: '#f1f8e9',
      borderStyle: 'solid'
    },
    layout: {
      columnsPerRow: 2,
      sectionSpacing: 20,
      printOrientation: 'portrait'
    },
    isEditable: true,
    createdDate: new Date(),
    lastModified: new Date()
  }), [safeArray]);

  // Initialize default templates if none exist
  const initializeDefaultTemplates = useCallback(() => {
    const basicTemplate = createBasicTemplate();
    const advancedTemplate = createAdvancedTemplate();
    
    // Add default templates to sync
    templateSync.addTemplate(basicTemplate);
    templateSync.addTemplate(advancedTemplate);
    
    return [basicTemplate, advancedTemplate];
  }, [createBasicTemplate, createAdvancedTemplate]);

  // Load templates using unified sync service
  const loadTemplates = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🎨 Template Builder: Loading templates via TemplateSync');
      let loadedTemplates = templateSync.getAllTemplates();
      
      // If no templates exist, initialize with defaults
      if (loadedTemplates.length === 0) {
        console.log('🎨 Template Builder: No templates found, initializing defaults');
        loadedTemplates = initializeDefaultTemplates();
      }
      
      setTemplates(loadedTemplates);
      console.log(`✅ Template Builder: Loaded ${loadedTemplates.length} synchronized templates`);
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [initializeDefaultTemplates]);

  // Initialize on mount and subscribe to template changes
  useEffect(() => {
    loadTemplates();
    loadPersons();
    
    // Subscribe to template changes from other views
    const unsubscribe = templateSync.subscribe(() => {
      console.log('🎨 Template Builder: Received template sync notification');
      loadTemplates();
    });
    
    return unsubscribe;
  }, [loadTemplates, loadPersons]);

  // Safe template update function using unified sync
  const saveTemplate = useCallback((template: PayslipTemplate) => {
    if (!template || !template.id) return;
    try {
      console.log('🎨 Template Builder: Saving template via TemplateSync:', template.name);
      
      // Update local state immediately for responsiveness
      const updatedTemplates = safeArray(templates).map(t => t.id === template.id ? template : t);
      setTemplates(updatedTemplates);
      
      // Save via unified sync service (this will notify all other views)
      templateSync.addTemplate(template);
      
      console.log('✅ Template Builder: Template saved and synchronized');
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    }
  }, [templates, safeArray]);

  const createNewTemplate = useCallback(() => {
    try {
      const newTemplate: PayslipTemplate = {
        ...createBasicTemplate(),
        id: `template-${Date.now()}`,
        name: 'New Custom Template',
        type: 'advanced',
        compatibleViews: ['basic', 'excel'],
        description: 'Custom payslip template'
      };
      
      console.log('🎨 Template Builder: Creating new template via TemplateSync');
      
      // Update local state immediately
      const updatedTemplates = [...safeArray(templates), newTemplate];
      setTemplates(updatedTemplates);
      setCurrentTemplate(newTemplate);
      
      // Save via unified sync service (this will make it available in all views)
      templateSync.addTemplate(newTemplate);
      
      console.log('✅ Template Builder: New template created and synchronized');
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    }
  }, [templates, createBasicTemplate, safeArray]);

  // Safe update functions with null checks
  const updateHeader = useCallback((field: string, value: any) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      header: { ...currentTemplate.header, [field]: value },
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate]);

  const updateCompanyInfo = useCallback((field: string, value: string) => {
    if (!currentTemplate || !currentTemplate.header.companyInfo) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      header: {
        ...currentTemplate.header,
        companyInfo: { ...currentTemplate.header.companyInfo, [field]: value }
      },
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate]);

  const updateHeaderStyling = useCallback((field: string, value: any) => {
    if (!currentTemplate || !currentTemplate.header.styling) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      header: {
        ...currentTemplate.header,
        styling: { ...currentTemplate.header.styling, [field]: value }
      },
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate]);

  const addSubHeader = useCallback(() => {
    if (!currentTemplate) return;
    
    const newSubHeader: TemplateSubHeader = {
      id: `subheader-${Date.now()}`,
      sections: [
        { id: 'new-field', label: 'New Field', value: '', type: 'text', editable: true }
      ]
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: [...safeArray(currentTemplate.subHeaders), newSubHeader],
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const updateSubHeader = useCallback((subHeaderId: string, sectionId: string, field: string, value: any) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: safeArray(currentTemplate.subHeaders).map(sh => 
        sh.id === subHeaderId 
          ? {
              ...sh,
              sections: safeArray(sh.sections).map(section =>
                section.id === sectionId ? { ...section, [field]: value } : section
              )
            }
          : sh
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const addSubHeaderSection = useCallback((subHeaderId: string) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: safeArray(currentTemplate.subHeaders).map(sh =>
        sh.id === subHeaderId
          ? {
              ...sh,
              sections: [...safeArray(sh.sections), {
                id: `section-${Date.now()}`,
                label: 'New Field',
                value: '',
                type: 'text' as const,
                editable: true
              }]
            }
          : sh
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const addSection = useCallback(() => {
    if (!currentTemplate) return;
    
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type: 'dynamic',
      fields: [],
      canAddFields: true,
      canRemove: true
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: [...safeArray(currentTemplate.sections), newSection],
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const addFieldToSection = useCallback((sectionId: string) => {
    if (!currentTemplate) return;
    
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: safeArray(currentTemplate.sections).map(section =>
        section.id === sectionId
          ? { ...section, fields: [...safeArray(section.fields), newField] }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const addPersonField = useCallback((sectionId: string, fieldType: 'name' | 'email' | 'id' | 'department' | 'position' | 'salary' | 'phone') => {
    if (!currentTemplate) return;
    
    const fieldConfigs = {
      name: { label: 'Full Name', type: 'text' as const },
      email: { label: 'Email Address', type: 'text' as const },
      id: { label: 'Employee ID', type: 'text' as const },
      department: { label: 'Department', type: 'text' as const },
      position: { label: 'Position', type: 'text' as const },
      salary: { label: 'Basic Salary', type: 'number' as const },
      phone: { label: 'Phone Number', type: 'text' as const }
    };
    
    const config = fieldConfigs[fieldType];
    const newField: FieldDefinition = {
      id: `field-${fieldType}-${Date.now()}`,
      label: config.label,
      type: config.type,
      required: false
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: safeArray(currentTemplate.sections).map(section =>
        section.id === sectionId
          ? { ...section, fields: [...safeArray(section.fields), newField] }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const updateField = useCallback((sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: safeArray(currentTemplate.sections).map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: safeArray(section.fields).map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const removeField = useCallback((sectionId: string, fieldId: string) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: safeArray(currentTemplate.sections).map(section =>
        section.id === sectionId
          ? { ...section, fields: safeArray(section.fields).filter(field => field.id !== fieldId) }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  }, [currentTemplate, saveTemplate, safeArray]);

  const handlePersonChange = useCallback((personId: string) => {
    const person = safeArray(persons).find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
    }
  }, [persons, safeArray]);

  // Handle template use - make it fully functional
  const handleTemplateUse = useCallback((template: PayslipTemplate) => {
    if (!template) return;

    try {
      // Create a comprehensive functional template
      const functionalTemplate: PayslipTemplate = {
        ...template,
        id: `functional-${template.id}-${Date.now()}`,
        name: `${template.name} (Functional Copy)`,
        isEditable: true,
        lastModified: new Date(),
        // Ensure all sections have proper fields
        sections: safeArray(template.sections).map(section => ({
          ...section,
          fields: safeArray(section.fields).length > 0 ? section.fields : [
            { id: `${section.id}-field-1`, label: 'Field 1', type: 'text', required: false },
            { id: `${section.id}-field-2`, label: 'Field 2', type: 'number', required: false }
          ]
        }))
      };

      // Add to templates via unified sync
      const updatedTemplates = [...safeArray(templates), functionalTemplate];
      setTemplates(updatedTemplates);
      
      // Save via unified sync service (this will make it available in all views)
      templateSync.addTemplate(functionalTemplate);
      
      console.log('✅ Template Builder: Functional template created and synchronized');

      // Call the onTemplateSelect callback if provided
      if (onTemplateSelect) {
        onTemplateSelect(functionalTemplate);
      }

      // Show success message
      alert(`✅ Template "${template.name}" is now ready to use!\n\nThe template has been:\n• Made fully functional\n• Added to your templates\n• Ready for customization\n\n${template.type === 'basic' ? '📝 Basic View: Simple payslip for monthly use' : '⚡ Advanced: Full-featured template'}`);

    } catch (error) {
      console.error('Error using template:', error);
      alert('❌ Error using template. Please try again.');
    }
  }, [templates, safeArray, onTemplateSelect]);

  // Safe filtered persons with null checks
  const filteredPersons = React.useMemo(() => {
    const safePeople = safeArray(persons);
    return selectedPersonType === 'all' 
      ? safePeople 
      : safePeople.filter(person => person && person.type === selectedPersonType);
  }, [selectedPersonType, persons, safeArray]);

  // Safe field value getter
  const getFieldValue = useCallback((field: FieldDefinition): string => {
    if (!selectedPerson || !field) return field?.value || `[${field?.type || 'text'}]`;
    
    const fieldLower = (field.label || '').toLowerCase();
    const fieldIdLower = (field.id || '').toLowerCase();
    
    try {
      if (fieldLower.includes('name') || fieldIdLower.includes('name')) {
        return selectedPerson.personalInfo?.fullName || 'N/A';
      } else if (fieldLower.includes('email') || fieldIdLower.includes('email')) {
        return selectedPerson.personalInfo?.email || 'N/A';
      } else if (fieldLower.includes('employee') && (fieldLower.includes('id') || fieldLower.includes('number'))) {
        return selectedPerson.workInfo?.personId || 'N/A';
      } else if (fieldLower.includes('department')) {
        return selectedPerson.workInfo?.department || 'N/A';
      } else if (fieldLower.includes('position') || fieldLower.includes('title') || fieldLower.includes('job')) {
        return selectedPerson.workInfo?.position || selectedPerson.workInfo?.title || 'N/A';
      } else if (fieldLower.includes('salary') || fieldLower.includes('basic')) {
        return selectedPerson.compensation?.baseSalary?.toLocaleString() || 'N/A';
      } else if (fieldLower.includes('phone')) {
        return selectedPerson.personalInfo?.phone || 'N/A';
      }
    } catch (error) {
      console.error('Error getting field value:', error);
    }
    
    return field?.value || `[${field?.type || 'text'}]`;
  }, [selectedPerson]);

  // Styles
  const fieldStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#333'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 20px',
    background: isActive ? '#1565c0' : '#f5f5f5',
    color: isActive ? 'white' : '#666',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginRight: '2px'
  });

  const sectionStyle = {
    marginBottom: '20px',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  };

  // Error display
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#f44336' }}>⚠️ Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            loadTemplates();
            loadPersons();
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#1565c0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading display
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Template Builder...</h2>
        <div style={{ color: '#666' }}>Please wait while we initialize your templates.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1565c0', margin: '0 0 10px 0' }}>
          🎨 Enhanced Template Builder
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Create and customize payslip templates with headers, sections, and styling
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'templates', label: '📋 Templates' },
            { key: 'persons', label: '👥 Select Person' },
            { key: 'header', label: '🏷️ Header & Info' },
            { key: 'sections', label: '📝 Sections & Fields' },
            { key: 'styling', label: '🎨 Styling' },
            { key: 'preview', label: '👁️ Preview' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={tabStyle(activeTab === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2>📋 Available Templates</h2>
              <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
                Ready-to-use templates with all features functional. Click "📋 Use Template" to get started immediately!
              </p>
            </div>
            <button
              onClick={createNewTemplate}
              style={{
                padding: '12px 20px',
                backgroundColor: '#1565c0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Create New Template
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {safeArray(templates).length > 0 ? safeArray(templates).map(template => (
              template && template.id ? (
                <div key={template.id} style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1565c0' }}>{template.name || 'Unnamed Template'}</h3>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: template.type === 'basic' ? '#e3f2fd' : '#fff3e0',
                        color: template.type === 'basic' ? '#1565c0' : '#e65100',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {template.type === 'basic' ? '📝 Basic Template' : '⚡ Advanced Template'} • Works in Both Views
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                    {template.description || 'No description available'}
                  </p>
                  
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                    <div>✅ Fully Functional Template</div>
                    <div>📋 Sections: {safeArray(template.sections).length}</div>
                    <div>📊 Tables: {safeArray(template.tables).length}</div>
                    <div>📅 Last modified: {template.lastModified ? new Date(template.lastModified).toLocaleDateString() : 'Unknown'}</div>
                    {template.type === 'basic' && <div style={{ color: '#1565c0', fontWeight: 'bold', marginTop: '5px' }}>🎯 Perfect for: Simple payslips - works in Basic & Excel view</div>}
                    {template.type === 'advanced' && <div style={{ color: '#e65100', fontWeight: 'bold', marginTop: '5px' }}>⚡ Perfect for: Complex payslips - works in Basic & Excel view</div>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setCurrentTemplate(template);
                        setActiveTab('header');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#1565c0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleTemplateUse(template)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      📋 Use Template
                    </button>
                  </div>
                </div>
              ) : null
            )) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                fontSize: '16px'
              }}>
                No templates available. Create your first template!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'persons' && (
        <div>
          <h2>👥 Select Person for Template Testing</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Choose a person to populate template fields with their information and preview how the template will look.
          </p>
          
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3>Person Filter & Selection</h3>
              <button
                onClick={loadPersons}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Person Type Filter:</label>
                <select 
                  value={selectedPersonType} 
                  onChange={(e) => setSelectedPersonType(e.target.value as any)}
                  style={fieldStyle}
                >
                  <option value="all">🌟 All Types</option>
                  {Object.entries(PERSON_TYPE_CONFIG || {}).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config?.icon || ''} {config?.label || type}s
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Select Person:</label>
                <select 
                  value={selectedPerson?.id || ''} 
                  onChange={(e) => handlePersonChange(e.target.value)}
                  style={fieldStyle}
                >
                  <option value="">Choose Person...</option>
                  {safeArray(filteredPersons).map(person => (
                    person && person.id && person.personalInfo ? (
                      <option key={person.id} value={person.id}>
                        {PERSON_TYPE_CONFIG[person.type]?.icon || ''} {person.personalInfo.fullName || 'Unknown'} - {person.workInfo?.personId || 'No ID'} ({PERSON_TYPE_CONFIG[person.type]?.label || person.type})
                      </option>
                    ) : null
                  ))}
                </select>
              </div>
            </div>

            {selectedPerson && (
              <div style={{
                border: '2px solid #e3f2fd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <h4 style={{ color: '#1565c0', marginBottom: '15px' }}>
                  {PERSON_TYPE_CONFIG[selectedPerson.type]?.icon || ''} Selected {PERSON_TYPE_CONFIG[selectedPerson.type]?.label || selectedPerson.type}: {selectedPerson.personalInfo?.fullName || 'Unknown'}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <strong>Person ID:</strong> {selectedPerson.workInfo?.personId || 'N/A'}
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedPerson.workInfo?.department || 'N/A'}
                  </div>
                  <div>
                    <strong>Position:</strong> {selectedPerson.workInfo?.position || selectedPerson.workInfo?.title || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedPerson.personalInfo?.email || 'N/A'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedPerson.personalInfo?.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedPerson.workInfo?.status || 'N/A'}
                  </div>
                  {selectedPerson.compensation?.baseSalary && (
                    <div>
                      <strong>Base Salary:</strong> {selectedPerson.compensation?.currency || '$'} {selectedPerson.compensation.baseSalary.toLocaleString()}
                    </div>
                  )}
                  {selectedPerson.compensation?.hourlyRate && (
                    <div>
                      <strong>Hourly Rate:</strong> {selectedPerson.compensation?.currency || '$'} {selectedPerson.compensation.hourlyRate.toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                  <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                    💡 <strong>Tip:</strong> This person's information will be used to populate template fields in the Preview tab, 
                    making it easier to see how your template will look with real data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'header' && currentTemplate && (
        <div>
          <h2>🏷️ Header & Company Information</h2>
          
          <div style={sectionStyle}>
            <h3>Header Text</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Main Title</label>
                <input
                  type="text"
                  value={currentTemplate.header?.title || ''}
                  onChange={(e) => updateHeader('title', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  type="text"
                  value={currentTemplate.header?.subtitle || ''}
                  onChange={(e) => updateHeader('subtitle', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>Company Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input
                  type="text"
                  value={currentTemplate.header?.companyInfo?.name || ''}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  value={currentTemplate.header?.companyInfo?.phone || ''}
                  onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={currentTemplate.header?.companyInfo?.address || ''}
                  onChange={(e) => updateCompanyInfo('address', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={currentTemplate.header?.companyInfo?.email || ''}
                  onChange={(e) => updateCompanyInfo('email', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  type="url"
                  value={currentTemplate.header?.companyInfo?.website || ''}
                  onChange={(e) => updateCompanyInfo('website', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>Header Styling</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Title Color</label>
                <input
                  type="color"
                  value={currentTemplate.header?.styling?.titleColor || '#1565c0'}
                  onChange={(e) => updateHeaderStyling('titleColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subtitle Color</label>
                <input
                  type="color"
                  value={currentTemplate.header?.styling?.subtitleColor || '#666'}
                  onChange={(e) => updateHeaderStyling('subtitleColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Background Color</label>
                <input
                  type="color"
                  value={currentTemplate.header?.styling?.backgroundColor || '#f8f9fa'}
                  onChange={(e) => updateHeaderStyling('backgroundColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3>Sub Headers</h3>
              <button
                onClick={addSubHeader}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add Sub Header
              </button>
            </div>
            
            {safeArray(currentTemplate.subHeaders).map((subHeader, index) => (
              subHeader && subHeader.id ? (
                <div key={subHeader.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4>Sub Header {index + 1}</h4>
                    <button
                      onClick={() => addSubHeaderSection(subHeader.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Add Field
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {safeArray(subHeader.sections).map(section => (
                      section && section.id ? (
                        <div key={section.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                          <input
                            type="text"
                            value={section.label || ''}
                            onChange={(e) => updateSubHeader(subHeader.id, section.id, 'label', e.target.value)}
                            style={{ ...fieldStyle, marginBottom: '8px', fontWeight: 'bold' }}
                            placeholder="Field Label"
                          />
                          <input
                            type={section.type || 'text'}
                            value={section.value || ''}
                            onChange={(e) => updateSubHeader(subHeader.id, section.id, 'value', e.target.value)}
                            style={fieldStyle}
                            placeholder="Field Value"
                          />
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sections' && currentTemplate && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2>📝 Sections & Fields</h2>
            <button
              onClick={addSection}
              style={{
                padding: '12px 20px',
                backgroundColor: '#1565c0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Add Section
            </button>
          </div>
          
          {safeArray(currentTemplate.sections).map(section => (
            section && section.id ? (
              <div key={section.id} style={{
                ...sectionStyle,
                border: `2px solid ${section.styling?.borderColor || '#e0e0e0'}`,
                backgroundColor: section.styling?.backgroundColor || '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => {
                      const updatedTemplate = {
                        ...currentTemplate,
                        sections: safeArray(currentTemplate.sections).map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        )
                      };
                      setCurrentTemplate(updatedTemplate);
                      saveTemplate(updatedTemplate);
                    }}
                    style={{
                      ...fieldStyle,
                      fontSize: '18px',
                      fontWeight: 'bold',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid #ddd',
                      minWidth: '200px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => addFieldToSection(section.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Field
                    </button>
                    
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <small style={{ color: '#666', marginRight: '5px' }}>Quick Add:</small>
                      {[
                        { key: 'name', label: '👤 Name' },
                        { key: 'email', label: '📧 Email' },
                        { key: 'id', label: '🆔 ID' },
                        { key: 'department', label: '🏢 Dept' },
                        { key: 'position', label: '💼 Position' },
                        { key: 'salary', label: '💰 Salary' },
                        { key: 'phone', label: '📞 Phone' }
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => addPersonField(section.id, item.key as any)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            border: '1px solid #bbdefb',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                          title={`Add ${item.label} field`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                  {safeArray(section.fields).map(field => (
                    field && field.id ? (
                      <div key={field.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                          <input
                            type="text"
                            value={field.label || ''}
                            onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                            style={{ ...fieldStyle, fontWeight: 'bold', fontSize: '14px', flex: 1 }}
                            placeholder="Field Label"
                          />
                          <button
                            onClick={() => removeField(section.id, field.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '12px' }}>Type</label>
                            <select
                              value={field.type || 'text'}
                              onChange={(e) => updateField(section.id, field.id, { type: e.target.value as any })}
                              style={fieldStyle}
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="select">Select</option>
                              <option value="formula">Formula</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '12px' }}>Default Value</label>
                            <input
                              type="text"
                              value={field.value || ''}
                              onChange={(e) => updateField(section.id, field.id, { value: e.target.value })}
                              style={fieldStyle}
                              placeholder="Default value"
                            />
                          </div>
                        </div>
                        
                        {field.type === 'formula' && (
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ ...labelStyle, fontSize: '12px' }}>Formula</label>
                            <input
                              type="text"
                              value={field.formula || ''}
                              onChange={(e) => updateField(section.id, field.id, { formula: e.target.value })}
                              style={fieldStyle}
                              placeholder="e.g., basic_salary * 0.15"
                            />
                          </div>
                        )}
                        
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                            />
                            Required
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                              type="checkbox"
                              checked={field.readonly || false}
                              onChange={(e) => updateField(section.id, field.id, { readonly: e.target.checked })}
                            />
                            Read Only
                          </label>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}

      {activeTab === 'styling' && currentTemplate && (
        <div>
          <h2>🎨 Template Styling</h2>
          
          <div style={sectionStyle}>
            <h3>Global Styling</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Font Family</label>
                <select
                  value={currentTemplate.styling?.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      styling: { ...currentTemplate.styling, fontFamily: e.target.value }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Calibri, Arial, sans-serif">Calibri</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Font Size</label>
                <input
                  type="number"
                  value={currentTemplate.styling?.fontSize || 12}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      styling: { ...currentTemplate.styling, fontSize: parseInt(e.target.value) || 12 }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Primary Color</label>
                <input
                  type="color"
                  value={currentTemplate.styling?.primaryColor || '#1565c0'}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      styling: { ...currentTemplate.styling, primaryColor: e.target.value }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>Layout Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Columns per Row</label>
                <select
                  value={currentTemplate.layout?.columnsPerRow || 2}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      layout: { ...currentTemplate.layout, columnsPerRow: parseInt(e.target.value) || 2 }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Section Spacing</label>
                <input
                  type="number"
                  value={currentTemplate.layout?.sectionSpacing || 15}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      layout: { ...currentTemplate.layout, sectionSpacing: parseInt(e.target.value) || 15 }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Print Orientation</label>
                <select
                  value={currentTemplate.layout?.printOrientation || 'portrait'}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      layout: { ...currentTemplate.layout, printOrientation: e.target.value as 'portrait' | 'landscape' }
                    };
                    setCurrentTemplate(updatedTemplate);
                    saveTemplate(updatedTemplate);
                  }}
                  style={fieldStyle}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && currentTemplate && (
        <div>
          <h2>👁️ Template Preview</h2>
          
          {selectedPerson && (
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #4caf50'
            }}>
              <p style={{ margin: '0', color: '#2e7d32', fontSize: '14px' }}>
                <strong>🎯 Live Preview:</strong> Showing template with data from {PERSON_TYPE_CONFIG[selectedPerson.type]?.icon || ''} <strong>{selectedPerson.personalInfo?.fullName || 'Unknown'}</strong> ({PERSON_TYPE_CONFIG[selectedPerson.type]?.label || selectedPerson.type}) - Go to "👥 Select Person" tab to change.
              </p>
            </div>
          )}
          
          {!selectedPerson && (
            <div style={{
              backgroundColor: '#fff3e0',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #ff9800'
            }}>
              <p style={{ margin: '0', color: '#e65100', fontSize: '14px' }}>
                <strong>💡 Tip:</strong> Go to "👥 Select Person" tab to choose someone from your database and see the template with real data!
              </p>
            </div>
          )}
          
          <div style={{
            border: '2px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
            backgroundColor: 'white',
            fontFamily: currentTemplate.styling?.fontFamily || 'Arial, sans-serif',
            fontSize: currentTemplate.styling?.fontSize || 12,
            color: '#333'
          }}>
            {/* Header Preview */}
            <div style={{
              backgroundColor: currentTemplate.header?.styling?.backgroundColor || '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: (currentTemplate.header?.styling?.alignment || 'center') as any,
              marginBottom: '20px'
            }}>
              <h1 style={{
                color: currentTemplate.header?.styling?.titleColor || '#1565c0',
                fontSize: currentTemplate.header?.styling?.fontSize?.title || 24,
                margin: '0 0 10px 0'
              }}>
                {currentTemplate.header?.title || 'Template Title'}
              </h1>
              {currentTemplate.header?.subtitle && (
                <h2 style={{
                  color: currentTemplate.header?.styling?.subtitleColor || '#666',
                  fontSize: currentTemplate.header?.styling?.fontSize?.subtitle || 14,
                  margin: '0 0 15px 0'
                }}>
                  {currentTemplate.header.subtitle}
                </h2>
              )}
              <div style={{
                fontSize: currentTemplate.header?.styling?.fontSize?.info || 12,
                color: '#666'
              }}>
                <div>{currentTemplate.header?.companyInfo?.name || 'Company Name'}</div>
                <div>{currentTemplate.header?.companyInfo?.address || 'Company Address'}</div>
                <div>{currentTemplate.header?.companyInfo?.phone || 'Phone'} | {currentTemplate.header?.companyInfo?.email || 'Email'}</div>
                {currentTemplate.header?.companyInfo?.website && (
                  <div>{currentTemplate.header.companyInfo.website}</div>
                )}
              </div>
            </div>

            {/* Sub Headers Preview */}
            {safeArray(currentTemplate.subHeaders).map((subHeader, index) => (
              subHeader && subHeader.id ? (
                <div key={subHeader.id} style={{
                  backgroundColor: subHeader.styling?.backgroundColor || '#f0f0f0',
                  color: subHeader.styling?.textColor || '#333',
                  border: subHeader.styling?.borderStyle || '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(safeArray(subHeader.sections).length, 4)}, 1fr)`,
                  gap: '15px'
                }}>
                  {safeArray(subHeader.sections).map(section => (
                    section && section.id ? (
                      <div key={section.id}>
                        <strong>{section.label || 'Field'}:</strong>
                        <div style={{ marginTop: '5px' }}>
                          {section.value || `[${section.type || 'text'}]`}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              ) : null
            ))}

            {/* Sections Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${currentTemplate.layout?.columnsPerRow || 2}, 1fr)`,
              gap: `${currentTemplate.layout?.sectionSpacing || 15}px`
            }}>
              {safeArray(currentTemplate.sections).map(section => (
                section && section.id ? (
                  <div key={section.id} style={{
                    backgroundColor: section.styling?.backgroundColor || '#f9f9f9',
                    color: section.styling?.textColor || '#333',
                    border: `1px solid ${section.styling?.borderColor || '#ddd'}`,
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <h3 style={{
                      margin: '0 0 15px 0',
                      color: section.styling?.textColor || currentTemplate.styling?.primaryColor || '#1565c0',
                      fontWeight: (section.styling?.headerStyle || 'bold') as any
                    }}>
                      {section.title || 'Section Title'}
                    </h3>
                    {safeArray(section.fields).map(field => (
                      field && field.id ? (
                        <div key={field.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          <span style={{ fontWeight: 'bold' }}>{field.label || 'Field'}:</span>
                          <span>{getFieldValue(field)}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : null
              ))}
            </div>

            {/* Tables Preview */}
            {safeArray(currentTemplate.tables).map(table => (
              table && table.id ? (
                <div key={table.id} style={{ marginTop: '20px' }}>
                  <h3 style={{ color: currentTemplate.styling?.primaryColor || '#1565c0' }}>{table.title || 'Table'}</h3>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #ddd'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: currentTemplate.styling?.primaryColor || '#1565c0', color: 'white' }}>
                        {safeArray(table.columns).map(column => (
                          column && column.id ? (
                            <th key={column.id} style={{
                              padding: '10px',
                              border: '1px solid #ddd',
                              textAlign: 'left'
                            }}>
                              {column.header || 'Column'}
                            </th>
                          ) : null
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {safeArray(table.columns).map(column => (
                          column && column.id ? (
                            <td key={column.id} style={{
                              padding: '8px',
                              border: '1px solid #ddd',
                              color: '#666'
                            }}>
                              [{column.type || 'text'}]
                            </td>
                          ) : null
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTemplateBuilder;