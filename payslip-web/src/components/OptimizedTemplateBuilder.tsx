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

interface Props {
  templateId?: string;
  onSave?: (template: PayslipTemplate) => void;
}

const OptimizedTemplateBuilder: React.FC<Props> = ({ templateId, onSave }) => {
  const [template, setTemplate] = useState<PayslipTemplate | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' | 'saving' } | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized field categories
  const fieldCategories = useMemo(() => Object.entries(COMMON_FIELDS), []);

  // Initialize template
  useEffect(() => {
    const initializeTemplate = async () => {
      try {
        setLoading(true);
        
        if (templateId) {
          const existingTemplate = templateManager.getTemplate(templateId);
          if (existingTemplate) {
            setTemplate(existingTemplate);
          } else {
            // Try to load from backend
            const result = await supabaseTemplateService.loadTemplate(templateId);
            if (result.success && result.data) {
              setTemplate(result.data);
            }
          }
        } else {
          // Create new template
          const newTemplate: PayslipTemplate = {
            id: `template-${Date.now()}`,
            name: 'New Template',
            version: '1.0',
            description: 'A new payslip template',
            type: 'advanced',
            compatibleViews: ['basic', 'excel'],
            header: {
              id: 'header-' + Date.now(),
              title: 'PAYSLIP',
              subtitle: 'Monthly Salary Statement',
              companyInfo: {
                name: 'Company Name',
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
          setTemplate(newTemplate);
        }
      } catch (error) {
        console.error('Error initializing template:', error);
        setSaveMessage({ text: 'Failed to load template', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeTemplate();
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

  // Manual save
  const handleSave = useCallback(async () => {
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
        <Title>Template Builder</Title>
        <ButtonGroup>
          <Button variant="success" onClick={handleSave}>
            💾 Save Template
          </Button>
          <Button variant="primary" onClick={addSection}>
            ➕ Add Section
          </Button>
        </ButtonGroup>
        {saveMessage && (
          <SaveStatus type={saveMessage.type}>
            {saveMessage.text}
          </SaveStatus>
        )}
      </Header>

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
                  color: '#666'
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
                  ? `${section.fields.length} fields added`
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

export default OptimizedTemplateBuilder;