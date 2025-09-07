import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

interface Props {
  templateId?: string;
  onSave?: (template: PayslipTemplate) => void;
}

const TemplateBuilder: React.FC<Props> = ({ templateId, onSave }) => {
  const [template, setTemplate] = useState<PayslipTemplate | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (templateId) {
        const existingTemplate = templateManager.getTemplate(templateId);
        if (existingTemplate) {
          setTemplate(existingTemplate);
        } else {
          setError('Template not found');
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
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  // Background save function - truly non-blocking
  const backgroundSave = useCallback(async (template: PayslipTemplate) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 3000);
    });
    
    try {
      console.log('🔄 Background: Attempting database save for:', template.name);
      
      const dbResult = await Promise.race([
        supabaseTemplateService.saveTemplate(template),
        timeoutPromise
      ]) as any;
      
      if (dbResult && dbResult.success) {
        console.log('✅ Background: Database save successful');
      } else {
        console.warn('⚠️ Background: Database save failed:', dbResult?.error || 'Unknown error');
      }
    } catch (error) {
      console.warn('Background save failed (non-blocking):', error);
    }
  }, []);

  // Debounced auto-save function
  const debouncedAutoSave = useCallback((template: PayslipTemplate) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Save to local storage immediately for instant responsiveness
    try {
      if (templateId) {
        templateManager.updateTemplate(templateId, {
          type: 'UPDATE_TEMPLATE_SETTINGS',
          updates: template
        });
      } else {
        templateManager.createTemplate(template);
      }
    } catch (error) {
      console.warn('Local save failed:', error);
    }
    
    const timeoutId = setTimeout(() => {
      backgroundSave(template).catch(error => {
        console.warn('Background save failed silently:', error);
      });
    }, 500);
    
    setAutoSaveTimeout(timeoutId);
  }, [autoSaveTimeout, templateId, backgroundSave]);

  const handleSaveTemplate = useCallback(() => {
    if (!template) return;
    
    setSaveMessage('✅ Template saved locally!');
    
    try {
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
      
      setTimeout(() => setSaveMessage(null), 1500);
      
    } catch (error) {
      console.error('Local save failed:', error);
      setSaveMessage('❌ Save failed!');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    
    backgroundSave(template).catch(error => {
      console.warn('Background database save failed:', error);
    });
  }, [template, templateId, onSave, backgroundSave]);

  if (isLoading) {
    return (
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2196f3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: '#666', fontSize: '16px' }}>Loading template...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          flexDirection: 'column',
          gap: '20px',
          color: '#f44336'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Error: {error}</div>
          <Button 
            variant="primary" 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!template) {
    return (
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          color: '#666'
        }}>
          No template data available
        </div>
      </Container>
    );
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
            Save Template
          </Button>
          <Button variant="secondary">
            Preview
          </Button>
        </ButtonGroup>
        
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

      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '5px',
            display: 'block'
          }}>Template Name:</label>
          <input
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '14px'
            }}
            value={template.name}
            onChange={(e) => {
              const updatedTemplate = {
                ...template,
                name: e.target.value,
                lastModified: new Date()
              };
              setTemplate(updatedTemplate);
              debouncedAutoSave(updatedTemplate);
            }}
          />
        </div>
        
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#666',
          border: '2px dashed #ccc',
          borderRadius: '8px'
        }}>
          Template builder interface will be enhanced here.
          <br />
          Current template: {template.name}
          <br />
          Sections: {template.sections?.length || 0}
        </div>
      </div>
    </Container>
  );
};

export default TemplateBuilder;