import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { 
  PayslipTemplate, 
  SectionDefinition, 
  FieldDefinition,
  COMMON_FIELDS
} from '../types/PayslipTypes';
import { templateManager } from '../utils/templateManager';
import { supabaseTemplateService } from '../utils/supabaseTemplateService';

// Lightweight container with minimal styling
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 500px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #1565c0;
  margin: 0;
  font-size: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#2196f3';
      case 'success': return '#4caf50';
      case 'danger': return '#f44336';
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  height: fit-content;
`;

const WorkArea = styled.div`
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 400px;
`;

const FieldGroup = styled.div`
  margin-bottom: 15px;
`;

const FieldGroupTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #1565c0;
  font-size: 14px;
`;

const FieldItem = styled.div`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-bottom: 4px;
  cursor: grab;
  background: white;
  font-size: 13px;
  
  &:hover {
    border-color: #2196f3;
    background: #f0f7ff;
  }
`;

const SectionContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  background: #fafafa;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
`;

const SaveStatus = styled.div<{ type: 'success' | 'error' | 'saving' }>`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 10px;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#e8f5e8';
      case 'error': return '#ffebee';
      case 'saving': return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      case 'saving': return '#1565c0';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'saving': return '#2196f3';
    }
  }};
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
`;

const FieldContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  background: #fafafa;
  position: relative;
`;

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const FieldLabel = styled.label`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  display: block;
`;

const ActionButton = styled.button<{ size?: 'small' }>`
  padding: ${props => props.size === 'small' ? '5px 10px' : '8px 12px'};
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: ${props => props.size === 'small' ? '12px' : '14px'};
  background: #6c757d;
  color: white;
  
  &:hover {
    background: #5a6268;
  }
`;

interface Props {
  templateId?: string;
  onSave?: (template: PayslipTemplate) => void;
}

const TemplateBuilder: React.FC<Props> = ({ templateId, onSave }) => {
  const [template, setTemplate] = useState<PayslipTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<PayslipTemplate[]>([]);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' | 'saving' } | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized field categories
  const fieldCategories = useMemo(() => Object.entries(COMMON_FIELDS), []);

  // Initialize templates and load first one for editing
  useEffect(() => {
    const initializeTemplates = async () => {
      try {
        setLoading(true);
        setSaveMessage({ text: 'Loading templates...', type: 'saving' });
        
        // Load available templates from database
        const result = await supabaseTemplateService.getAllTemplates();
        
        console.log('📋 Template loading result:', result);
        
        if (result.success && result.data && result.data.length > 0) {
          console.log('✅ Found templates:', result.data.map(t => ({ name: t.name, type: t.type, id: t.id })));
          
          setAvailableTemplates(result.data);
          
          // Load the first template by default for editing
          let templateToLoad = result.data[0];
          let indexToSet = 0;
          
          // If a specific templateId was provided, try to find and load that one
          if (templateId) {
            const specificTemplate = result.data.find(t => t.id === templateId);
            if (specificTemplate) {
              templateToLoad = specificTemplate;
              indexToSet = result.data.findIndex(t => t.id === templateId);
            }
          }
          
          setCurrentTemplateIndex(indexToSet);
          setTemplate(templateToLoad);
          setSelectedTemplateId(templateToLoad.id);
          setSaveMessage({ text: `Loaded: ${templateToLoad.name}`, type: 'success' });
          setTimeout(() => setSaveMessage(null), 2000);
          
        } else {
          console.log('❌ No templates found in database, reason:', result.error || 'Unknown error');
          // No templates found, create a default one
          const defaultTemplate: PayslipTemplate = {
            id: `template-${Date.now()}`,
            name: '📝 Default Payslip Template',
            version: '1.0',
            description: 'Default payslip template for editing',
            type: 'advanced',
            compatibleViews: ['basic', 'excel'],
            header: {
              id: 'header-' + Date.now(),
              title: 'PAYSLIP',
              subtitle: 'Employee Pay Statement',
              companyInfo: {
                name: 'Your Company Name',
                address: 'Company Address',
                phone: 'Phone Number',
                email: 'Email Address',
                website: 'www.company.com'
              },
              styling: {
                titleColor: '#1565c0',
                subtitleColor: '#666',
                backgroundColor: '#f8f9fa',
                fontSize: { title: 28, subtitle: 16, info: 12 },
                alignment: 'center'
              }
            },
            subHeaders: [],
            sections: [
              {
                id: 'employee-info',
                title: 'Employee Information',
                type: 'static',
                fields: [
                  { id: 'emp-name', type: 'text', label: 'Full Name', required: true },
                  { id: 'emp-id', type: 'text', label: 'Employee ID', required: true },
                  { id: 'department', type: 'text', label: 'Department' },
                  { id: 'position', type: 'text', label: 'Position' }
                ],
                canAddFields: true,
                canRemove: false
              },
              {
                id: 'earnings',
                title: 'Earnings',
                type: 'dynamic',
                fields: [
                  { id: 'basic-salary', type: 'number', label: 'Basic Salary', required: true },
                  { id: 'allowances', type: 'number', label: 'Allowances' },
                  { id: 'overtime', type: 'number', label: 'Overtime Pay' }
                ],
                canAddFields: true,
                canRemove: false
              },
              {
                id: 'deductions',
                title: 'Deductions',
                type: 'dynamic',
                fields: [
                  { id: 'tax', type: 'number', label: 'Income Tax' },
                  { id: 'social-security', type: 'number', label: 'Social Security' },
                  { id: 'insurance', type: 'number', label: 'Insurance' }
                ],
                canAddFields: true,
                canRemove: false
              },
              {
                id: 'summary',
                title: 'Pay Summary',
                type: 'static',
                fields: [
                  { id: 'gross-pay', type: 'formula', label: 'Gross Pay', formula: 'basic-salary + allowances + overtime', readonly: true },
                  { id: 'total-deductions', type: 'formula', label: 'Total Deductions', formula: 'tax + social-security + insurance', readonly: true },
                  { id: 'net-pay', type: 'formula', label: 'Net Pay', formula: 'gross-pay - total-deductions', readonly: true }
                ],
                canAddFields: false,
                canRemove: false
              }
            ],
            tables: [],
            globalFormulas: {},
            styling: {
              fontFamily: 'Calibri, Arial, sans-serif',
              fontSize: 14,
              primaryColor: '#1565c0',
              secondaryColor: '#f5f5f5',
              borderStyle: 'solid',
            },
            layout: {
              columnsPerRow: 2,
              sectionSpacing: 20,
              printOrientation: 'portrait',
            },
            isEditable: true,
            createdDate: new Date(),
            lastModified: new Date()
          };
          setTemplate(defaultTemplate);
          setAvailableTemplates([defaultTemplate]);
          setSaveMessage({ text: 'Created default template', type: 'success' });
          setTimeout(() => setSaveMessage(null), 2000);
        }
      } catch (error) {
        console.error('Error initializing templates:', error);
        setSaveMessage({ text: 'Failed to load templates', type: 'error' });
        setTimeout(() => setSaveMessage(null), 3000);
      } finally {
        setLoading(false);
      }
    };

    initializeTemplates();
  }, [templateId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Optimized auto-save with proper cleanup
  const autoSave = useCallback(async (templateToSave: PayslipTemplate) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Abort previous save operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveMessage({ text: 'Saving...', type: 'saving' });

        // Save to local storage immediately
        if (templateId) {
          templateManager.updateTemplate(templateId, {
            type: 'UPDATE_TEMPLATE_SETTINGS',
            updates: templateToSave
          });
        } else {
          templateManager.createTemplate(templateToSave);
        }

        // Save to backend with timeout
        const savePromise = supabaseTemplateService.saveTemplate(templateToSave);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Save timeout')), 5000);
        });

        const result = await Promise.race([savePromise, timeoutPromise]);
        
        if (!abortControllerRef.current?.signal.aborted) {
          if (result && (result as any).success) {
            setSaveMessage({ text: 'Saved successfully', type: 'success' });
          } else {
            setSaveMessage({ text: 'Saved locally only', type: 'success' });
          }
          
          // Clear message after delay
          setTimeout(() => setSaveMessage(null), 2000);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.warn('Auto-save failed:', error);
          setSaveMessage({ text: 'Saved locally only', type: 'success' });
          setTimeout(() => setSaveMessage(null), 2000);
        }
      }
    }, 1500); // 1.5 second debounce
  }, [templateId]);

  // Template update handler
  const updateTemplate = useCallback((updates: Partial<PayslipTemplate>) => {
    if (!template) return;

    const updatedTemplate = {
      ...template,
      ...updates,
      lastModified: new Date()
    };

    setTemplate(updatedTemplate);
    autoSave(updatedTemplate);
  }, [template, autoSave]);

  // Section handlers
  const addSection = useCallback(() => {
    if (!template) return;

    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type: 'dynamic',
      fields: [],
      canAddFields: true,
      canRemove: true,
      collapsible: true,
      collapsed: false,
    };

    updateTemplate({
      sections: [...template.sections, newSection]
    });
  }, [template, updateTemplate]);

  const removeSection = useCallback((sectionId: string) => {
    if (!template) return;

    updateTemplate({
      sections: template.sections.filter(s => s.id !== sectionId)
    });
  }, [template, updateTemplate]);

  const updateSection = useCallback((sectionId: string, updates: Partial<SectionDefinition>) => {
    if (!template) return;

    updateTemplate({
      sections: template.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  }, [template, updateTemplate]);

  // Field handlers
  const addFieldToSection = useCallback((sectionId: string, field: FieldDefinition) => {
    if (!template) return;

    const newField: FieldDefinition = {
      ...field,
      id: `${field.id}-${Date.now()}`
    };

    updateTemplate({
      sections: template.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    });
  }, [template, updateTemplate]);

  const removeField = useCallback((sectionId: string, fieldId: string) => {
    if (!template) return;

    updateTemplate({
      sections: template.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) }
          : section
      )
    });
  }, [template, updateTemplate]);

  const updateField = useCallback((sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!template) return;

    updateTemplate({
      sections: template.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    });
  }, [template, updateTemplate]);

  // Navigate between templates
  const switchTemplate = useCallback((direction: 'prev' | 'next') => {
    if (availableTemplates.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentTemplateIndex > 0 ? currentTemplateIndex - 1 : availableTemplates.length - 1;
    } else {
      newIndex = currentTemplateIndex < availableTemplates.length - 1 ? currentTemplateIndex + 1 : 0;
    }
    
    setCurrentTemplateIndex(newIndex);
    setTemplate(availableTemplates[newIndex]);
    setSelectedTemplateId(availableTemplates[newIndex].id);
    setSaveMessage({ text: `Switched to: ${availableTemplates[newIndex].name}`, type: 'success' });
    setTimeout(() => setSaveMessage(null), 2000);
  }, [availableTemplates, currentTemplateIndex]);

  // Load specific template from selection
  const loadSelectedTemplate = useCallback(async (templateToLoad: PayslipTemplate) => {
    try {
      const templateIndex = availableTemplates.findIndex(t => t.id === templateToLoad.id);
      setCurrentTemplateIndex(templateIndex >= 0 ? templateIndex : 0);
      setTemplate(templateToLoad);
      setSelectedTemplateId(templateToLoad.id);
      setShowTemplateSelection(false);
      setSaveMessage({ text: `Loaded: ${templateToLoad.name}`, type: 'success' });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error('Error loading template:', error);
      setSaveMessage({ text: 'Failed to load template', type: 'error' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [availableTemplates]);

  // Create new template
  const createNewTemplate = useCallback(() => {
    const newTemplate: PayslipTemplate = {
      id: `template-${Date.now()}`,
      name: '📝 New Template',
      version: '1.0',
      description: 'A new template for customization',
      type: 'advanced',
      compatibleViews: ['basic', 'excel'],
      header: {
        id: 'header-' + Date.now(),
        title: 'PAYSLIP',
        subtitle: 'Employee Pay Statement',
        companyInfo: {
          name: 'Your Company Name',
          address: 'Company Address',
          phone: 'Phone Number',
          email: 'Email Address',
          website: 'www.company.com'
        },
        styling: {
          titleColor: '#1565c0',
          subtitleColor: '#666',
          backgroundColor: '#f8f9fa',
          fontSize: { title: 28, subtitle: 16, info: 12 },
          alignment: 'center'
        }
      },
      subHeaders: [],
      sections: [],
      tables: [],
      globalFormulas: {},
      styling: {
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 14,
        primaryColor: '#1565c0',
        secondaryColor: '#f5f5f5',
        borderStyle: 'solid',
      },
      layout: {
        columnsPerRow: 2,
        sectionSpacing: 20,
        printOrientation: 'portrait',
      },
      isEditable: true,
      createdDate: new Date(),
      lastModified: new Date()
    };

    // Add to available templates list
    setAvailableTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplateIndex(availableTemplates.length);
    setTemplate(newTemplate);
    setSelectedTemplateId(newTemplate.id);
    setShowTemplateSelection(false);
    setSaveMessage({ text: 'Created new template', type: 'success' });
    setTimeout(() => setSaveMessage(null), 2000);
  }, [availableTemplates.length]);

  // Manual save
  const handleSaveTemplate = useCallback(async () => {
    if (!template) return;

    try {
      setSaveMessage({ text: 'Saving...', type: 'saving' });

      // Save to local storage
      if (templateId) {
        templateManager.updateTemplate(templateId, {
          type: 'UPDATE_TEMPLATE_SETTINGS',
          updates: template
        });
      } else {
        templateManager.createTemplate(template);
      }

      if (onSave) {
        onSave(template);
      }

      // Save to backend
      const result = await supabaseTemplateService.saveTemplate(template);
      
      if (result && result.success) {
        setSaveMessage({ text: `Template "${template.name}" saved successfully!`, type: 'success' });
      } else {
        setSaveMessage({ text: 'Saved locally only', type: 'success' });
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({ text: 'Save failed', type: 'error' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [template, templateId, onSave]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading Template Builder...</div>
        </div>
      </Container>
    );
  }

  if (!template) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Failed to load template</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Title>Template Builder</Title>
          
          {/* Template Navigation */}
          {availableTemplates.length > 1 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              background: '#f0f7ff',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #2196f3'
            }}>
              <Button 
                variant="secondary" 
                onClick={() => switchTemplate('prev')}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                ⬅️ Prev
              </Button>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#1565c0',
                minWidth: '200px',
                textAlign: 'center'
              }}>
                {template?.name} ({currentTemplateIndex + 1}/{availableTemplates.length})
              </div>
              <Button 
                variant="secondary" 
                onClick={() => switchTemplate('next')}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Next ➡️
              </Button>
            </div>
          )}
          
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setShowTemplateSelection(!showTemplateSelection)}>
              📋 Select Template ({availableTemplates.length})
            </Button>
            <Button variant="success" onClick={handleSaveTemplate}>
              💾 Save Template
            </Button>
            <Button variant="primary" onClick={addSection}>
              ➕ Add Section
            </Button>
          </ButtonGroup>
        </div>
        {saveMessage && (
          <SaveStatus type={saveMessage.type}>
            {saveMessage.text}
          </SaveStatus>
        )}
      </Header>

      {/* Template Selection Panel */}
      {showTemplateSelection && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '2px solid #2196f3'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#1565c0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            📋 Select Template to Edit
            <Button 
              variant="danger" 
              onClick={() => setShowTemplateSelection(false)}
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              ✕ Close
            </Button>
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {availableTemplates.map((dbTemplate) => (
              <div
                key={dbTemplate.id}
                style={{
                  padding: '15px',
                  border: `2px solid ${selectedTemplateId === dbTemplate.id ? '#1565c0' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedTemplateId === dbTemplate.id ? '#f0f7ff' : '#fafafa',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onClick={() => loadSelectedTemplate(dbTemplate)}
              >
                <div style={{ 
                  fontWeight: 'bold',
                  color: selectedTemplateId === dbTemplate.id ? '#1565c0' : '#333',
                  marginBottom: '8px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {dbTemplate.type === 'basic' ? '📋' : '🔧'} {dbTemplate.name}
                  {selectedTemplateId === dbTemplate.id && (
                    <span style={{
                      background: '#1565c0',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <div style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  {dbTemplate.description || 'No description'}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#888'
                }}>
                  <span style={{
                    background: dbTemplate.type === 'basic' ? '#4caf50' : '#ff9800',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {dbTemplate.type}
                  </span>
                  <span>
                    {dbTemplate.sections?.length || 0} sections
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Template Option */}
          <div
            style={{
              padding: '20px',
              border: '2px dashed #4caf50',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f8fff8',
              transition: 'all 0.3s ease'
            }}
            onClick={createNewTemplate}
          >
            <div style={{ 
              fontSize: '24px', 
              marginBottom: '10px' 
            }}>➕</div>
            <div style={{ 
              fontWeight: 'bold', 
              color: '#2e7d32',
              marginBottom: '5px'
            }}>
              Create New Template
            </div>
            <div style={{ 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Start from scratch with a blank template
            </div>
          </div>
        </div>
      )}

      <MainContent>
        <Sidebar>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Field Library</h3>
          {fieldCategories.map(([category, fields]) => (
            <FieldGroup key={category}>
              <FieldGroupTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</FieldGroupTitle>
              {fields.map((field, index) => (
                <FieldItem
                  key={`${field.id}-${index}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(field));
                  }}
                >
                  {field.label}
                </FieldItem>
              ))}
            </FieldGroup>
          ))}
        </Sidebar>

        <WorkArea>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Template Name:
            </label>
            <Input
              value={template.name}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>

          {template.sections.map(section => (
            <SectionContainer key={section.id}>
              <SectionHeader>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  style={{ marginRight: '10px', maxWidth: '200px' }}
                />
                <Select
                  value={section.type}
                  onChange={(e) => updateSection(section.id, { type: e.target.value as any })}
                  style={{ marginRight: '10px' }}
                >
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                  <option value="repeating">Repeating</option>
                </Select>
                <Button
                  variant="danger"
                  onClick={() => removeSection(section.id)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Remove
                </Button>
              </SectionHeader>

              {/* Fields Grid */}
              {section.fields && section.fields.length > 0 && (
                <FieldsGrid>
                  {section.fields.map(field => (
                    <FieldContainer key={field.id}>
                      <FieldHeader>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                          style={{ marginRight: '10px', flex: 1 }}
                        />
                        <ActionButton
                          size="small"
                          onClick={() => removeField(section.id, field.id)}
                        >
                          ×
                        </ActionButton>
                      </FieldHeader>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <Select
                          value={field.type}
                          onChange={(e) => updateField(section.id, field.id, { type: e.target.value as any })}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                          <option value="formula">Formula</option>
                        </Select>
                      </div>

                      {field.type === 'formula' && (
                        <div>
                          <FieldLabel>Formula:</FieldLabel>
                          <Input
                            value={field.formula || ''}
                            onChange={(e) => updateField(section.id, field.id, { formula: e.target.value })}
                            placeholder="e.g., basic-salary * 0.15"
                          />
                        </div>
                      )}

                      {field.type === 'select' && (
                        <div>
                          <FieldLabel>Options (comma-separated):</FieldLabel>
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(section.id, field.id, { 
                              options: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                            })}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </FieldContainer>
                  ))}
                </FieldsGrid>
              )}

              {/* Drop Zone */}
              <div
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  marginTop: section.fields?.length ? '15px' : '0'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
                    addFieldToSection(section.id, fieldData);
                  } catch (error) {
                    console.error('Error adding field:', error);
                  }
                }}
              >
                {section.fields && section.fields.length > 0
                  ? 'Drop more fields here'
                  : 'Drop fields here'
                }
              </div>
            </SectionContainer>
          ))}

          {template.sections.length === 0 && (
            <div
              style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#666',
                cursor: 'pointer'
              }}
              onClick={addSection}
            >
              Click to add your first section
            </div>
          )}
        </WorkArea>
      </MainContent>
    </Container>
  );
};

export default TemplateBuilder;