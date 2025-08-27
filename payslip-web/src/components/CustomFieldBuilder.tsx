import React, { useState, useEffect } from 'react';
import { CustomField, customFieldManager } from '../utils/customFieldManager';

interface CustomFieldBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'employee' | 'payslip' | 'template' | 'general';
  onFieldCreated?: (field: CustomField) => void;
}

export const CustomFieldBuilder: React.FC<CustomFieldBuilderProps> = ({
  isOpen,
  onClose,
  category = 'general',
  onFieldCreated
}) => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'templates'>('create');
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    category: category,
    isSystem: false,
    isActive: true
  });
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      loadFields();
    }
  }, [isOpen, category]);

  const loadFields = () => {
    setFields(customFieldManager.getFieldsByCategory(category));
  };

  const handleCreateField = () => {
    if (!newField.name || !newField.label) return;

    const fieldData = {
      ...newField,
      options: newField.type === 'select' || newField.type === 'radio' ? fieldOptions : undefined
    } as Omit<CustomField, 'id' | 'createdDate' | 'lastModified' | 'createdBy' | 'modifiedBy'>;

    const fieldId = customFieldManager.createField(fieldData);
    const createdField = customFieldManager.getField(fieldId);
    
    if (createdField && onFieldCreated) {
      onFieldCreated(createdField);
    }

    // Reset form
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      category: category,
      isSystem: false,
      isActive: true
    });
    setFieldOptions([]);
    loadFields();
  };

  const handleUpdateField = () => {
    if (!editingField) return;

    customFieldManager.updateField(editingField.id, editingField);
    setEditingField(null);
    loadFields();
  };

  const handleDeleteField = (fieldId: string) => {
    if (customFieldManager.deleteField(fieldId)) {
      loadFields();
    }
  };

  const handleUseTemplate = (template: Partial<CustomField>) => {
    const fieldId = customFieldManager.createFromTemplate(template);
    const createdField = customFieldManager.getField(fieldId);
    
    if (createdField && onFieldCreated) {
      onFieldCreated(createdField);
    }
    
    loadFields();
  };

  const addOption = () => {
    setFieldOptions([...fieldOptions, { value: '', label: '' }]);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const updated = [...fieldOptions];
    updated[index] = { ...updated[index], [field]: value };
    setFieldOptions(updated);
  };

  const removeOption = (index: number) => {
    setFieldOptions(fieldOptions.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

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
    padding: '10px 15px',
    background: isActive ? '#1565c0' : '#f5f5f5',
    color: isActive ? 'white' : '#666',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginRight: '2px'
  });

  const templates = customFieldManager.getFieldTemplates();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #1565c0',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1565c0', fontSize: '24px' }}>
              🛠️ Custom Field Builder - {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { key: 'create', label: '➕ Create Field' },
              { key: 'manage', label: '⚙️ Manage Fields' },
              { key: 'templates', label: '📋 Templates' }
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
        <div style={{ padding: '30px' }}>
          {activeTab === 'create' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>Create New Custom Field</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Field Name (Internal)</label>
                  <input
                    type="text"
                    value={newField.name || ''}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    style={fieldStyle}
                    placeholder="e.g., custom_allowance"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Field Label (Display)</label>
                  <input
                    type="text"
                    value={newField.label || ''}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    style={fieldStyle}
                    placeholder="e.g., Custom Allowance"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Field Type</label>
                  <select
                    value={newField.type || 'text'}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                    style={fieldStyle}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="url">URL</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio Buttons</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Placeholder Text</label>
                  <input
                    type="text"
                    value={newField.placeholder || ''}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                    style={fieldStyle}
                    placeholder="Placeholder text"
                  />
                </div>
              </div>

              {(newField.type === 'select' || newField.type === 'radio') && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={labelStyle}>Options</label>
                    <button
                      onClick={addOption}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  {fieldOptions.map((option, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        style={fieldStyle}
                        placeholder="Value"
                      />
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        style={fieldStyle}
                        placeholder="Display Label"
                      />
                      <button
                        onClick={() => removeOption(index)}
                        style={{
                          padding: '5px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={newField.required || false}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    style={{ marginRight: '10px' }}
                  />
                  Required Field
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCreateField}
                  disabled={!newField.name || !newField.label}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: newField.name && newField.label ? '#1565c0' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newField.name && newField.label ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🚀 Create Field
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>Manage Existing Fields</h3>
              
              {fields.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                  No custom fields created yet for this category.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {fields.map(field => (
                    <div key={field.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: field.isActive ? '#fafafa' : '#f0f0f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1565c0' }}>{field.label}</h4>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <span style={{ marginRight: '15px' }}>Name: {field.name}</span>
                            <span style={{ marginRight: '15px' }}>Type: {field.type}</span>
                            <span style={{ marginRight: '15px' }}>Required: {field.required ? 'Yes' : 'No'}</span>
                            {field.isSystem && <span style={{ color: '#f44336', fontWeight: 'bold' }}>SYSTEM FIELD</span>}
                          </div>
                        </div>
                        
                        {!field.isSystem && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setEditingField(field)}
                              style={{
                                padding: '5px 10px',
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
                              onClick={() => handleDeleteField(field.id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {field.options && field.options.length > 0 && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>Options:</strong> {field.options.map(opt => opt.label).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>Quick Templates</h3>
              
              {templates.map(templateCategory => (
                <div key={templateCategory.category} style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#333', marginBottom: '15px' }}>{templateCategory.category}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {templateCategory.templates.map((template, index) => (
                      <div key={index} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: '#fafafa'
                      }}>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#1565c0' }}>{template.label}</strong>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Type: {template.type} | Required: {template.required ? 'Yes' : 'No'}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleUseTemplate(template)}
                          style={{
                            width: '100%',
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
                          🚀 Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingField && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ color: '#1565c0', marginBottom: '20px' }}>Edit Field</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Field Label</label>
                <input
                  type="text"
                  value={editingField.label}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  style={fieldStyle}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                    style={{ marginRight: '10px' }}
                  />
                  Required Field
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={editingField.isActive}
                    onChange={(e) => setEditingField({ ...editingField, isActive: e.target.checked })}
                    style={{ marginRight: '10px' }}
                  />
                  Active Field
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingField(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateField}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1565c0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};