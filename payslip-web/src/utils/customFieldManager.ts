// Custom Field Management System

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ value: string; label: string }>; // For select, radio
  category: 'employee' | 'payslip' | 'template' | 'general';
  isSystem: boolean; // System fields cannot be deleted
  isActive: boolean;
  createdDate: Date;
  lastModified: Date;
  createdBy: string;
  modifiedBy: string;
}

export interface CustomFieldValue {
  fieldId: string;
  entityId: string; // employee ID, payslip ID, etc.
  entityType: 'employee' | 'payslip' | 'template';
  value: any;
  lastModified: Date;
}

export class CustomFieldManager {
  private customFields: Map<string, CustomField> = new Map();
  private fieldValues: Map<string, CustomFieldValue[]> = new Map(); // entityId -> CustomFieldValue[]
  private currentUser = 'admin@company.com';

  constructor() {
    this.loadFromStorage();
    this.initializeSystemFields();
  }

  // Field Management
  createField(fieldData: Omit<CustomField, 'id' | 'createdDate' | 'lastModified' | 'createdBy' | 'modifiedBy'>): string {
    const id = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const field: CustomField = {
      ...fieldData,
      id,
      createdDate: new Date(),
      lastModified: new Date(),
      createdBy: this.currentUser,
      modifiedBy: this.currentUser
    };

    this.customFields.set(id, field);
    this.saveToStorage();
    
    return id;
  }

  updateField(fieldId: string, updates: Partial<CustomField>): boolean {
    const field = this.customFields.get(fieldId);
    if (!field || field.isSystem) return false;

    const updatedField: CustomField = {
      ...field,
      ...updates,
      id: fieldId, // Ensure ID doesn't change
      lastModified: new Date(),
      modifiedBy: this.currentUser
    };

    this.customFields.set(fieldId, updatedField);
    this.saveToStorage();
    
    return true;
  }

  deleteField(fieldId: string): boolean {
    const field = this.customFields.get(fieldId);
    if (!field || field.isSystem) return false;

    this.customFields.delete(fieldId);
    // Also remove all values for this field
    this.fieldValues.forEach((values, entityId) => {
      const filteredValues = values.filter(v => v.fieldId !== fieldId);
      this.fieldValues.set(entityId, filteredValues);
    });
    
    this.saveToStorage();
    return true;
  }

  getField(fieldId: string): CustomField | null {
    return this.customFields.get(fieldId) || null;
  }

