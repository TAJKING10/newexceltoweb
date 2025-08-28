import React, { useState, useEffect } from 'react';
import { PayslipTemplate, TemplateHeader, TemplateSubHeader, SectionDefinition, FieldDefinition, DynamicTable, COMMON_FIELDS } from '../types/PayslipTypes';
import { PersonProfile, PERSON_TYPE_CONFIG } from '../types/PersonTypes';
import { personManager } from '../utils/personManager';

interface EnhancedTemplateBuilderProps {
  onTemplateSelect?: (template: PayslipTemplate) => void;
}

export const EnhancedTemplateBuilder: React.FC<EnhancedTemplateBuilderProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PayslipTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'header' | 'sections' | 'styling' | 'preview' | 'persons'>('templates');
  const [isEditing, setIsEditing] = useState(false);
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other'>('all');

  const loadPersons = () => {
    const loadedPersons = personManager.getAllPersons();
    setPersons(loadedPersons);
    if (loadedPersons.length > 0) {
      setSelectedPerson(loadedPersons[0]);
    }
  };

  const loadTemplates = () => {
    try {
      const savedTemplates = localStorage.getItem('payslip-templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(Array.isArray(parsed) ? parsed : []);
      } else {
        // Create default templates if none exist
        const basicTemplate = createBasicTemplate();
        const customTemplate = createCustomTemplate();
        const defaultTemplates = [basicTemplate, customTemplate];
        setTemplates(defaultTemplates);
        localStorage.setItem('payslip-templates', JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to empty array to prevent crash
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadPersons();
  }, []);

  const createBasicTemplate = (): PayslipTemplate => ({
    id: 'basic-template',
    name: 'Basic Payslip',
    version: '1.0',
    description: 'Simple payslip template with essential fields',
    type: 'basic',
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
        fields: COMMON_FIELDS.employee.slice(0, 4),
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'earnings',
        title: 'Earnings',
        type: 'dynamic',
        fields: COMMON_FIELDS.earnings.slice(0, 3),
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'deductions',
        title: 'Deductions',
        type: 'dynamic',
        fields: COMMON_FIELDS.deductions.slice(0, 3),
        canAddFields: true,
        canRemove: false
      },
      {
        id: 'summary',
        title: 'Summary',
        type: 'static',
        fields: COMMON_FIELDS.summary,
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
  });

  const createCustomTemplate = (): PayslipTemplate => ({
    id: 'custom-template',
    name: 'Advanced Payslip',
    version: '1.0',
    description: 'Comprehensive payslip template with advanced features',
    type: 'custom',
    header: {
      id: 'custom-header',
      title: 'EMPLOYEE PAYROLL STATEMENT',
      subtitle: 'Confidential Salary Information',
      logo: '',
      companyInfo: {
        name: 'Advanced Corporation Ltd.',
        address: '123 Business Park, Suite 100, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'payroll@company.com',
        website: 'www.company.com'
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
          { id: 'pay-period', label: 'Pay Period', value: '', type: 'text', editable: true },
          { id: 'pay-date', label: 'Payment Date', value: '', type: 'date', editable: true },
          { id: 'pay-method', label: 'Payment Method', value: 'Direct Deposit', type: 'text', editable: true },
          { id: 'check-number', label: 'Reference #', value: '', type: 'text', editable: true }
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
        fields: [...COMMON_FIELDS.employee],
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
        title: 'Earnings & Allowances',
        type: 'dynamic',
        fields: [...COMMON_FIELDS.earnings],
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
        title: 'Deductions & Taxes',
        type: 'dynamic',
        fields: [...COMMON_FIELDS.deductions],
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
        title: 'Payment Summary',
        type: 'static',
        fields: [...COMMON_FIELDS.summary],
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
        id: 'overtime-table',
        title: 'Overtime Details',
        columns: [
          { id: 'date', header: 'Date', type: 'text' },
          { id: 'hours', header: 'Hours', type: 'number' },
          { id: 'rate', header: 'Rate', type: 'number' },
          { id: 'amount', header: 'Amount', type: 'formula', formula: 'hours * rate', readonly: true }
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
  });

  const saveTemplate = (template: PayslipTemplate) => {
    try {
      // Direct update since templateManager's updateTemplate uses actions
      // We'll just update our local state and localStorage for now
      const updatedTemplates = templates.map(t => t.id === template.id ? template : t);
      setTemplates(updatedTemplates);
      localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const createNewTemplate = () => {
    const newTemplate: PayslipTemplate = {
      ...createBasicTemplate(),
      id: `template-${Date.now()}`,
      name: 'New Custom Template',
      type: 'custom',
      description: 'Custom payslip template'
    };
    
    try {
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      setCurrentTemplate(newTemplate);
      setIsEditing(true);
      localStorage.setItem('payslip-templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const updateHeader = (field: string, value: any) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      header: { ...currentTemplate.header, [field]: value },
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const updateCompanyInfo = (field: string, value: string) => {
    if (!currentTemplate) return;
    
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
  };

  const updateHeaderStyling = (field: string, value: any) => {
    if (!currentTemplate) return;
    
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
  };

  const addSubHeader = () => {
    if (!currentTemplate) return;
    
    const newSubHeader: TemplateSubHeader = {
      id: `subheader-${Date.now()}`,
      sections: [
        { id: 'new-field', label: 'New Field', value: '', type: 'text', editable: true }
      ]
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: [...currentTemplate.subHeaders, newSubHeader],
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const updateSubHeader = (subHeaderId: string, sectionId: string, field: string, value: any) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: (currentTemplate.subHeaders || []).map(sh => 
        sh.id === subHeaderId 
          ? {
              ...sh,
              sections: sh.sections.map(section =>
                section.id === sectionId ? { ...section, [field]: value } : section
              )
            }
          : sh
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const addSubHeaderSection = (subHeaderId: string) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      subHeaders: (currentTemplate.subHeaders || []).map(sh =>
        sh.id === subHeaderId
          ? {
              ...sh,
              sections: [...sh.sections, {
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
  };

  const addSection = () => {
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
      sections: [...currentTemplate.sections, newSection],
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const addFieldToSection = (sectionId: string) => {
    if (!currentTemplate) return;
    
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: (currentTemplate.sections || []).map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const addPersonField = (sectionId: string, fieldType: 'name' | 'email' | 'id' | 'department' | 'position' | 'salary' | 'phone') => {
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
      sections: (currentTemplate.sections || []).map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: (currentTemplate.sections || []).map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: (section.fields || []).map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const removeField = (sectionId: string, fieldId: string) => {
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      sections: (currentTemplate.sections || []).map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      ),
      lastModified: new Date()
    };
    
    setCurrentTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const handlePersonChange = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
    }
  };

  const filteredPersons = selectedPersonType === 'all' 
    ? persons 
    : persons.filter(person => person.type === selectedPersonType);

  const getFieldValue = (field: FieldDefinition): string => {
    if (!selectedPerson) return field.value || `[${field.type}]`;
    
    // Map field labels to person data
    const fieldLower = field.label.toLowerCase();
    const fieldIdLower = field.id.toLowerCase();
    
    if (fieldLower.includes('name') || fieldIdLower.includes('name')) {
      return selectedPerson.personalInfo.fullName;
    } else if (fieldLower.includes('email') || fieldIdLower.includes('email')) {
      return selectedPerson.personalInfo.email;
    } else if (fieldLower.includes('employee') && (fieldLower.includes('id') || fieldLower.includes('number'))) {
      return selectedPerson.workInfo.personId;
    } else if (fieldLower.includes('department')) {
      return selectedPerson.workInfo.department || 'N/A';
    } else if (fieldLower.includes('position') || fieldLower.includes('title') || fieldLower.includes('job')) {
      return selectedPerson.workInfo.position || selectedPerson.workInfo.title || 'N/A';
    } else if (fieldLower.includes('salary') || fieldLower.includes('basic')) {
      return selectedPerson.compensation.baseSalary?.toLocaleString() || 'N/A';
    } else if (fieldLower.includes('phone')) {
      return selectedPerson.personalInfo.phone || 'N/A';
    }
    
    return field.value || `[${field.type}]`;
  };

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
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Available Templates</h2>
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
            {templates && templates.length > 0 ? templates.map(template => (
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
                    <h3 style={{ margin: '0 0 5px 0', color: '#1565c0' }}>{template.name}</h3>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: template.type === 'basic' ? '#e3f2fd' : '#f3e5f5',
                      color: template.type === 'basic' ? '#1565c0' : '#7b1fa2',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {template.type === 'basic' ? '📝 Basic' : '⚡ Advanced'}
                    </span>
                  </div>
                </div>
                
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                  {template.description}
                </p>
                
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                  <div>Sections: {template.sections.length}</div>
                  <div>Tables: {template.tables.length}</div>
                  <div>Last modified: {new Date(template.lastModified).toLocaleDateString()}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setCurrentTemplate(template);
                      setIsEditing(true);
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
                    onClick={() => onTemplateSelect?.(template)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📋 Use
                  </button>
                </div>
              </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Person Type Filter:</label>
                <select 
                  value={selectedPersonType} 
                  onChange={(e) => setSelectedPersonType(e.target.value as any)}
                  style={fieldStyle}
                >
                  <option value="all">🌟 All Types</option>
                  {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.icon} {config.label}s
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
                  {(filteredPersons || []).map(person => (
                    <option key={person.id} value={person.id}>
                      {PERSON_TYPE_CONFIG[person.type].icon} {person.personalInfo.fullName} - {person.workInfo.personId} ({PERSON_TYPE_CONFIG[person.type].label})
                    </option>
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
                  {PERSON_TYPE_CONFIG[selectedPerson.type].icon} Selected {PERSON_TYPE_CONFIG[selectedPerson.type].label}: {selectedPerson.personalInfo.fullName}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <strong>Person ID:</strong> {selectedPerson.workInfo.personId}
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedPerson.workInfo.department || 'N/A'}
                  </div>
                  <div>
                    <strong>Position:</strong> {selectedPerson.workInfo.position || selectedPerson.workInfo.title || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedPerson.personalInfo.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedPerson.personalInfo.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedPerson.workInfo.status}
                  </div>
                  {selectedPerson.compensation.baseSalary && (
                    <div>
                      <strong>Base Salary:</strong> {selectedPerson.compensation.currency} {selectedPerson.compensation.baseSalary.toLocaleString()}
                    </div>
                  )}
                  {selectedPerson.compensation.hourlyRate && (
                    <div>
                      <strong>Hourly Rate:</strong> {selectedPerson.compensation.currency} {selectedPerson.compensation.hourlyRate.toLocaleString()}
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
          
          {/* Header Information */}
          <div style={sectionStyle}>
            <h3>Header Text</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Main Title</label>
                <input
                  type="text"
                  value={currentTemplate.header.title}
                  onChange={(e) => updateHeader('title', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  type="text"
                  value={currentTemplate.header.subtitle || ''}
                  onChange={(e) => updateHeader('subtitle', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div style={sectionStyle}>
            <h3>Company Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input
                  type="text"
                  value={currentTemplate.header.companyInfo.name}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  value={currentTemplate.header.companyInfo.phone}
                  onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={currentTemplate.header.companyInfo.address}
                  onChange={(e) => updateCompanyInfo('address', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={currentTemplate.header.companyInfo.email}
                  onChange={(e) => updateCompanyInfo('email', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  type="url"
                  value={currentTemplate.header.companyInfo.website || ''}
                  onChange={(e) => updateCompanyInfo('website', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Header Styling */}
          <div style={sectionStyle}>
            <h3>Header Styling</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Title Color</label>
                <input
                  type="color"
                  value={currentTemplate.header.styling?.titleColor || '#1565c0'}
                  onChange={(e) => updateHeaderStyling('titleColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subtitle Color</label>
                <input
                  type="color"
                  value={currentTemplate.header.styling?.subtitleColor || '#666'}
                  onChange={(e) => updateHeaderStyling('subtitleColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Background Color</label>
                <input
                  type="color"
                  value={currentTemplate.header.styling?.backgroundColor || '#f8f9fa'}
                  onChange={(e) => updateHeaderStyling('backgroundColor', e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Sub Headers */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
            
            {(currentTemplate.subHeaders || []).map((subHeader, index) => (
              <div key={subHeader.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                  {(subHeader.sections || []).map(section => (
                    <div key={section.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => updateSubHeader(subHeader.id, section.id, 'label', e.target.value)}
                        style={{ ...fieldStyle, marginBottom: '8px', fontWeight: 'bold' }}
                        placeholder="Field Label"
                      />
                      <input
                        type={section.type}
                        value={section.value}
                        onChange={(e) => updateSubHeader(subHeader.id, section.id, 'value', e.target.value)}
                        style={fieldStyle}
                        placeholder="Field Value"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sections' && currentTemplate && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
          
          {(currentTemplate.sections || []).map(section => (
            <div key={section.id} style={{
              ...sectionStyle,
              border: `2px solid ${section.styling?.borderColor || '#e0e0e0'}`,
              backgroundColor: section.styling?.backgroundColor || '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      sections: (currentTemplate.sections || []).map(s =>
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
                    borderBottom: '2px solid #ddd'
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
                  
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <small style={{ alignSelf: 'center', color: '#666', marginRight: '5px' }}>Quick Add:</small>
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
                {(section.fields || []).map(field => (
                  <div key={field.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                        style={{ ...fieldStyle, fontWeight: 'bold', fontSize: '14px' }}
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
                          value={field.type}
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
                    
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', fontSize: '12px' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                        />
                        Required
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={field.readonly || false}
                          onChange={(e) => updateField(section.id, field.id, { readonly: e.target.checked })}
                        />
                        Read Only
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'styling' && currentTemplate && (
        <div>
          <h2>🎨 Template Styling</h2>
          
          <div style={sectionStyle}>
            <h3>Global Styling</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Font Family</label>
                <select
                  value={currentTemplate.styling.fontFamily}
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
                  value={currentTemplate.styling.fontSize}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      styling: { ...currentTemplate.styling, fontSize: parseInt(e.target.value) }
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
                  value={currentTemplate.styling.primaryColor}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Columns per Row</label>
                <select
                  value={currentTemplate.layout.columnsPerRow}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      layout: { ...currentTemplate.layout, columnsPerRow: parseInt(e.target.value) }
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
                  value={currentTemplate.layout.sectionSpacing}
                  onChange={(e) => {
                    const updatedTemplate = {
                      ...currentTemplate,
                      layout: { ...currentTemplate.layout, sectionSpacing: parseInt(e.target.value) }
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
                  value={currentTemplate.layout.printOrientation}
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
                <strong>🎯 Live Preview:</strong> Showing template with data from {PERSON_TYPE_CONFIG[selectedPerson.type].icon} <strong>{selectedPerson.personalInfo.fullName}</strong> ({PERSON_TYPE_CONFIG[selectedPerson.type].label}) - Go to "👥 Select Person" tab to change.
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
            fontFamily: currentTemplate.styling.fontFamily,
            fontSize: currentTemplate.styling.fontSize,
            color: '#333'
          }}>
            {/* Header Preview */}
            <div style={{
              backgroundColor: currentTemplate.header.styling?.backgroundColor,
              padding: '20px',
              borderRadius: '8px',
              textAlign: currentTemplate.header.styling?.alignment as any,
              marginBottom: '20px'
            }}>
              <h1 style={{
                color: currentTemplate.header.styling?.titleColor,
                fontSize: currentTemplate.header.styling?.fontSize?.title,
                margin: '0 0 10px 0'
              }}>
                {currentTemplate.header.title}
              </h1>
              {currentTemplate.header.subtitle && (
                <h2 style={{
                  color: currentTemplate.header.styling?.subtitleColor,
                  fontSize: currentTemplate.header.styling?.fontSize?.subtitle,
                  margin: '0 0 15px 0'
                }}>
                  {currentTemplate.header.subtitle}
                </h2>
              )}
              <div style={{
                fontSize: currentTemplate.header.styling?.fontSize?.info,
                color: '#666'
              }}>
                <div>{currentTemplate.header.companyInfo.name}</div>
                <div>{currentTemplate.header.companyInfo.address}</div>
                <div>{currentTemplate.header.companyInfo.phone} | {currentTemplate.header.companyInfo.email}</div>
                {currentTemplate.header.companyInfo.website && (
                  <div>{currentTemplate.header.companyInfo.website}</div>
                )}
              </div>
            </div>

            {/* Sub Headers Preview */}
            {(currentTemplate.subHeaders || []).map((subHeader, index) => (
              <div key={subHeader.id} style={{
                backgroundColor: subHeader.styling?.backgroundColor || '#f0f0f0',
                color: subHeader.styling?.textColor || '#333',
                border: subHeader.styling?.borderStyle || '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(subHeader.sections.length, 4)}, 1fr)`,
                gap: '15px'
              }}>
                {(subHeader.sections || []).map(section => (
                  <div key={section.id}>
                    <strong>{section.label}:</strong>
                    <div style={{ marginTop: '5px' }}>
                      {section.value || `[${section.type}]`}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Sections Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${currentTemplate.layout.columnsPerRow}, 1fr)`,
              gap: `${currentTemplate.layout.sectionSpacing}px`
            }}>
              {(currentTemplate.sections || []).map(section => (
                <div key={section.id} style={{
                  backgroundColor: section.styling?.backgroundColor || '#f9f9f9',
                  color: section.styling?.textColor || '#333',
                  border: `1px solid ${section.styling?.borderColor || '#ddd'}`,
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <h3 style={{
                    margin: '0 0 15px 0',
                    color: section.styling?.textColor || currentTemplate.styling.primaryColor,
                    fontWeight: section.styling?.headerStyle || 'bold'
                  }}>
                    {section.title}
                  </h3>
                  {(section.fields || []).map(field => (
                    <div key={field.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>{field.label}:</span>
                      <span>{getFieldValue(field)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Tables Preview */}
            {(currentTemplate.tables || []).map(table => (
              <div key={table.id} style={{ marginTop: '20px' }}>
                <h3 style={{ color: currentTemplate.styling.primaryColor }}>{table.title}</h3>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: currentTemplate.styling.primaryColor, color: 'white' }}>
                      {(table.columns || []).map(column => (
                        <th key={column.id} style={{
                          padding: '10px',
                          border: '1px solid #ddd',
                          textAlign: 'left'
                        }}>
                          {column.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {(table.columns || []).map(column => (
                        <td key={column.id} style={{
                          padding: '8px',
                          border: '1px solid #ddd',
                          color: '#666'
                        }}>
                          [{column.type}]
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTemplateBuilder;