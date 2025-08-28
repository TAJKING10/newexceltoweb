// Universal Person Management System for Employees, Customers, Contractors, etc.

export type PersonType = 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other';

export interface PersonProfile {
  id: string;
  type: PersonType;
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
    dateOfBirth?: Date;
    nationalId?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  workInfo: {
    // Universal ID (employee ID, customer ID, contractor ID, etc.)
    personId: string;
    department?: string;
    position?: string;
    title?: string;
    manager?: string;
    startDate?: Date;
    workType: 'full-time' | 'part-time' | 'contractor' | 'freelance' | 'consultant' | 'customer' | 'vendor';
    status: 'active' | 'inactive' | 'terminated' | 'suspended' | 'completed';
    workLocation?: 'office' | 'remote' | 'hybrid' | 'client-site' | 'various';
    contractEndDate?: Date;
    // For customers
    customerSince?: Date;
    customerTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    // For contractors/freelancers
    hourlyRate?: number;
    projectRate?: number;
    skillSet?: string[];
  };
  compensation: {
    baseSalary?: number;
    hourlyRate?: number;
    projectRate?: number;
    currency: string;
    payFrequency: 'hourly' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | 'per-project';
    salaryType: 'hourly' | 'salary' | 'commission' | 'project-based' | 'retainer';
    bankAccount?: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
    taxInfo?: {
      taxId: string;
      filingStatus: string;
      allowances: number;
      taxExempt?: boolean;
    };
    // Payment preferences
    paymentMethod: 'direct-deposit' | 'check' | 'paypal' | 'wire-transfer' | 'cash' | 'crypto';
    paymentTerms?: string; // e.g., "Net 30", "Upon completion", etc.
  };
  benefits?: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    retirement401k?: boolean;
    paidTimeOff?: number; // days per year
    // For contractors/customers
    discounts?: number; // percentage discount
    loyaltyPoints?: number;
    specialRates?: boolean;
  };
  documents: Array<{
    id: string;
    name: string;
    type: 'contract' | 'tax-form' | 'id-document' | 'certification' | 'invoice' | 'receipt' | 'other';
    uploadDate: Date;
    url?: string;
  }>;
  // Custom fields for different person types
  customFields?: { [key: string]: any };
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  createdBy: string;
  modifiedBy: string;
  tags?: string[];
  notes?: string;
}

// Creation and update types
export type PersonCreationData = {
  type: PersonType;
  personalInfo?: Partial<PersonProfile['personalInfo']>;
  workInfo?: Partial<PersonProfile['workInfo']>;
  compensation?: Partial<PersonProfile['compensation']>;
  benefits?: Partial<PersonProfile['benefits']>;
  documents?: PersonProfile['documents'];
  customFields?: PersonProfile['customFields'];
  tags?: string[];
  notes?: string;
};

export type PersonUpdateData = {
  type?: PersonType;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    dateOfBirth?: Date;
    nationalId?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  workInfo?: Partial<PersonProfile['workInfo']>;
  compensation?: Partial<PersonProfile['compensation']>;
  benefits?: Partial<PersonProfile['benefits']>;
  documents?: PersonProfile['documents'];
  customFields?: PersonProfile['customFields'];
  tags?: string[];
  notes?: string;
};

// Search and filter interfaces
export interface PersonFilters {
  searchTerm?: string;
  personType?: PersonType;
  department?: string;
  position?: string;
  status?: string;
  workType?: string;
  manager?: string;
  startDate?: {
    from: Date;
    to: Date;
  };
  compensation?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

// Statistics and analytics
export interface PersonStats {
  totalPersons: number;
  byType: Array<{
    type: PersonType;
    count: number;
    percentage: number;
  }>;
  activePersons: number;
  newThisMonth: number;
  terminationsThisMonth: number;
  averageCompensation: number;
  totalCompensationCost: number;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

// Default person profile template
export const DEFAULT_PERSON: Omit<PersonProfile, 'id' | 'createdDate' | 'lastModified' | 'createdBy' | 'modifiedBy'> = {
  type: 'employee',
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
    }
  },
  workInfo: {
    personId: '',
    workType: 'full-time',
    status: 'active'
  },
  compensation: {
    currency: 'USD',
    payFrequency: 'bi-weekly',
    salaryType: 'salary',
    paymentMethod: 'direct-deposit'
  },
  documents: []
};

// Person type configurations
export const PERSON_TYPE_CONFIG = {
  employee: {
    label: 'Employee',
    icon: '👨‍💼',
    color: '#1565c0',
    defaultFields: ['personalInfo', 'workInfo', 'compensation', 'benefits'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId', 'workInfo.department', 'workInfo.position']
  },
  customer: {
    label: 'Customer',
    icon: '🤝',
    color: '#4caf50',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId']
  },
  contractor: {
    label: 'Contractor',
    icon: '🔧',
    color: '#ff9800',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId', 'compensation.hourlyRate']
  },
  freelancer: {
    label: 'Freelancer',
    icon: '💼',
    color: '#9c27b0',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId']
  },
  vendor: {
    label: 'Vendor',
    icon: '🏪',
    color: '#607d8b',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId']
  },
  consultant: {
    label: 'Consultant',
    icon: '🎓',
    color: '#3f51b5',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId']
  },
  other: {
    label: 'Other',
    icon: '👤',
    color: '#795548',
    defaultFields: ['personalInfo', 'workInfo', 'compensation'],
    requiredFields: ['personalInfo.fullName', 'workInfo.personId']
  }
};

export type PersonAction = 
  | { type: 'CREATE_PERSON'; person: PersonProfile }
  | { type: 'UPDATE_PERSON'; id: string; updates: Partial<PersonProfile> }
  | { type: 'DELETE_PERSON'; id: string }
  | { type: 'ARCHIVE_PERSON'; id: string }
  | { type: 'RESTORE_PERSON'; id: string }
  | { type: 'CHANGE_STATUS'; id: string; status: PersonProfile['workInfo']['status'] }
  | { type: 'CHANGE_TYPE'; id: string; personType: PersonType };