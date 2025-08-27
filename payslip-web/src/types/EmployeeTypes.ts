// Employee Management and History Types

// Utility type for employee creation with partial nested objects
export type EmployeeCreationData = {
  personalInfo?: Partial<EmployeeProfile['personalInfo']>;
  employment?: Partial<EmployeeProfile['employment']>;
  compensation?: Partial<EmployeeProfile['compensation']>;
  benefits?: Partial<EmployeeProfile['benefits']>;
  documents?: EmployeeProfile['documents'];
};

// Utility type for employee updates
export type EmployeeUpdateData = {
  personalInfo?: Partial<EmployeeProfile['personalInfo']>;
  employment?: Partial<EmployeeProfile['employment']>;
  compensation?: Partial<EmployeeProfile['compensation']>;
  benefits?: Partial<EmployeeProfile['benefits']>;
  documents?: EmployeeProfile['documents'];
};

export interface EmployeeProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    dateOfBirth: Date;
    nationalId: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  employment: {
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    hireDate: Date;
    employmentType: 'full-time' | 'part-time' | 'contractor' | 'intern';
    status: 'active' | 'inactive' | 'terminated' | 'on-leave';
    workLocation: 'office' | 'remote' | 'hybrid';
    probationEndDate?: Date;
  };
  compensation: {
    baseSalary: number;
    currency: string;
    payFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
    salaryType: 'hourly' | 'salary' | 'commission';
    bankAccount: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
    taxInfo: {
      taxId: string;
      filingStatus: string;
      allowances: number;
    };
  };
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirement401k: boolean;
    paidTimeOff: number; // days per year
  };
  documents: Array<{
    id: string;
    name: string;
    type: 'contract' | 'tax-form' | 'id-document' | 'certification' | 'other';
    uploadDate: Date;
    url?: string;
  }>;
  createdDate: Date;
  lastModified: Date;
  createdBy: string;
  modifiedBy: string;
}

export interface PayslipHistory {
  id: string;
  employeeId: string;
  payslipId: string;
  version: number;
  payPeriod: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  status: 'draft' | 'processed' | 'paid' | 'cancelled' | 'void';
  generatedDate: Date;
  processedDate?: Date;
  paidDate?: Date;
  paymentMethod: 'direct-deposit' | 'check' | 'cash' | 'wire-transfer';
  templateUsed: string;
  changes: PayslipChange[];
  notes: string;
  createdBy: string;
}

export interface PayslipChange {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  changeDate: Date;
  changedBy: string;
  reason: string;
}

export interface AuditLog {
  id: string;
  entityType: 'employee' | 'payslip' | 'template' | 'system';
  entityId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'archive' | 'restore';
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  timestamp: Date;
  userId: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SearchFilters {
  searchTerm?: string;
  department?: string;
  position?: string;
  employmentStatus?: string;
  employmentType?: string;
  manager?: string;
  hireDate?: {
    from: Date;
    to: Date;
  };
  salary?: {
    min: number;
    max: number;
  };
  payPeriod?: string;
  workLocation?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  averageSalary: number;
  totalPayrollCost: number;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  positionBreakdown: Array<{
    position: string;
    count: number;
    averageSalary: number;
  }>;
  salaryRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface EmployeeAlert {
  id: string;
  employeeId: string;
  type: 'contract-expiring' | 'probation-ending' | 'birthday' | 'anniversary' | 'document-missing' | 'salary-review';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  dueDate: Date;
  acknowledged: boolean;
  createdDate: Date;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: 'open' | 'processing' | 'closed' | 'paid';
  employeeCount: number;
  totalGross: number;
  totalNet: number;
  totalTaxes: number;
  createdBy: string;
  createdDate: Date;
  processedDate?: Date;
}

export interface EmployeeReport {
  id: string;
  name: string;
  type: 'payroll-summary' | 'tax-report' | 'employee-list' | 'audit-report' | 'compliance-report';
  filters: SearchFilters;
  generatedDate: Date;
  generatedBy: string;
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

// Default employee profile template
export const DEFAULT_EMPLOYEE: Omit<EmployeeProfile, 'id' | 'createdDate' | 'lastModified' | 'createdBy' | 'modifiedBy'> = {
  personalInfo: {
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    dateOfBirth: new Date(),
    nationalId: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  employment: {
    employeeId: '',
    department: '',
    position: '',
    manager: '',
    hireDate: new Date(),
    employmentType: 'full-time',
    status: 'active',
    workLocation: 'office'
  },
  compensation: {
    baseSalary: 0,
    currency: 'USD',
    payFrequency: 'bi-weekly',
    salaryType: 'salary',
    bankAccount: {
      accountNumber: '',
      routingNumber: '',
      bankName: ''
    },
    taxInfo: {
      taxId: '',
      filingStatus: 'single',
      allowances: 0
    }
  },
  benefits: {
    healthInsurance: false,
    dentalInsurance: false,
    visionInsurance: false,
    retirement401k: false,
    paidTimeOff: 15
  },
  documents: []
};

export type EmployeeAction = 
  | { type: 'CREATE_EMPLOYEE'; employee: EmployeeProfile }
  | { type: 'UPDATE_EMPLOYEE'; id: string; updates: Partial<EmployeeProfile> }
  | { type: 'DELETE_EMPLOYEE'; id: string }
  | { type: 'ARCHIVE_EMPLOYEE'; id: string }
  | { type: 'RESTORE_EMPLOYEE'; id: string }
  | { type: 'CHANGE_STATUS'; id: string; status: EmployeeProfile['employment']['status'] };