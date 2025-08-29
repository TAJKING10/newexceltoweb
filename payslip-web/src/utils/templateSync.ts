import { PayslipTemplate } from '../types/PayslipTypes';
import { templateManager } from './templateManager';

/**
 * Unified Template Synchronization Service
 * Ensures perfect synchronization between Template Builder, Excel View, and Basic View
 */
class TemplateSyncService {
  private readonly STORAGE_KEY = 'payslip-templates';
  private readonly TEMPLATE_MANAGER_KEY = 'payslip-templates-manager';
  
  private listeners: Set<() => void> = new Set();

  /**
   * Get all templates from all sources and merge them
   */
  getAllTemplates(): PayslipTemplate[] {
    const templates: PayslipTemplate[] = [];
    
    // 1. Load from Enhanced Template Builder (localStorage array)
    try {
      const enhancedTemplates = localStorage.getItem(this.STORAGE_KEY);
      if (enhancedTemplates) {
        const parsed = JSON.parse(enhancedTemplates);
        if (Array.isArray(parsed)) {
          parsed.forEach((template: any) => {
            if (template && template.id && !templates.find(t => t.id === template.id)) {
              templates.push(this.sanitizeTemplate(template));
            }
          });
        }
      }
    } catch (e) {
      console.log('Could not load from Enhanced Template Builder storage');
    }

    // 2. Load from Template Manager (Map format)
    try {
      const managerTemplates = templateManager.getAllTemplates();
      managerTemplates.forEach(template => {
        if (template && template.id && !templates.find(t => t.id === template.id)) {
          templates.push(this.sanitizeTemplate(template));
        }
      });
    } catch (e) {
      console.log('Could not load from Template Manager');
    }

    // 3. Create default templates if none exist
    if (templates.length === 0) {
      const defaults = this.createDefaultTemplates();
      templates.push(...defaults);
      this.saveTemplates(templates);
    }

    console.log(`📋 TemplateSyncService: Loaded ${templates.length} templates`);
    templates.forEach(t => {
      console.log(`  - ${this.getTemplateIcon(t.type)} ${t.name} (${t.type})`);
    });

    return templates;
  }

  /**
   * Save templates to all storage locations
   */
  saveTemplates(templates: PayslipTemplate[]): void {
    try {
      // Save to Enhanced Template Builder format (array)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
      
      // Save to Template Manager format (individual saves)
      templates.forEach(template => {
        try {
          const existingTemplate = templateManager.getTemplate(template.id);
          if (existingTemplate) {
            // Update existing
            templateManager.updateTemplate(template.id, {
              type: 'UPDATE_TEMPLATE_SETTINGS',
              updates: template
            });
          } else {
            // Create new - remove id first to let templateManager assign it
            const templateCopy = { ...template };
            delete (templateCopy as any).id;
            const newId = templateManager.createTemplate(templateCopy);
            // Update our template with the manager's ID if different
            if (newId !== template.id) {
              template.id = newId;
            }
          }
        } catch (e) {
          console.log(`Could not sync template ${template.id} to manager`);
        }
      });

      console.log(`💾 TemplateSyncService: Saved ${templates.length} templates to all storage locations`);
      
      // Notify all listeners of the change
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving templates:', e);
    }
  }

  /**
   * Add a single template
   */
  addTemplate(template: PayslipTemplate): void {
    const templates = this.getAllTemplates();
    
    // Check if template already exists
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      // Update existing
      templates[existingIndex] = this.sanitizeTemplate(template);
    } else {
      // Add new
      templates.push(this.sanitizeTemplate(template));
    }
    