  getAllFields(): CustomField[] {
    return Array.from(this.customFields.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getFieldsByCategory(category: CustomField['category']): CustomField[] {
    return this.getAllFields().filter(field => field.category === category && field.isActive);
  }

  // Field Value Management
  setFieldValue(entityId: string, entityType: CustomField['category'], fieldId: string, value: any): boolean {
    const field = this.customFields.get(fieldId);
    if (!field) return false;

    // Validate value
    if (!this.validateFieldValue(field, value)) return false;

    if (!this.fieldValues.has(entityId)) {
      this.fieldValues.set(entityId, []);
    }

    const entityValues = this.fieldValues.get(entityId)!;
    const existingValueIndex = entityValues.findIndex(v => v.fieldId === fieldId);

    const fieldValue: CustomFieldValue = {
      fieldId,
      entityId,
      entityType: entityType as any,
      value,
      lastModified: new Date()
    };

    if (existingValueIndex >= 0) {
      entityValues[existingValueIndex] = fieldValue;
    } else {
      entityValues.push(fieldValue);
    }

    this.saveToStorage();
    return true;
  }

  getFieldValue(entityId: string, fieldId: string): any {
    const entityValues = this.fieldValues.get(entityId);
    if (!entityValues) return null;

    const fieldValue = entityValues.find(v => v.fieldId === fieldId);
    return fieldValue ? fieldValue.value : null;
  }

  getAllFieldValues(entityId: string): Map<string, any> {
    const values = new Map<string, any>();
    const entityValues = this.fieldValues.get(entityId);
    
    if (entityValues) {
      entityValues.forEach(fv => {
        values.set(fv.fieldId, fv.value);
      });
    }

    return values;
  }

  // Validation
  private validateFieldValue(field: CustomField, value: any): boolean {
    if (field.required && (value === null || value === undefined || value === '')) {
      return false;
    }

    if (field.validation) {
      const val = field.validation;
      
      if (field.type === 'number' && typeof value === 'number') {
        if (val.min !== undefined && value < val.min) return false;
        if (val.max !== undefined && value > val.max) return false;
      }
      
      if (field.type === 'text' || field.type === 'textarea') {
        const strValue = String(value);
        if (val.minLength !== undefined && strValue.length < val.minLength) return false;
        if (val.maxLength !== undefined && strValue.length > val.maxLength) return false;
        if (val.pattern && !new RegExp(val.pattern).test(strValue)) return false;
      }
    }

    return true;
  }

  // Field Templates for quick creation
  getFieldTemplates(): Array<{ category: string; templates: Partial<CustomField>[] }> {
    return [
      {
        category: 'Employee Fields',
        templates: [
          {
            name: 'middle_name',
            label: 'Middle Name',
            type: 'text',
            category: 'employee',
            required: false
          },
          {
            name: 'employee_photo',
            label: 'Employee Photo URL',
            type: 'url',
            category: 'employee',
            required: false
          },
          {
            name: 'skills',
            label: 'Skills & Certifications',
            type: 'textarea',
            category: 'employee',
            required: false
          },
          {
            name: 'performance_rating',
            label: 'Performance Rating',
            type: 'select',
            category: 'employee',
            required: false,
            options: [
              { value: '5', label: '5 - Excellent' },
              { value: '4', label: '4 - Very Good' },
              { value: '3', label: '3 - Good' },
              { value: '2', label: '2 - Needs Improvement' },
              { value: '1', label: '1 - Unsatisfactory' }
            ]
          }
        ]
      },
      {
        category: 'Payslip Fields',
        templates: [
          {
            name: 'commission',
            label: 'Sales Commission',
            type: 'number',
            category: 'payslip',
            required: false,
            validation: { min: 0 }
          },
          {
            name: 'reimbursements',
            label: 'Travel Reimbursements',
            type: 'number',
            category: 'payslip',
            required: false,
            validation: { min: 0 }
          },
          {
            name: 'uniform_allowance',
            label: 'Uniform Allowance',
            type: 'number',
            category: 'payslip',
            required: false,
            validation: { min: 0 }
          },
          {
            name: 'internet_allowance',
            label: 'Internet Allowance',
            type: 'number',
            category: 'payslip',
            required: false,
            validation: { min: 0 }
          }
        ]
      },
      {
        category: 'Template Fields',
        templates: [
          {
            name: 'company_logo_url',
            label: 'Company Logo URL',
            type: 'url',
            category: 'template',
            required: false
          },
          {
            name: 'disclaimer_text',
            label: 'Payslip Disclaimer',
            type: 'textarea',
            category: 'template',
            required: false,
            defaultValue: 'This payslip is confidential and for the employee only.'
          },
          {
            name: 'footer_text',
            label: 'Footer Text',
            type: 'textarea',
            category: 'template',
            required: false
          }
        ]
      }
    ];
  }

  createFromTemplate(template: Partial<CustomField>): string {
    return this.createField({
      name: template.name || 'custom_field',
      label: template.label || 'Custom Field',
      type: template.type || 'text',
      required: template.required || false,
      placeholder: template.placeholder,
      defaultValue: template.defaultValue,
      validation: template.validation,
      options: template.options,
      category: template.category || 'general',
      isSystem: false,
      isActive: true
    });
  }

  // System fields initialization
  private initializeSystemFields() {
    const systemFields: Omit<CustomField, 'id' | 'createdDate' | 'lastModified' | 'createdBy' | 'modifiedBy'>[] = [
      {
        name: 'employee_notes',
        label: 'Employee Notes',
        type: 'textarea',
        required: false,
        category: 'employee',
        isSystem: true,
        isActive: true
      },
      {
        name: 'payslip_notes',
        label: 'Payslip Notes',
        type: 'textarea',
        required: false,
        category: 'payslip',
        isSystem: true,
        isActive: true
      }
    ];

    systemFields.forEach(fieldData => {
      // Only create if not exists
      const existingField = Array.from(this.customFields.values()).find(f => f.name === fieldData.name);
      if (!existingField) {
        this.createField(fieldData);
      }
    });
  }

  // Data Export/Import
  exportFieldData(): string {
    return JSON.stringify({
      fields: Array.from(this.customFields.entries()),
      values: Array.from(this.fieldValues.entries()),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  importFieldData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.fields && parsed.values) {
        this.customFields = new Map(parsed.fields);
        this.fieldValues = new Map(parsed.values);
        this.saveToStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing field data:', error);
      return false;
    }
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem('custom-fields-data', JSON.stringify({
        fields: Array.from(this.customFields.entries()),
        values: Array.from(this.fieldValues.entries())
      }));
    } catch (error) {
      console.error('Error saving custom fields:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('custom-fields-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.customFields = new Map(parsed.fields || []);
        this.fieldValues = new Map(parsed.values || []);
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    }
  }

  // Search and filter
  searchFields(query: string, category?: CustomField['category']): CustomField[] {
    const searchTerm = query.toLowerCase();
    let fields = this.getAllFields();

    if (category) {
      fields = fields.filter(field => field.category === category);
    }

    if (searchTerm) {
      fields = fields.filter(field =>
        field.name.toLowerCase().includes(searchTerm) ||
        field.label.toLowerCase().includes(searchTerm)
      );
    }

    return fields;
  }

  // Field usage statistics
  getFieldUsageStats(): Array<{ fieldId: string; fieldName: string; usageCount: number }> {
    const stats = new Map<string, number>();
    
    this.fieldValues.forEach(entityValues => {
      entityValues.forEach(fieldValue => {
        const currentCount = stats.get(fieldValue.fieldId) || 0;
        stats.set(fieldValue.fieldId, currentCount + 1);
      });
    });

    return Array.from(stats.entries()).map(([fieldId, usageCount]) => {
      const field = this.customFields.get(fieldId);
      return {
        fieldId,
        fieldName: field ? field.label : 'Unknown Field',
        usageCount
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }
}

// Singleton instance
export const customFieldManager = new CustomFieldManager();