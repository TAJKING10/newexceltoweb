// Universal Person Management System

import { PersonProfile, PersonCreationData, PersonUpdateData, PersonFilters, PersonStats, PersonType, DEFAULT_PERSON, PERSON_TYPE_CONFIG } from '../types/PersonTypes';
import { AuditLog } from '../types/EmployeeTypes';

export class PersonManager {
  private persons: Map<string, PersonProfile> = new Map();
  private auditLogs: AuditLog[] = [];
  private currentUser = 'admin@company.com';

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  // Person CRUD Operations
  createPerson(personData: PersonCreationData): string {
    const id = `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const person: PersonProfile = {
      id,
      type: personData.type || 'other',
      personalInfo: {
        ...DEFAULT_PERSON.personalInfo,
        ...personData.personalInfo,
        fullName: personData.personalInfo?.fullName || 
                 `${personData.personalInfo?.firstName || ''} ${personData.personalInfo?.lastName || ''}`.trim()
      },
      workInfo: {
        ...DEFAULT_PERSON.workInfo,
        ...personData.workInfo,
        personId: personData.workInfo?.personId || this.generatePersonId(personData.type || 'other')
      },
      compensation: {
        ...DEFAULT_PERSON.compensation,
        ...personData.compensation
      },
      benefits: personData.benefits,
      documents: personData.documents || [],
      customFields: personData.customFields || {},
      createdDate: new Date(),
      lastModified: new Date(),
      createdBy: this.currentUser,
      modifiedBy: this.currentUser,
      tags: personData.tags || [],
      notes: personData.notes || ''
    };

    this.persons.set(id, person);
    this.saveToStorage();
    this.logActivity('create', id, person);
    
    return id;
  }

  updatePerson(personId: string, updates: PersonUpdateData): boolean {
    const person = this.persons.get(personId);
    if (!person) return false;

    const oldPerson = { ...person };
    
    const updatedPerson: PersonProfile = {
      ...person,
      type: updates.type || person.type,
      personalInfo: {
        ...person.personalInfo,
        ...updates.personalInfo,
        address: updates.personalInfo?.address 
          ? { ...person.personalInfo.address, ...updates.personalInfo.address }
          : person.personalInfo.address,
        emergencyContact: updates.personalInfo?.emergencyContact
          ? { 
              name: updates.personalInfo.emergencyContact.name || person.personalInfo.emergencyContact?.name || '',
              relationship: updates.personalInfo.emergencyContact.relationship || person.personalInfo.emergencyContact?.relationship || '',
              phone: updates.personalInfo.emergencyContact.phone || person.personalInfo.emergencyContact?.phone || ''
            } as { name: string; relationship: string; phone: string }
          : person.personalInfo.emergencyContact
      },
      workInfo: {
        ...person.workInfo,
        ...updates.workInfo
      },
      compensation: {
        ...person.compensation,
        ...updates.compensation,
        bankAccount: updates.compensation?.bankAccount
          ? { ...person.compensation.bankAccount, ...updates.compensation.bankAccount }
          : person.compensation.bankAccount,
        taxInfo: updates.compensation?.taxInfo
          ? { ...person.compensation.taxInfo, ...updates.compensation.taxInfo }
          : person.compensation.taxInfo
      },
      benefits: updates.benefits ? { ...person.benefits, ...updates.benefits } : person.benefits,
      documents: updates.documents || person.documents,
      customFields: updates.customFields ? { ...person.customFields, ...updates.customFields } : person.customFields,
      tags: updates.tags || person.tags,
      notes: updates.notes !== undefined ? updates.notes : person.notes,
      lastModified: new Date(),
      modifiedBy: this.currentUser
    };

    // Update full name if first/last name changed
    if (updates.personalInfo?.firstName || updates.personalInfo?.lastName) {
      updatedPerson.personalInfo.fullName = 
        `${updatedPerson.personalInfo.firstName} ${updatedPerson.personalInfo.lastName}`.trim();
    }

    this.persons.set(personId, updatedPerson);
    this.saveToStorage();
    this.logActivity('update', personId, oldPerson, updatedPerson);
    
    return true;
  }

  deletePerson(personId: string): boolean {
    const person = this.persons.get(personId);
    if (!person) return false;

    this.persons.delete(personId);
    this.saveToStorage();
    this.logActivity('delete', personId, person, null);
    
    return true;
  }

  getPerson(personId: string): PersonProfile | null {
    return this.persons.get(personId) || null;
  }

  getAllPersons(): PersonProfile[] {
    return Array.from(this.persons.values()).sort((a, b) => 
      a.personalInfo.fullName.localeCompare(b.personalInfo.fullName)
    );
  }

  getPersonsByType(type: PersonType): PersonProfile[] {
    return this.getAllPersons().filter(person => person.type === type);
  }

  // Search and filter
  searchPersons(filters: PersonFilters): PersonProfile[] {
    let results = this.getAllPersons();

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      results = results.filter(person =>
        person.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
        person.personalInfo.email.toLowerCase().includes(searchTerm) ||
        person.workInfo.personId.toLowerCase().includes(searchTerm) ||
        person.workInfo.department?.toLowerCase().includes(searchTerm) ||
        person.workInfo.position?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.personType) {
      results = results.filter(person => person.type === filters.personType);
    }

    if (filters.status) {
      results = results.filter(person => person.workInfo.status === filters.status);
    }

    if (filters.workType) {
      results = results.filter(person => person.workInfo.workType === filters.workType);
    }

    if (filters.department) {
      results = results.filter(person => person.workInfo.department === filters.department);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(person => 
        filters.tags!.some(tag => person.tags?.includes(tag))
      );
    }

    return results;
  }

  // Statistics
  getPersonStats(): PersonStats {
    const allPersons = this.getAllPersons();
    const activePersons = allPersons.filter(p => p.workInfo.status === 'active');
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    const newThisMonth = allPersons.filter(p => 
      p.createdDate >= currentMonth && p.createdDate < currentDate
    ).length;

    const terminationsThisMonth = allPersons.filter(p => 
      p.workInfo.status === 'terminated' && p.lastModified >= currentMonth
    ).length;

    // Type breakdown
    const typeStats = new Map<PersonType, number>();
    allPersons.forEach(person => {
      typeStats.set(person.type, (typeStats.get(person.type) || 0) + 1);
    });

    const byType = Array.from(typeStats.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / allPersons.length) * 100
    }));

    // Department breakdown
    const deptStats = new Map<string, number>();
    allPersons.forEach(person => {
      const dept = person.workInfo.department || 'Unassigned';
      deptStats.set(dept, (deptStats.get(dept) || 0) + 1);
    });

    const departmentBreakdown = Array.from(deptStats.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: (count / allPersons.length) * 100
    }));

    // Status breakdown
    const statusStats = new Map<string, number>();
    allPersons.forEach(person => {
      statusStats.set(person.workInfo.status, (statusStats.get(person.workInfo.status) || 0) + 1);
    });

    const statusBreakdown = Array.from(statusStats.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: (count / allPersons.length) * 100
    }));

    // Average compensation
    const compensationValues = allPersons
      .map(p => p.compensation.baseSalary || p.compensation.hourlyRate || p.compensation.projectRate || 0)
      .filter(val => val > 0);
    
    const averageCompensation = compensationValues.length > 0 
      ? compensationValues.reduce((sum, val) => sum + val, 0) / compensationValues.length 
      : 0;

    return {
      totalPersons: allPersons.length,
      byType,
      activePersons: activePersons.length,
      newThisMonth,
      terminationsThisMonth,
      averageCompensation,
      totalCompensationCost: compensationValues.reduce((sum, val) => sum + val, 0),
      departmentBreakdown,
      statusBreakdown
    };
  }

  // Utility methods
  private generatePersonId(type: PersonType): string {
    const prefix = {
      employee: 'EMP',
      customer: 'CUS',
      contractor: 'CON',
      freelancer: 'FRE',
      vendor: 'VEN',
      consultant: 'CSL',
      other: 'OTH'
    }[type];

    const existingIds = this.getAllPersons()
      .filter(p => p.type === type)
      .map(p => p.workInfo.personId)
      .filter(id => id.startsWith(prefix));

    const maxNumber = existingIds
      .map(id => parseInt(id.replace(prefix, '')))
      .filter(num => !isNaN(num))
      .reduce((max, num) => Math.max(max, num), 0);

    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  }

  // Bulk operations
  bulkUpdatePersons(personIds: string[], updates: PersonUpdateData): boolean {
    let success = true;
    personIds.forEach(id => {
      if (!this.updatePerson(id, updates)) {
        success = false;
      }
    });
    return success;
  }

  bulkDeletePersons(personIds: string[]): boolean {
    let success = true;
    personIds.forEach(id => {
      if (!this.deletePerson(id)) {
        success = false;
      }
    });
    return success;
  }

  // Import/Export
  exportPersonsData(): string {
    return JSON.stringify({
      persons: Array.from(this.persons.entries()),
      auditLogs: this.auditLogs,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  importPersonsData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.persons && Array.isArray(parsed.persons)) {
        this.persons = new Map(parsed.persons);
        if (parsed.auditLogs) {
          this.auditLogs = parsed.auditLogs;
        }
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing persons data:', error);
      return false;
    }
  }

  // Audit logging
  private logActivity(action: string, personId: string, oldData: PersonProfile | null, newData: PersonProfile | null = null) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'employee', // Keep for compatibility
      entityId: personId,
      action: action as any,
      changes: [],
      timestamp: new Date(),
      userId: this.currentUser,
      userEmail: this.currentUser,
      details: `Person ${action}: ${oldData?.personalInfo.fullName || newData?.personalInfo.fullName || personId}`,
      severity: 'medium'
    };

    this.auditLogs.push(log);
    this.saveToStorage();
  }

  getAuditLogs(personId?: string): AuditLog[] {
    return personId 
      ? this.auditLogs.filter(log => log.entityId === personId)
      : this.auditLogs;
  }

  // Storage management
  private saveToStorage(): void {
    try {
      localStorage.setItem('persons-data', JSON.stringify({
        persons: Array.from(this.persons.entries()),
        auditLogs: this.auditLogs
      }));
    } catch (error) {
      console.error('Error saving persons data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('persons-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.persons = new Map(parsed.persons || []);
        this.auditLogs = parsed.auditLogs || [];
      }
    } catch (error) {
      console.error('Error loading persons data:', error);
    }
  }

  // Initialize sample data for demonstration
  private initializeSampleData(): void {
    if (this.persons.size === 0) {
      // Sample employee
      this.createPerson({
        type: 'employee',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          fullName: 'John Smith',
          email: 'john.smith@company.com',
          phone: '+1-555-0123',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        workInfo: {
          personId: 'EMP001',
          department: 'Engineering',
          position: 'Software Engineer',
          workType: 'full-time',
          status: 'active'
        },
        compensation: {
          baseSalary: 75000,
          currency: 'USD',
          payFrequency: 'bi-weekly',
          salaryType: 'salary',
          paymentMethod: 'direct-deposit'
        }
      });

      // Sample customer
      this.createPerson({
        type: 'customer',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1-555-0456'
        },
        workInfo: {
          personId: 'CUS001',
          workType: 'customer',
          status: 'active',
          customerSince: new Date('2023-01-15'),
          customerTier: 'gold'
        },
        compensation: {
          currency: 'USD',
          payFrequency: 'monthly',
          salaryType: 'commission',
          paymentMethod: 'check'
        }
      });

      // Sample contractor
      this.createPerson({
        type: 'contractor',
        personalInfo: {
          firstName: 'Mike',
          lastName: 'Wilson',
          fullName: 'Mike Wilson',
          email: 'mike.wilson@contractor.com',
          phone: '+1-555-0789'
        },
        workInfo: {
          personId: 'CON001',
          position: 'Web Designer',
          workType: 'contractor',
          status: 'active',
          skillSet: ['UI/UX', 'Photoshop', 'HTML/CSS']
        },
        compensation: {
          hourlyRate: 65,
          currency: 'USD',
          payFrequency: 'weekly',
          salaryType: 'hourly',
          paymentMethod: 'paypal'
        }
      });
    }
  }
}

// Singleton instance
export const personManager = new PersonManager();