// Advanced Payslip Template Types

export interface TemplateHeader {
  id: string;
  title: string;
  subtitle?: string;
  logo?: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  styling?: {
    titleColor?: string;
    subtitleColor?: string;
    backgroundColor?: string;
    fontSize?: {
      title?: number;
      subtitle?: number;
      info?: number;
    };
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface TemplateSubHeader {
  id: string;
  sections: Array<{
    id: string;
    label: string;
    value: string;
    type: 'text' | 'date' | 'number';
    editable: boolean;
  }>;
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderStyle?: string;
  };
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'formula';
  value?: any;
  formula?: string;
  options?: string[]; // For select type
  required?: boolean;
  readonly?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SectionDefinition {
  id: string;
  title: string;
  type: 'static' | 'dynamic' | 'repeating';
  fields: FieldDefinition[];
  canAddFields: boolean;
  canRemove: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    headerStyle?: 'bold' | 'normal' | 'italic';
  };
}

export interface TableColumn {
  id: string;
  header: string;
  type: 'text' | 'number' | 'formula';
  width?: number;
  formula?: string;
  readonly?: boolean;
}

export interface DynamicTable {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: { [columnId: string]: any }[];
  canAddColumns: boolean;
  canAddRows: boolean;
  canRemoveColumns: boolean;
  canRemoveRows: boolean;
}

export interface PayslipTemplate {
  id: string;
  name: string;
  version: string;
  description?: string;
  type: 'basic' | 'custom';
  header: TemplateHeader;
  subHeaders: TemplateSubHeader[];
  sections: SectionDefinition[];
  tables: DynamicTable[];
  globalFormulas: { [key: string]: string };
  styling: {
    fontFamily: string;
    fontSize: number;
    primaryColor: string;
    secondaryColor: string;
    borderStyle: 'solid' | 'dotted' | 'dashed';
  };
  layout: {
    columnsPerRow: number;
    sectionSpacing: number;
    printOrientation: 'portrait' | 'landscape';
  };
  isEditable: boolean;
  createdDate: Date;
  lastModified: Date;
}

export interface EmployeePayslip {
  id: string;
  templateId: string;
  employeeId: string;
  data: { [fieldId: string]: any };
  tableData: { [tableId: string]: { [columnId: string]: any }[] };
  calculatedValues: { [key: string]: any };
  generatedDate: Date;
  payPeriod: string;
}

export interface PayslipBatch {
  id: string;
  name: string;
  templateId: string;
  payslips: EmployeePayslip[];
  status: 'draft' | 'processing' | 'completed' | 'error';
  createdDate: Date;
  processedDate?: Date;
}

// Predefined field templates for common payslip elements
export const COMMON_FIELDS: { [category: string]: FieldDefinition[] } = {
  employee: [
    { id: 'emp_name', label: 'Employee Name', type: 'text', required: true },
    { id: 'emp_id', label: 'Employee ID', type: 'text', required: true },
    { id: 'department', label: 'Department', type: 'text' },
    { id: 'position', label: 'Position', type: 'text' },
    { id: 'hire_date', label: 'Hire Date', type: 'date' },
    { id: 'pay_period', label: 'Pay Period', type: 'text', required: true },
  ],
  earnings: [
    { id: 'basic_salary', label: 'Basic Salary', type: 'number', value: 0 },
    { id: 'housing_allowance', label: 'Housing Allowance', type: 'number', value: 0 },
    { id: 'transport_allowance', label: 'Transport Allowance', type: 'number', value: 0 },
    { id: 'meal_allowance', label: 'Meal Allowance', type: 'number', value: 0 },
    { id: 'overtime_hours', label: 'Overtime Hours', type: 'number', value: 0 },
    { id: 'overtime_rate', label: 'Overtime Rate', type: 'number', value: 0 },
    { id: 'overtime_pay', label: 'Overtime Pay', type: 'formula', formula: 'overtime_hours * overtime_rate', readonly: true },
    { id: 'bonus', label: 'Bonus', type: 'number', value: 0 },
  ],
  deductions: [
    { id: 'income_tax', label: 'Income Tax', type: 'formula', formula: 'gross_salary * 0.15', readonly: true },
    { id: 'social_security', label: 'Social Security', type: 'formula', formula: 'basic_salary * 0.07', readonly: true },
    { id: 'health_insurance', label: 'Health Insurance', type: 'number', value: 0 },
    { id: 'life_insurance', label: 'Life Insurance', type: 'number', value: 0 },
    { id: 'retirement_fund', label: 'Retirement Fund', type: 'formula', formula: 'basic_salary * 0.05', readonly: true },
    { id: 'loan_deduction', label: 'Loan Deduction', type: 'number', value: 0 },
  ],
  summary: [
    { id: 'gross_salary', label: 'Gross Salary', type: 'formula', formula: 'SUM(earnings)', readonly: true },
    { id: 'total_deductions', label: 'Total Deductions', type: 'formula', formula: 'SUM(deductions)', readonly: true },
    { id: 'net_salary', label: 'Net Salary', type: 'formula', formula: 'gross_salary - total_deductions', readonly: true },
  ]
};

// Default template structure
export const DEFAULT_TEMPLATE: PayslipTemplate = {
  id: 'default-template',
  name: 'Standard Payslip',
  version: '1.0',
  description: 'Standard payslip template with common sections',
  type: 'basic',
  header: {
    id: 'default-header',
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
  subHeaders: [
    {
      id: 'pay-period-info',
      sections: [
        { id: 'pay-date', label: 'Pay Date', value: '{current_date}', type: 'date', editable: true },
        { id: 'pay-period', label: 'Pay Period', value: '{pay_period}', type: 'text', editable: true },
        { id: 'pay-method', label: 'Payment Method', value: 'Direct Deposit', type: 'text', editable: true }
      ],
      styling: {
        backgroundColor: '#e3f2fd',
        textColor: '#1565c0',
        borderStyle: '1px solid #1565c0'
      }
    }
  ],
  sections: [
    {
      id: 'employee-info',
      title: 'Employee Information',
      type: 'static',
      fields: COMMON_FIELDS.employee,
      canAddFields: true,
      canRemove: false,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'earnings',
      title: 'Earnings',
      type: 'dynamic',
      fields: COMMON_FIELDS.earnings,
      canAddFields: true,
      canRemove: false,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'deductions',
      title: 'Deductions',
      type: 'dynamic',
      fields: COMMON_FIELDS.deductions,
      canAddFields: true,
      canRemove: false,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'summary',
      title: 'Summary',
      type: 'static',
      fields: COMMON_FIELDS.summary,
      canAddFields: false,
      canRemove: false,
      collapsible: false,
      collapsed: false,
    }
  ],
  tables: [
    {
      id: 'overtime-details',
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
      canRemoveRows: true,
    }
  ],
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

export type TemplateAction = 
  | { type: 'ADD_SECTION'; section: SectionDefinition }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<SectionDefinition> }
  | { type: 'ADD_FIELD'; sectionId: string; field: FieldDefinition }
  | { type: 'REMOVE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'UPDATE_FIELD'; sectionId: string; fieldId: string; updates: Partial<FieldDefinition> }
  | { type: 'ADD_TABLE'; table: DynamicTable }
  | { type: 'REMOVE_TABLE'; tableId: string }
  | { type: 'UPDATE_TABLE'; tableId: string; updates: Partial<DynamicTable> }
  | { type: 'ADD_TABLE_COLUMN'; tableId: string; column: TableColumn }
  | { type: 'REMOVE_TABLE_COLUMN'; tableId: string; columnId: string }
  | { type: 'ADD_TABLE_ROW'; tableId: string; row: { [columnId: string]: any } }
  | { type: 'REMOVE_TABLE_ROW'; tableId: string; rowIndex: number }
  | { type: 'UPDATE_TEMPLATE_SETTINGS'; updates: Partial<PayslipTemplate> };