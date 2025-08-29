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

    // 3. Always start with exactly 2 clean default templates
    console.log('🧹 TemplateSync: Clearing all templates and creating clean defaults');
    
    // Clear from Enhanced Template Builder storage
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('payslip-templates');
      localStorage.removeItem('payslip-payslips');
      localStorage.removeItem('payslip-batches');
      console.log('🧹 All templates cleared from storage');
    } catch (e) {
      console.error('Error clearing templates:', e);
    }
    
    const defaults = this.createDefaultTemplates();
    templates.length = 0; // Clear the array
    templates.push(...defaults);
    this.saveTemplates(templates);

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
   * Clear all templates from all storage locations
   */
  clearAllTemplates(): void {
    try {
      // Clear from Enhanced Template Builder storage
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Clear from Template Manager storage  
      localStorage.removeItem('payslip-templates');
      localStorage.removeItem('payslip-payslips');
      localStorage.removeItem('payslip-batches');
      
      console.log('🧹 All templates cleared from storage');
    } catch (e) {
      console.error('Error clearing templates:', e);
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
      compatibleViews: ['basic', 'excel'],
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
            { id: 'position', label: 'Position', type: 'text' },
            { id: 'email', label: 'Email', type: 'text' },
            { id: 'phone', label: 'Phone', type: 'text' }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'earnings',
          title: 'Earnings',
          type: 'static',
          fields: [
            { id: 'basic_salary', label: 'Basic Salary', type: 'number', required: true },
            { id: 'allowances', label: 'Allowances', type: 'number' },
            { id: 'overtime', label: 'Overtime Pay', type: 'number' },
            { id: 'bonus', label: 'Bonus', type: 'number' },
            { id: 'commission', label: 'Commission', type: 'number' },
            { id: 'gross_pay', label: 'Gross Pay', type: 'formula', formula: 'basic_salary + allowances + overtime + bonus + commission', readonly: true }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'deductions',
          title: 'Deductions',
          type: 'static',
          fields: [
            { id: 'income_tax', label: 'Income Tax', type: 'number' },
            { id: 'social_security', label: 'Social Security', type: 'number' },
            { id: 'health_insurance', label: 'Health Insurance', type: 'number' },
            { id: 'retirement_fund', label: 'Retirement Fund', type: 'number' },
            { id: 'other_deductions', label: 'Other Deductions', type: 'number' },
            { id: 'total_deductions', label: 'Total Deductions', type: 'formula', formula: 'income_tax + social_security + health_insurance + retirement_fund + other_deductions', readonly: true }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'summary',
          title: 'Pay Summary',
          type: 'static',
          fields: [
            { id: 'gross_total', label: 'Gross Total', type: 'formula', formula: 'gross_pay', readonly: true },
            { id: 'deductions_total', label: 'Total Deductions', type: 'formula', formula: 'total_deductions', readonly: true },
            { id: 'net_pay', label: 'Net Pay', type: 'formula', formula: 'gross_pay - total_deductions', readonly: true }
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
    };

    const annualTemplate: PayslipTemplate = {
      id: 'unified-annual-template',
      name: '📊 Annual Excel Template',
      version: '1.0',
      description: 'Universal annual template - perfect for Excel view and data analysis',
      type: 'advanced',
      compatibleViews: ['basic', 'excel'],
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
            { id: 'hire_date', label: 'Hire Date', type: 'date' },
            { id: 'email', label: 'Email', type: 'text' },
            { id: 'phone', label: 'Phone', type: 'text' },
            { id: 'emp_status', label: 'Employment Status', type: 'text' }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'advanced-earnings',
          title: 'Advanced Earnings Analysis',
          type: 'static',
          fields: [
            { id: 'base_salary', label: 'Base Salary', type: 'number', required: true },
            { id: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
            { id: 'hours_worked', label: 'Hours Worked', type: 'number' },
            { id: 'overtime_hours', label: 'Overtime Hours', type: 'number' },
            { id: 'overtime_rate', label: 'Overtime Rate', type: 'number' },
            { id: 'allowances', label: 'Allowances', type: 'number' },
            { id: 'performance_bonus', label: 'Performance Bonus', type: 'number' },
            { id: 'commission_rate', label: 'Commission Rate (%)', type: 'number' },
            { id: 'commission_amount', label: 'Commission Amount', type: 'number' },
            { id: 'total_earnings', label: 'Total Earnings', type: 'formula', formula: 'base_salary + (hours_worked * hourly_rate) + (overtime_hours * overtime_rate) + allowances + performance_bonus + commission_amount', readonly: true }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'advanced-deductions',
          title: 'Advanced Deductions & Taxes',
          type: 'static',
          fields: [
            { id: 'federal_tax', label: 'Federal Income Tax', type: 'number' },
            { id: 'state_tax', label: 'State Tax', type: 'number' },
            { id: 'local_tax', label: 'Local Tax', type: 'number' },
            { id: 'social_security_tax', label: 'Social Security Tax', type: 'number' },
            { id: 'medicare_tax', label: 'Medicare Tax', type: 'number' },
            { id: 'unemployment_tax', label: 'Unemployment Tax', type: 'number' },
            { id: 'health_premium', label: 'Health Insurance Premium', type: 'number' },
            { id: 'dental_premium', label: 'Dental Insurance Premium', type: 'number' },
            { id: 'vision_premium', label: 'Vision Insurance Premium', type: 'number' },
            { id: 'retirement_401k', label: '401(k) Contribution', type: 'number' },
            { id: 'life_insurance', label: 'Life Insurance Premium', type: 'number' },
            { id: 'union_dues', label: 'Union Dues', type: 'number' },
            { id: 'parking_fees', label: 'Parking Fees', type: 'number' },
            { id: 'other_deductions_advanced', label: 'Other Deductions', type: 'number' },
            { id: 'total_deductions_advanced', label: 'Total Deductions', type: 'formula', formula: 'federal_tax + state_tax + local_tax + social_security_tax + medicare_tax + unemployment_tax + health_premium + dental_premium + vision_premium + retirement_401k + life_insurance + union_dues + parking_fees + other_deductions_advanced', readonly: true }
          ],
          canAddFields: true,
          canRemove: false
        },
        {
          id: 'advanced-summary',
          title: 'Advanced Pay Summary & Analysis',
          type: 'static',
          fields: [
            { id: 'gross_earnings', label: 'Gross Earnings', type: 'formula', formula: 'total_earnings', readonly: true },
            { id: 'total_taxes', label: 'Total Taxes', type: 'formula', formula: 'federal_tax + state_tax + local_tax + social_security_tax + medicare_tax + unemployment_tax', readonly: true },
            { id: 'total_insurance', label: 'Total Insurance', type: 'formula', formula: 'health_premium + dental_premium + vision_premium + life_insurance', readonly: true },
            { id: 'total_benefits', label: 'Total Benefits Deductions', type: 'formula', formula: 'retirement_401k + union_dues + parking_fees', readonly: true },
            { id: 'net_pay_advanced', label: 'Net Pay', type: 'formula', formula: 'total_earnings - total_deductions_advanced', readonly: true },
            { id: 'take_home_percentage', label: 'Take Home %', type: 'formula', formula: '(net_pay_advanced / total_earnings) * 100', readonly: true }
          ],
          canAddFields: false,
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