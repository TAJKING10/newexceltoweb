import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  PayslipTemplate, 
  SectionDefinition, 
  FieldDefinition,
  DynamicTable,
  COMMON_FIELDS
} from '../types/PayslipTypes';
import { templateManager } from '../utils/templateManager';
import { supabaseTemplateService } from '../utils/supabaseTemplateService';

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #1565c0;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#2196f3';
      case 'success': return '#4caf50';
      case 'danger': return '#f44336';
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

const TemplateArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
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

const MainArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionContainer = styled.div<{ isDragOver?: boolean }>`
  border: 2px ${props => props.isDragOver ? 'dashed #2196f3' : 'solid #e0e0e0'};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: ${props => props.isDragOver ? '#e3f2fd' : 'white'};
  transition: all 0.2s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f5f5f5;
  border-radius: 5px;
  cursor: pointer;
`;

// Removed unused SectionTitle component

const SectionActions = styled.div`
  display: flex;
  gap: 5px;
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

const FieldInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const AddComponentArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2196f3;
    color: #2196f3;
    background: #f8f9fa;
  }
`;

const CategoryGroup = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #1565c0;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
`;

const FieldTemplate = styled.div`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-bottom: 5px;
  cursor: grab;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2196f3;
    background: #e3f2fd;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

interface Props {
  templateId?: string;
  onSave?: (template: PayslipTemplate) => void;
}

const TemplateBuilder: React.FC<Props> = ({ templateId, onSave }) => {
  const [template, setTemplate] = useState<PayslipTemplate | null>(null);
  const [draggedField, setDraggedField] = useState<FieldDefinition | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (templateId) {
      const existingTemplate = templateManager.getTemplate(templateId);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    } else {
      // Create new template
      setTemplate({
        id: `template-${Date.now()}`,
        name: 'New Template',
        version: '1.0',
        description: '',
        type: 'advanced',
        compatibleViews: ['basic', 'excel'],
        header: {
          id: 'header-' + Date.now(),
          title: 'PAYSLIP',
          subtitle: 'Monthly Salary Statement',
          companyInfo: {
            name: 'Your Company Name',
            address: '123 Business St, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'hr@company.com',
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
      });
    }
  }, [templateId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Debounced auto-save function - fail-fast and non-blocking
  const debouncedAutoSave = (template: PayslipTemplate) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      // Save to local storage immediately
      if (templateId) {
        templateManager.updateTemplate(templateId, {
          type: 'UPDATE_TEMPLATE_SETTINGS',
          updates: template
        });
      } else {
        templateManager.createTemplate(template);
      }
      
      // Background save to Supabase - fire and forget
      backgroundSave(template);
    }, 1000);
    
    setAutoSaveTimeout(timeoutId);
  };

  const handleSaveTemplate = () => {
    if (!template) return;
    
    // Show immediate feedback but don't block UI
    setSaveMessage('💾 Saving template...');
    
    // Save to local storage immediately for responsiveness
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
    
    // Do background save to Supabase without blocking
    backgroundSave(template);
  };

  const backgroundSave = async (template: PayslipTemplate) => {
    // Create a timeout promise for fail-fast behavior
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save timeout after 8 seconds')), 8000);
    });
    
    try {
      console.log('🎨 Background: Saving template to database (8s timeout):', template.name);
      console.log('🔍 Template data:', {
        id: template.id,
        sections: template.sections?.length || 0,
        name: template.name
      });
      
      // Race between the save operation and timeout
      const dbResult = await Promise.race([
        supabaseTemplateService.saveTemplate(template),
        timeoutPromise
      ]) as any;
      
      console.log('📊 Save result:', dbResult);
      
      if (dbResult && dbResult.success) {
        console.log('✅ Background: Template saved to database successfully');
        setSaveMessage(`✅ Template "${template.name}" saved to database!`);
        setTimeout(() => setSaveMessage(null), 2000);
      } else {
        console.warn('⚠️ Background: Database save failed:', dbResult?.error || 'Unknown error');
        setSaveMessage(`⚠️ Saved locally. DB: ${dbResult?.error || 'error'}`);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (error) {
      console.error('Background save error (failed fast):', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSaveMessage(`⚠️ Saved locally. Issue: ${errorMsg.substring(0, 30)}`);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleAddSection = (type: 'static' | 'dynamic' | 'repeating') => {
    if (!template) return;
    
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type,
      fields: [],
      canAddFields: true,
      canRemove: true,
      collapsible: true,
      collapsed: false,
    };

    const updatedTemplate = {
      ...template,
      sections: [...template.sections, newSection],
      lastModified: new Date()
    };
    
    setTemplate(updatedTemplate);
    
    // Auto-save to Supabase with debouncing
    debouncedAutoSave(updatedTemplate);
  };

  const handleAddTable = () => {
    if (!template) return;
    
    const newTable: DynamicTable = {
      id: `table-${Date.now()}`,
      title: 'New Table',
      columns: [
        { id: 'col1', header: 'Column 1', type: 'text' },
        { id: 'col2', header: 'Column 2', type: 'number' }
      ],
      rows: [],
      canAddColumns: true,
      canAddRows: true,
      canRemoveColumns: true,
      canRemoveRows: true,
    };

    const updatedTemplate = {
      ...template,
      tables: [...template.tables, newTable],
      lastModified: new Date()
    };
    
    setTemplate(updatedTemplate);
    
    // Auto-save to Supabase with debouncing
    debouncedAutoSave(updatedTemplate);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!template) return;
    
    setTemplate(prev => prev ? {
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    } : null);
  };

  const handleAddFieldToSection = (sectionId: string, field: FieldDefinition) => {
    if (!template) return;
    
    const newField: FieldDefinition = {
      ...field,
      id: `${field.id}-${Date.now()}`
    };

    setTemplate(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    } : null);
  };

  const handleRemoveField = (sectionId: string, fieldId: string) => {
    if (!template) return;
    
    setTemplate(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) }
          : section
      )
    } : null);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<SectionDefinition>) => {
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      lastModified: new Date()
    };
    
    setTemplate(updatedTemplate);
    
    // Auto-save to Supabase with debouncing
    debouncedAutoSave(updatedTemplate);
  };

  const handleUpdateField = (sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      ),
      lastModified: new Date()
    };
    
    setTemplate(updatedTemplate);
    
    // Auto-save to Supabase with debouncing
    debouncedAutoSave(updatedTemplate);
  };

  const handleDragStart = (field: FieldDefinition) => {
    setDraggedField(field);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedField) {
      handleAddFieldToSection(sectionId, draggedField);
      setDraggedField(null);
    }
  };

  if (!template) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Template Builder</Title>
        <ButtonGroup>
          <Button 
            variant="success" 
            onClick={handleSaveTemplate}
          >
            💾 Save Template
          </Button>
          <Button variant="secondary">
            Preview
          </Button>
          <Button variant="primary" onClick={() => setShowAddSection(!showAddSection)}>
            Add Section
          </Button>
          <Button variant="primary" onClick={() => setShowAddTable(!showAddTable)}>
            Add Table
          </Button>
        </ButtonGroup>
        
        {/* Save Status Indicator */}
        {saveMessage && (
          <div style={{
            marginTop: '15px',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: saveMessage?.includes('✅') ? '#e8f5e8' : 
                           saveMessage?.includes('⚠️') ? '#fff3e0' : 
                           saveMessage?.includes('❌') ? '#ffebee' : '#e3f2fd',
            color: saveMessage?.includes('✅') ? '#2e7d32' : 
                   saveMessage?.includes('⚠️') ? '#e65100' : 
                   saveMessage?.includes('❌') ? '#c62828' : '#1565c0',
            border: `1px solid ${saveMessage?.includes('✅') ? '#4caf50' : 
                                saveMessage?.includes('⚠️') ? '#ff9800' : 
                                saveMessage?.includes('❌') ? '#f44336' : '#2196f3'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span>{saveMessage}</span>
          </div>
        )}
      </Header>

      <TemplateArea>
        <Sidebar>
          <h3>Field Library</h3>
          {Object.entries(COMMON_FIELDS).map(([category, fields]) => (
            <CategoryGroup key={category}>
              <CategoryTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CategoryTitle>
              {fields.map((field, index) => (
                <FieldTemplate
                  key={`${field.id}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                >
                  <strong>{field.label}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {field.type} {field.formula && '(formula)'}
                  </div>
                </FieldTemplate>
              ))}
            </CategoryGroup>
          ))}
          
          <CategoryGroup>
            <CategoryTitle>Custom Fields</CategoryTitle>
            <FieldTemplate
              draggable
              onDragStart={() => handleDragStart({
                id: 'custom-text',
                label: 'Custom Text Field',
                type: 'text'
              })}
            >
              <strong>Text Field</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>text</div>
            </FieldTemplate>
            <FieldTemplate
              draggable
              onDragStart={() => handleDragStart({
                id: 'custom-number',
                label: 'Custom Number Field',
                type: 'number',
                value: 0
              })}
            >
              <strong>Number Field</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>number</div>
            </FieldTemplate>
            <FieldTemplate
              draggable
              onDragStart={() => handleDragStart({
                id: 'custom-formula',
                label: 'Custom Formula',
                type: 'formula',
                formula: '0',
                readonly: true
              })}
            >
              <strong>Formula Field</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>formula</div>
            </FieldTemplate>
          </CategoryGroup>
        </Sidebar>

        <MainArea>
          <div style={{ marginBottom: '20px' }}>
            <FieldLabel>Template Name:</FieldLabel>
            <FieldInput
              value={template.name}
              onChange={(e) => {
                const updatedTemplate = {
                  ...template,
                  name: e.target.value,
                  lastModified: new Date()
                };
                setTemplate(updatedTemplate);
                // Auto-save template name changes with debouncing
                debouncedAutoSave(updatedTemplate);
              }}
            />
          </div>

          {template.sections.map(section => (
            <SectionContainer
              key={section.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              <SectionHeader>
                <FieldInput
                  value={section.title}
                  onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                  style={{ marginRight: '10px', flex: 1 }}
                />
                <Select
                  value={section.type}
                  onChange={(e) => handleUpdateSection(section.id, { type: e.target.value as any })}
                  style={{ marginRight: '10px', width: '120px' }}
                >
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                  <option value="repeating">Repeating</option>
                </Select>
                <SectionActions>
                  <ActionButton size="small" onClick={() => handleRemoveSection(section.id)}>
                    Remove
                  </ActionButton>
                </SectionActions>
              </SectionHeader>

              <FieldsGrid>
                {section.fields.map(field => (
                  <FieldContainer key={field.id}>
                    <FieldHeader>
                      <FieldInput
                        value={field.label}
                        onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                        style={{ marginRight: '10px', flex: 1 }}
                      />
                      <ActionButton
                        size="small"
                        onClick={() => handleRemoveField(section.id, field.id)}
                      >
                        ×
                      </ActionButton>
                    </FieldHeader>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <Select
                        value={field.type}
                        onChange={(e) => handleUpdateField(section.id, field.id, { type: e.target.value as any })}
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
                        <FieldInput
                          value={field.formula || ''}
                          onChange={(e) => handleUpdateField(section.id, field.id, { formula: e.target.value })}
                          placeholder="e.g., basic_salary * 0.15"
                        />
                      </div>
                    )}

                    {field.type === 'select' && (
                      <div>
                        <FieldLabel>Options (comma-separated):</FieldLabel>
                        <FieldInput
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => handleUpdateField(section.id, field.id, { 
                            options: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                          })}
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </FieldContainer>
                ))}
              </FieldsGrid>

              {section.fields.length === 0 && (
                <AddComponentArea>
                  Drag fields here or click to add
                </AddComponentArea>
              )}
            </SectionContainer>
          ))}

          {template.sections.length === 0 && (
            <AddComponentArea onClick={() => handleAddSection('dynamic')}>
              Click to add your first section
            </AddComponentArea>
          )}
        </MainArea>
      </TemplateArea>
    </Container>
  );
};

export default TemplateBuilder;