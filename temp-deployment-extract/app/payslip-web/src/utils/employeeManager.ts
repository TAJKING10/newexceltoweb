import {
  EmployeeProfile,
  PayslipHistory,
  AuditLog,
  SearchFilters,
  EmployeeStats,
  EmployeeAlert,
  PayrollPeriod,
  EmployeeAction,
  DEFAULT_EMPLOYEE,
  EmployeeCreationData,
  EmployeeUpdateData
} from '../types/EmployeeTypes';

export class EmployeeManager {
  private employees: Map<string, EmployeeProfile> = new Map();
  private payslipHistory: Map<string, PayslipHistory[]> = new Map(); // employeeId -> PayslipHistory[]
  private auditLogs: AuditLog[] = [];
  private alerts: EmployeeAlert[] = [];
  private payrollPeriods: PayrollPeriod[] = [];
  private currentUser = 'admin@company.com'; // In a real app, this would come from auth

  constructor() {
    this.loadFromStorage();
    this.createSampleData();
  }

  // Employee Management
  createEmployee(employeeData: EmployeeCreationData): string {
    const id = `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const employee: EmployeeProfile = {
      id,
      personalInfo: {
        firstName: employeeData.personalInfo?.firstName || DEFAULT_EMPLOYEE.personalInfo.firstName,
        lastName: employeeData.personalInfo?.lastName || DEFAULT_EMPLOYEE.personalInfo.lastName,
        fullName: `${employeeData.personalInfo?.firstName || DEFAULT_EMPLOYEE.personalInfo.firstName} ${employeeData.personalInfo?.lastName || DEFAULT_EMPLOYEE.personalInfo.lastName}`.trim(),
        email: employeeData.personalInfo?.email || DEFAULT_EMPLOYEE.personalInfo.email,
        phone: employeeData.personalInfo?.phone || DEFAULT_EMPLOYEE.personalInfo.phone,
        address: {
          street: employeeData.personalInfo?.address?.street || DEFAULT_EMPLOYEE.personalInfo.address.street,
          city: employeeData.personalInfo?.address?.city || DEFAULT_EMPLOYEE.personalInfo.address.city,
          state: employeeData.personalInfo?.address?.state || DEFAULT_EMPLOYEE.personalInfo.address.state,
          zipCode: employeeData.personalInfo?.address?.zipCode || DEFAULT_EMPLOYEE.personalInfo.address.zipCode,
          country: employeeData.personalInfo?.address?.country || DEFAULT_EMPLOYEE.personalInfo.address.country
        },
        dateOfBirth: employeeData.personalInfo?.dateOfBirth || DEFAULT_EMPLOYEE.personalInfo.dateOfBirth,
        nationalId: employeeData.personalInfo?.nationalId || DEFAULT_EMPLOYEE.personalInfo.nationalId,
        emergencyContact: {
          name: employeeData.personalInfo?.emergencyContact?.name || DEFAULT_EMPLOYEE.personalInfo.emergencyContact.name,
          relationship: employeeData.personalInfo?.emergencyContact?.relationship || DEFAULT_EMPLOYEE.personalInfo.emergencyContact.relationship,
          phone: employeeData.personalInfo?.emergencyContact?.phone || DEFAULT_EMPLOYEE.personalInfo.emergencyContact.phone
        }
      },
      employment: {
        employeeId: employeeData.employment?.employeeId || `EMP${String(this.employees.size + 1).padStart(4, '0')}`,
        department: employeeData.employment?.department || DEFAULT_EMPLOYEE.employment.department,
        position: employeeData.employment?.position || DEFAULT_EMPLOYEE.employment.position,
        manager: employeeData.employment?.manager || DEFAULT_EMPLOYEE.employment.manager,
        hireDate: employeeData.employment?.hireDate || DEFAULT_EMPLOYEE.employment.hireDate,
        employmentType: employeeData.employment?.employmentType || DEFAULT_EMPLOYEE.employment.employmentType,
        status: employeeData.employment?.status || DEFAULT_EMPLOYEE.employment.status,
        workLocation: employeeData.employment?.workLocation || DEFAULT_EMPLOYEE.employment.workLocation,
        probationEndDate: employeeData.employment?.probationEndDate
      },
      compensation: {
        baseSalary: employeeData.compensation?.baseSalary || DEFAULT_EMPLOYEE.compensation.baseSalary,
        currency: employeeData.compensation?.currency || DEFAULT_EMPLOYEE.compensation.currency,
        payFrequency: employeeData.compensation?.payFrequency || DEFAULT_EMPLOYEE.compensation.payFrequency,
        salaryType: employeeData.compensation?.salaryType || DEFAULT_EMPLOYEE.compensation.salaryType,
        bankAccount: {
          accountNumber: employeeData.compensation?.bankAccount?.accountNumber || DEFAULT_EMPLOYEE.compensation.bankAccount.accountNumber,
          routingNumber: employeeData.compensation?.bankAccount?.routingNumber || DEFAULT_EMPLOYEE.compensation.bankAccount.routingNumber,
          bankName: employeeData.compensation?.bankAccount?.bankName || DEFAULT_EMPLOYEE.compensation.bankAccount.bankName
        },
        taxInfo: {
          taxId: employeeData.compensation?.taxInfo?.taxId || DEFAULT_EMPLOYEE.compensation.taxInfo.taxId,
          filingStatus: employeeData.compensation?.taxInfo?.filingStatus || DEFAULT_EMPLOYEE.compensation.taxInfo.filingStatus,
          allowances: employeeData.compensation?.taxInfo?.allowances || DEFAULT_EMPLOYEE.compensation.taxInfo.allowances
        }
      },
      benefits: {
        healthInsurance: employeeData.benefits?.healthInsurance ?? DEFAULT_EMPLOYEE.benefits.healthInsurance,
        dentalInsurance: employeeData.benefits?.dentalInsurance ?? DEFAULT_EMPLOYEE.benefits.dentalInsurance,
        visionInsurance: employeeData.benefits?.visionInsurance ?? DEFAULT_EMPLOYEE.benefits.visionInsurance,
        retirement401k: employeeData.benefits?.retirement401k ?? DEFAULT_EMPLOYEE.benefits.retirement401k,
        paidTimeOff: employeeData.benefits?.paidTimeOff || DEFAULT_EMPLOYEE.benefits.paidTimeOff
      },
      documents: employeeData.documents || DEFAULT_EMPLOYEE.documents,
      createdDate: new Date(),
      lastModified: new Date(),
      createdBy: this.currentUser,
      modifiedBy: this.currentUser
    };

    this.employees.set(id, employee);
    this.logAudit('employee', id, 'create', [], `Created new employee: ${employee.personalInfo.fullName}`);
    this.saveToStorage();
    
    return id;
  }

  updateEmployee(id: string, updates: EmployeeUpdateData): boolean {
    const employee = this.employees.get(id);
    if (!employee) return false;

    const changes = this.detectChanges(employee, updates);
    
    const updatedEmployee: EmployeeProfile = {
      ...employee,
      id, // Ensure ID doesn't change
      lastModified: new Date(),
      modifiedBy: this.currentUser,
      personalInfo: {
        firstName: updates.personalInfo?.firstName ?? employee.personalInfo.firstName,
        lastName: updates.personalInfo?.lastName ?? employee.personalInfo.lastName,
        fullName: updates.personalInfo?.firstName || updates.personalInfo?.lastName 
          ? `${updates.personalInfo?.firstName || employee.personalInfo.firstName} ${updates.personalInfo?.lastName || employee.personalInfo.lastName}`.trim()
          : employee.personalInfo.fullName,
        email: updates.personalInfo?.email ?? employee.personalInfo.email,
        phone: updates.personalInfo?.phone ?? employee.personalInfo.phone,
        address: {
          street: updates.personalInfo?.address?.street ?? employee.personalInfo.address.street,
          city: updates.personalInfo?.address?.city ?? employee.personalInfo.address.city,
          state: updates.personalInfo?.address?.state ?? employee.personalInfo.address.state,
          zipCode: updates.personalInfo?.address?.zipCode ?? employee.personalInfo.address.zipCode,
          country: updates.personalInfo?.address?.country ?? employee.personalInfo.address.country
        },
        dateOfBirth: updates.personalInfo?.dateOfBirth ?? employee.personalInfo.dateOfBirth,
        nationalId: updates.personalInfo?.nationalId ?? employee.personalInfo.nationalId,
        emergencyContact: {
          name: updates.personalInfo?.emergencyContact?.name ?? employee.personalInfo.emergencyContact.name,
          relationship: updates.personalInfo?.emergencyContact?.relationship ?? employee.personalInfo.emergencyContact.relationship,
          phone: updates.personalInfo?.emergencyContact?.phone ?? employee.personalInfo.emergencyContact.phone
        }
      },
      employment: {
        employeeId: employee.employment.employeeId, // Never update employee ID
        department: updates.employment?.department ?? employee.employment.department,
        position: updates.employment?.position ?? employee.employment.position,
        manager: updates.employment?.manager ?? employee.employment.manager,
        hireDate: updates.employment?.hireDate ?? employee.employment.hireDate,
        employmentType: updates.employment?.employmentType ?? employee.employment.employmentType,
        status: updates.employment?.status ?? employee.employment.status,
        workLocation: updates.employment?.workLocation ?? employee.employment.workLocation,
        probationEndDate: updates.employment?.probationEndDate ?? employee.employment.probationEndDate
      },
      compensation: {
        baseSalary: updates.compensation?.baseSalary ?? employee.compensation.baseSalary,
        currency: updates.compensation?.currency ?? employee.compensation.currency,
        payFrequency: updates.compensation?.payFrequency ?? employee.compensation.payFrequency,
        salaryType: updates.compensation?.salaryType ?? employee.compensation.salaryType,
        bankAccount: {
          accountNumber: updates.compensation?.bankAccount?.accountNumber ?? employee.compensation.bankAccount.accountNumber,
          routingNumber: updates.compensation?.bankAccount?.routingNumber ?? employee.compensation.bankAccount.routingNumber,
          bankName: updates.compensation?.bankAccount?.bankName ?? employee.compensation.bankAccount.bankName
        },
        taxInfo: {
          taxId: updates.compensation?.taxInfo?.taxId ?? employee.compensation.taxInfo.taxId,
          filingStatus: updates.compensation?.taxInfo?.filingStatus ?? employee.compensation.taxInfo.filingStatus,
          allowances: updates.compensation?.taxInfo?.allowances ?? employee.compensation.taxInfo.allowances
        }
      },
      benefits: {
        healthInsurance: updates.benefits?.healthInsurance ?? employee.benefits.healthInsurance,
        dentalInsurance: updates.benefits?.dentalInsurance ?? employee.benefits.dentalInsurance,
        visionInsurance: updates.benefits?.visionInsurance ?? employee.benefits.visionInsurance,
        retirement401k: updates.benefits?.retirement401k ?? employee.benefits.retirement401k,
        paidTimeOff: updates.benefits?.paidTimeOff ?? employee.benefits.paidTimeOff
      },
      documents: updates.documents ?? employee.documents
    };

    this.employees.set(id, updatedEmployee);
    this.logAudit('employee', id, 'update', changes, `Updated employee: ${updatedEmployee.personalInfo.fullName}`);
    this.saveToStorage();
    
    return true;
  }

  deleteEmployee(id: string): boolean {
    const employee = this.employees.get(id);
    if (!employee) return false;

    this.employees.delete(id);
    this.payslipHistory.delete(id);
    this.logAudit('employee', id, 'delete', [], `Deleted employee: ${employee.personalInfo.fullName}`);
    this.saveToStorage();
    
    return true;
  }

  getEmployee(id: string): EmployeeProfile | null {
    const employee = this.employees.get(id);
    if (employee) {
      this.logAudit('employee', id, 'read', [], `Viewed employee: ${employee.personalInfo.fullName}`, 'low');
    }
    return employee || null;
  }

  getAllEmployees(): EmployeeProfile[] {
    return Array.from(this.employees.values());
  }

  // Search and Filter
  searchEmployees(filters: SearchFilters): EmployeeProfile[] {
    let results = this.getAllEmployees();

    // Text search across name, email, employee ID
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(emp => 
        emp.personalInfo.fullName.toLowerCase().includes(term) ||
        emp.personalInfo.email.toLowerCase().includes(term) ||
        emp.employment.employeeId.toLowerCase().includes(term) ||
        emp.employment.department.toLowerCase().includes(term) ||
        emp.employment.position.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (filters.department) {
      results = results.filter(emp => emp.employment.department === filters.department);
    }

    // Position filter
    if (filters.position) {
      results = results.filter(emp => emp.employment.position === filters.position);
    }

    // Status filter
    if (filters.employmentStatus) {
      results = results.filter(emp => emp.employment.status === filters.employmentStatus);
    }

    // Employment type filter
    if (filters.employmentType) {
      results = results.filter(emp => emp.employment.employmentType === filters.employmentType);
    }

    // Manager filter
    if (filters.manager) {
      results = results.filter(emp => emp.employment.manager === filters.manager);
    }

    // Hire date range
    if (filters.hireDate) {
      results = results.filter(emp => {
        const hireDate = new Date(emp.employment.hireDate);
        return hireDate >= filters.hireDate!.from && hireDate <= filters.hireDate!.to;
      });
    }

    // Salary range
    if (filters.salary) {
      results = results.filter(emp => 
        emp.compensation.baseSalary >= filters.salary!.min && 
        emp.compensation.baseSalary <= filters.salary!.max
      );
    }

    // Work location
    if (filters.workLocation) {
      results = results.filter(emp => emp.employment.workLocation === filters.workLocation);
    }

    this.logAudit('system', 'search', 'read', [], 
      `Employee search performed with ${Object.keys(filters).length} filters, returned ${results.length} results`, 'low');

    return results;
  }

  // Payslip History
  addPayslipHistory(employeeId: string, payslip: Omit<PayslipHistory, 'id'>): string {
    const id = `payslip-history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const historyEntry: PayslipHistory = {
      ...payslip,
      id,
      createdBy: this.currentUser
    };

    if (!this.payslipHistory.has(employeeId)) {
      this.payslipHistory.set(employeeId, []);
    }
    
    this.payslipHistory.get(employeeId)!.push(historyEntry);
    this.logAudit('payslip', id, 'create', [], `Created payslip history for employee ${employeeId}`);
    this.saveToStorage();
    
    return id;
  }