    this.saveTemplates(templates);
  }

  /**
   * Update an existing template
   */
  updateTemplate(templateId: string, updates: Partial<PayslipTemplate>): void {
    const templates = this.getAllTemplates();
    const templateIndex = templates.findIndex(t => t.id === templateId);
    
    if (templateIndex >= 0) {
      templates[templateIndex] = {
        ...templates[templateIndex],
        ...updates,
        lastModified: new Date()
      };
      this.saveTemplates(templates);
    }
  }

  /**
   * Delete a template
   */
  deleteTemplate(templateId: string): void {
    const templates = this.getAllTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    
    // Also try to delete from template manager
    try {
      templateManager.deleteTemplate(templateId);
    } catch (e) {
      console.log('Could not delete from template manager');
    }
    
    this.saveTemplates(filteredTemplates);
  }

  /**
   * Subscribe to template changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Force refresh all templates from all sources
   */
  forceRefresh(): void {
    console.log('🔄 TemplateSyncService: Force refreshing templates');
    this.notifyListeners();
  }

  private sanitizeTemplate(template: any): PayslipTemplate {
    return {
      ...template,
      description: template.description || 'No description',
      type: template.type || 'basic',
      sections: Array.isArray(template.sections) ? template.sections : [],
      tables: Array.isArray(template.tables) ? template.tables : [],
      subHeaders: Array.isArray(template.subHeaders) ? template.subHeaders : [],
      globalFormulas: template.globalFormulas || {},
      styling: template.styling || {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        primaryColor: '#1565c0',
        secondaryColor: '#f5f5f5',
        borderStyle: 'solid'
      },
      layout: template.layout || {
        columnsPerRow: 2,
        sectionSpacing: 15,
        printOrientation: 'portrait'
      },
      isEditable: template.isEditable !== false,
      createdDate: template.createdDate ? new Date(template.createdDate) : new Date(),
      lastModified: template.lastModified ? new Date(template.lastModified) : new Date()
    };
  }

  private createDefaultTemplates(): PayslipTemplate[] {
    const basicTemplate: PayslipTemplate = {
      id: 'unified-basic-template',
      name: '📝 Basic Payslip Template',
      version: '1.0',
      description: 'Universal basic template - works perfectly in all views',
      type: 'basic',
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
          { id: 'pay-period', label: 'Pay Period', value: 'Monthly', type: 'text', editable: true },
          { id: 'pay-date', label: 'Pay Date', value: new Date().toLocaleDateString(), type: 'date', editable: true },
          { id: 'pay-method', label: 'Payment Method', value: 'Direct Deposit', type: 'text', editable: true }
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

    const annualTemplate: PayslipTemplate = {
      id: 'unified-annual-template',
      name: '📊 Annual Excel Template',
      version: '1.0',
      description: 'Universal annual template - perfect for Excel view and data analysis',
      type: 'annual',
      header: {
        id: 'annual-header',
        title: 'ANNUAL PAYROLL STATEMENT',
        subtitle: 'Complete Yearly Financial Report',
        companyInfo: {
          name: 'Annual Analytics Corp.',
          address: '456 Excel Drive, Data City, State 67890',
          phone: '+1 (555) 999-0000',
          email: 'annual@company.com'
        }
      },
      subHeaders: [{
        id: 'annual-subheader',
        sections: [
          { id: 'fiscal-year', label: 'Fiscal Year', value: new Date().getFullYear().toString(), type: 'text', editable: true },
          { id: 'report-type', label: 'Report Type', value: 'Annual Summary', type: 'text', editable: true },
          { id: 'generated-date', label: 'Generated', value: new Date().toLocaleDateString(), type: 'date', editable: true }
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
            { id: 'hire_date', label: 'Hire Date', type: 'date' }
          ],
          canAddFields: true,
          canRemove: false
        }
      ],
      tables: [
        {
          id: 'monthly-summary',
          title: 'Monthly Summary',
          columns: [
            { id: 'month', header: 'Month', type: 'text' },
            { id: 'gross', header: 'Gross Pay', type: 'number' },
            { id: 'deductions', header: 'Deductions', type: 'number' },
            { id: 'net', header: 'Net Pay', type: 'formula', formula: 'gross - deductions', readonly: true }
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
        printOrientation: 'landscape'
      },
      isEditable: true,
      createdDate: new Date(),
      lastModified: new Date()
    };

    return [basicTemplate, annualTemplate];
  }

  private getTemplateIcon(type: string): string {
    switch (type) {
      case 'basic': return '📝';
      case 'annual': return '📊';
      case 'custom': return '⚡';
      default: return '📋';
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error in template sync listener:', e);
      }
    });
  }
}

// Export singleton instance
export const templateSync = new TemplateSyncService();