  getEmployeePayslipHistory(employeeId: string): PayslipHistory[] {
    return this.payslipHistory.get(employeeId) || [];
  }

  getAllPayslipHistory(): PayslipHistory[] {
    const allHistory: PayslipHistory[] = [];
    Array.from(this.payslipHistory.values()).forEach(histories => {
      allHistory.push(...histories);
    });
    return allHistory.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());
  }

  // Statistics and Analytics
  getEmployeeStats(): EmployeeStats {
    const employees = this.getAllEmployees();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const activeEmployees = employees.filter(emp => emp.employment.status === 'active');
    const newHires = employees.filter(emp => 
      new Date(emp.employment.hireDate) >= thisMonth && new Date(emp.employment.hireDate) < nextMonth
    );
    const terminated = employees.filter(emp => 
      emp.employment.status === 'terminated' && new Date(emp.lastModified) >= thisMonth
    );

    const salaries = activeEmployees.map(emp => emp.compensation.baseSalary);
    const averageSalary = salaries.length > 0 ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length : 0;
    const totalPayrollCost = salaries.reduce((sum, sal) => sum + sal, 0);

    // Department breakdown
    const departmentMap = new Map<string, number>();
    employees.forEach(emp => {
      const dept = emp.employment.department || 'Unknown';
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
    });

    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: (count / employees.length) * 100
    }));

    // Position breakdown
    const positionMap = new Map<string, { count: number; totalSalary: number }>();
    employees.forEach(emp => {
      const pos = emp.employment.position || 'Unknown';
      const existing = positionMap.get(pos) || { count: 0, totalSalary: 0 };
      positionMap.set(pos, {
        count: existing.count + 1,
        totalSalary: existing.totalSalary + emp.compensation.baseSalary
      });
    });

    const positionBreakdown = Array.from(positionMap.entries()).map(([position, data]) => ({
      position,
      count: data.count,
      averageSalary: data.totalSalary / data.count
    }));

    // Salary ranges
    const ranges = [
      { min: 0, max: 30000, label: 'Under $30K' },
      { min: 30000, max: 50000, label: '$30K - $50K' },
      { min: 50000, max: 75000, label: '$50K - $75K' },
      { min: 75000, max: 100000, label: '$75K - $100K' },
      { min: 100000, max: 150000, label: '$100K - $150K' },
      { min: 150000, max: Infinity, label: 'Over $150K' }
    ];

    const salaryRanges = ranges.map(range => {
      const count = employees.filter(emp => 
        emp.compensation.baseSalary >= range.min && emp.compensation.baseSalary < range.max
      ).length;
      return {
        range: range.label,
        count,
        percentage: employees.length > 0 ? (count / employees.length) * 100 : 0
      };
    });

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      newHiresThisMonth: newHires.length,
      terminationsThisMonth: terminated.length,
      averageSalary,
      totalPayrollCost,
      departmentBreakdown,
      positionBreakdown,
      salaryRanges
    };
  }

  // Audit Logging
  private logAudit(
    entityType: AuditLog['entityType'], 
    entityId: string, 
    action: AuditLog['action'], 
    changes: AuditLog['changes'], 
    details: string, 
    severity: AuditLog['severity'] = 'medium'
  ): void {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      action,
      changes,
      timestamp: new Date(),
      userId: this.currentUser,
      userEmail: this.currentUser,
      details,
      severity,
      ipAddress: 'localhost', // In a real app, get from request
      userAgent: navigator.userAgent
    };

    this.auditLogs.push(auditLog);
    
    // Keep only last 1000 audit logs to prevent memory issues
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
    
    this.saveToStorage();
  }

  getAuditLogs(limit: number = 100, entityType?: AuditLog['entityType']): AuditLog[] {
    let logs = [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }
    
    return logs.slice(0, limit);
  }

  // Alerts and Notifications
  generateAlerts(): void {
    this.alerts = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    this.getAllEmployees().forEach(employee => {
      // Probation ending alerts
      if (employee.employment.probationEndDate) {
        const probationEnd = new Date(employee.employment.probationEndDate);
        if (probationEnd <= thirtyDaysFromNow && probationEnd > now) {
          this.alerts.push({
            id: `alert-probation-${employee.id}`,
            employeeId: employee.id,
            type: 'probation-ending',
            priority: 'high',
            title: 'Probation Period Ending',
            description: `${employee.personalInfo.fullName}'s probation period ends on ${probationEnd.toLocaleDateString()}`,
            dueDate: probationEnd,
            acknowledged: false,
            createdDate: now
          });
        }
      }

      // Birthday alerts
      const birthday = new Date(employee.personalInfo.dateOfBirth);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      const daysDiff = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff <= 7) {
        this.alerts.push({
          id: `alert-birthday-${employee.id}`,
          employeeId: employee.id,
          type: 'birthday',
          priority: 'low',
          title: 'Upcoming Birthday',
          description: `${employee.personalInfo.fullName}'s birthday is on ${thisYearBirthday.toLocaleDateString()}`,
          dueDate: thisYearBirthday,
          acknowledged: false,
          createdDate: now
        });
      }

      // Work anniversary alerts
      const hireDate = new Date(employee.employment.hireDate);
      const thisYearAnniversary = new Date(now.getFullYear(), hireDate.getMonth(), hireDate.getDate());
      const anniversaryDays = Math.ceil((thisYearAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (anniversaryDays >= 0 && anniversaryDays <= 7) {
        const yearsOfService = now.getFullYear() - hireDate.getFullYear();
        this.alerts.push({
          id: `alert-anniversary-${employee.id}`,
          employeeId: employee.id,
          type: 'anniversary',
          priority: 'medium',
          title: 'Work Anniversary',
          description: `${employee.personalInfo.fullName} celebrates ${yearsOfService} years with the company on ${thisYearAnniversary.toLocaleDateString()}`,
          dueDate: thisYearAnniversary,
          acknowledged: false,
          createdDate: now
        });
      }

      // Missing documents alert
      if (employee.documents.length === 0) {
        this.alerts.push({
          id: `alert-documents-${employee.id}`,
          employeeId: employee.id,
          type: 'document-missing',
          priority: 'medium',
          title: 'Missing Documents',
          description: `${employee.personalInfo.fullName} has no documents on file`,
          dueDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)),
          acknowledged: false,
          createdDate: now
        });
      }
    });

    this.saveToStorage();
  }

  getAlerts(): EmployeeAlert[] {
    return this.alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Utility methods
  private detectChanges(original: any, updates: any): AuditLog['changes'] {
    const changes: AuditLog['changes'] = [];
    
    const compareObjects = (obj1: any, obj2: any, prefix = '') => {
      Object.keys(obj2).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj2[key] !== undefined && obj1[key] !== obj2[key]) {
          if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
            compareObjects(obj1[key] || {}, obj2[key], fullKey);
          } else {
            changes.push({
              field: fullKey,
              oldValue: obj1[key],
              newValue: obj2[key]
            });
          }
        }
      });
    };
    
    compareObjects(original, updates);
    return changes;
  }

  // Sample Data Creation
  private createSampleData(): void {
    // Sample data creation temporarily disabled for demo
    // In production, this would create default employees
    this.generateAlerts();
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem('employee-data', JSON.stringify({
        employees: Array.from(this.employees.entries()),
        payslipHistory: Array.from(this.payslipHistory.entries()),
        auditLogs: this.auditLogs.slice(-500), // Keep last 500 logs
        alerts: this.alerts,
        payrollPeriods: this.payrollPeriods
      }));
    } catch (error) {
      console.error('Error saving employee data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('employee-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.employees = new Map(parsed.employees || []);
        this.payslipHistory = new Map(parsed.payslipHistory || []);
        this.auditLogs = parsed.auditLogs || [];
        this.alerts = parsed.alerts || [];
        this.payrollPeriods = parsed.payrollPeriods || [];
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  }

  // Export functionality
  exportEmployeeData(format: 'json' | 'csv' = 'json'): string {
    const employees = this.getAllEmployees();
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Email', 'Employee ID', 'Department', 'Position', 
        'Status', 'Hire Date', 'Salary', 'Manager'
      ];
      
      const rows = employees.map(emp => [
        emp.id,
        emp.personalInfo.fullName,
        emp.personalInfo.email,
        emp.employment.employeeId,
        emp.employment.department,
        emp.employment.position,
        emp.employment.status,
        new Date(emp.employment.hireDate).toLocaleDateString(),
        emp.compensation.baseSalary,
        emp.employment.manager
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify({
      employees,
      exportDate: new Date().toISOString(),
      totalCount: employees.length
    }, null, 2);
  }

  // Backup and restore
  createBackup(): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      employees: Array.from(this.employees.entries()),
      payslipHistory: Array.from(this.payslipHistory.entries()),
      auditLogs: this.auditLogs,
      alerts: this.alerts,
      payrollPeriods: this.payrollPeriods
    };
    
    return JSON.stringify(backup, null, 2);
  }

  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      this.employees = new Map(backup.employees);
      this.payslipHistory = new Map(backup.payslipHistory);
      this.auditLogs = backup.auditLogs;
      this.alerts = backup.alerts;
      this.payrollPeriods = backup.payrollPeriods;
      
      this.saveToStorage();
      this.logAudit('system', 'backup', 'create', [], 'System restored from backup', 'high');
      
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}

// Singleton instance
export const employeeManager = new EmployeeManager();