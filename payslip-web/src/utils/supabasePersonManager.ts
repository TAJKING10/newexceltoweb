// Supabase-based Person Management System
import { PersonProfile, PersonCreationData, PersonUpdateData, PersonFilters, PersonStats, PersonType, DEFAULT_PERSON } from '../types/PersonTypes';
import { supabase } from '../supabaseClient';

export class SupabasePersonManager {
  private currentUser = 'system'; // Default user

  constructor() {
    // Initialize current user from auth if available
    this.initializeCurrentUser();
  }

  private async initializeCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = user.id;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  // Convert Supabase employee record to PersonProfile
  private mapEmployeeToPersonProfile(employee: any): PersonProfile {
    return {
      id: employee.id,
      type: 'employee', // Default to employee since this comes from employees table
      personalInfo: {
        firstName: employee.user_id ? '' : '', // Would need to join with profiles table
        lastName: '',
        fullName: employee.user_id ? '' : '', // Would need to join with profiles table
        email: employee.user_id ? '' : '', // Would need to join with profiles table
        phone: employee.phone || '',
        address: employee.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        emergencyContact: employee.emergency_contact || undefined
      },
      workInfo: {
        personId: employee.employee_id,
        department: employee.department || '',
        position: employee.position || '',
        workType: 'full-time',
        status: 'active',
        startDate: employee.hire_date ? new Date(employee.hire_date) : undefined
      },
      compensation: {
        baseSalary: employee.salary ? parseFloat(employee.salary) : undefined,
        currency: employee.currency || 'EUR',
        payFrequency: 'monthly',
        salaryType: 'salary',
        paymentMethod: 'direct-deposit',
        bankAccount: employee.bank_details || undefined,
        taxInfo: employee.tax_info || undefined
      },
      documents: [],
      createdDate: new Date(employee.created_at),
      lastModified: new Date(employee.updated_at),
      createdBy: this.currentUser,
      modifiedBy: this.currentUser,
      tags: [],
      notes: employee.notes || ''
    };
  }

  // Convert PersonProfile to Supabase employee record
  private mapPersonProfileToEmployee(person: PersonProfile, isUpdate = false): any {
    const baseData: any = {
      employee_id: person.workInfo.personId,
      department: person.workInfo.department,
      position: person.workInfo.position,
      hire_date: person.workInfo.startDate ? person.workInfo.startDate.toISOString().split('T')[0] : null,
      salary: person.compensation.baseSalary,
      currency: person.compensation.currency || 'EUR',
      phone: person.personalInfo.phone,
      address: person.personalInfo.address,
      emergency_contact: person.personalInfo.emergencyContact,
      bank_details: person.compensation.bankAccount,
      tax_info: person.compensation.taxInfo,
      notes: person.notes,
      updated_at: new Date().toISOString()
    };

    if (!isUpdate) {
      baseData.owner_id = this.currentUser;
      baseData.created_at = new Date().toISOString();
    }

    return baseData;
  }

  // Person CRUD Operations
  async createPerson(personData: PersonCreationData): Promise<string | null> {
    try {
      // For now, we'll create a basic employee record
      // In a full implementation, you might also create a profile record
      const employeeData = {
        employee_id: personData.workInfo?.personId || this.generatePersonId(personData.type || 'employee'),
        department: personData.workInfo?.department,
        position: personData.workInfo?.position,
        hire_date: personData.workInfo?.startDate ? personData.workInfo.startDate.toISOString().split('T')[0] : null,
        salary: personData.compensation?.baseSalary,
        currency: personData.compensation?.currency || 'EUR',
        phone: personData.personalInfo?.phone,
        address: personData.personalInfo?.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        emergency_contact: personData.personalInfo?.emergencyContact,
        bank_details: personData.compensation?.bankAccount,
        tax_info: personData.compensation?.taxInfo,
        notes: personData.notes,
        owner_id: await this.getCurrentUserId()
      };

      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        return null;
      }

      console.log('✅ Created employee in Supabase:', data.employee_id);
      return data.id;
    } catch (error) {
      console.error('Error in createPerson:', error);
      return null;
    }
  }

  async updatePerson(personId: string, updates: PersonUpdateData): Promise<boolean> {
    try {
      const updateData: any = {};

      if (updates.workInfo) {
        if (updates.workInfo.personId) updateData.employee_id = updates.workInfo.personId;
        if (updates.workInfo.department) updateData.department = updates.workInfo.department;
        if (updates.workInfo.position) updateData.position = updates.workInfo.position;
        if (updates.workInfo.startDate) updateData.hire_date = updates.workInfo.startDate.toISOString().split('T')[0];
      }

      if (updates.compensation) {
        if (updates.compensation.baseSalary) updateData.salary = updates.compensation.baseSalary;
        if (updates.compensation.currency) updateData.currency = updates.compensation.currency;
        if (updates.compensation.bankAccount) updateData.bank_details = updates.compensation.bankAccount;
        if (updates.compensation.taxInfo) updateData.tax_info = updates.compensation.taxInfo;
      }

      if (updates.personalInfo) {
        if (updates.personalInfo.phone) updateData.phone = updates.personalInfo.phone;
        if (updates.personalInfo.address) updateData.address = updates.personalInfo.address;
        if (updates.personalInfo.emergencyContact) updateData.emergency_contact = updates.personalInfo.emergencyContact;
      }

      if (updates.notes) updateData.notes = updates.notes;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', personId);

      if (error) {
        console.error('Error updating employee:', error);
        return false;
      }

      console.log('✅ Updated employee in Supabase:', personId);
      return true;
    } catch (error) {
      console.error('Error in updatePerson:', error);
      return false;
    }
  }

  async deletePerson(personId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', personId);

      if (error) {
        console.error('Error deleting employee:', error);
        return false;
      }

      console.log('✅ Deleted employee from Supabase:', personId);
      return true;
    } catch (error) {
      console.error('Error in deletePerson:', error);
      return false;
    }
  }

  async getPerson(personId: string): Promise<PersonProfile | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles!employees_user_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq('id', personId)
        .single();

      if (error) {
        console.error('Error getting employee:', error);
        return null;
      }

      // Merge profile data if available
      const person = this.mapEmployeeToPersonProfile(data);
      if (data.profiles) {
        person.personalInfo.email = data.profiles.email || '';
        person.personalInfo.fullName = data.profiles.full_name || '';
      }

      return person;
    } catch (error) {
      console.error('Error in getPerson:', error);
      return null;
    }
  }

  async getAllPersons(): Promise<PersonProfile[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles!employees_user_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting employees:', error);
        return [];
      }

      const persons = data.map(employee => {
        const person = this.mapEmployeeToPersonProfile(employee);
        // Merge profile data if available
        if (employee.profiles) {
          person.personalInfo.email = employee.profiles.email || '';
          person.personalInfo.fullName = employee.profiles.full_name || person.workInfo.personId || 'Unknown Employee';
        } else {
          person.personalInfo.fullName = person.workInfo.personId || 'Unknown Employee';
        }
        return person;
      });

      console.log(`✅ Loaded ${persons.length} employees from Supabase`);
      return persons;
    } catch (error) {
      console.error('Error in getAllPersons:', error);
      return [];
    }
  }

  async getPersonsByType(type: PersonType): Promise<PersonProfile[]> {
    // For now, all records from employees table are treated as employees
    // In a full implementation, you might have a type field or separate tables
    if (type === 'employee') {
      return this.getAllPersons();
    }
    return [];
  }

  // Search and filter
  async searchPersons(filters: PersonFilters): Promise<PersonProfile[]> {
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          profiles!employees_user_id_fkey (
            id,
            email,
            full_name
          )
        `);

      // Apply filters
      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        query = query.or(`employee_id.ilike.${searchTerm},department.ilike.${searchTerm},position.ilike.${searchTerm},phone.ilike.${searchTerm}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching employees:', error);
        return [];
      }

      const persons = data.map(employee => {
        const person = this.mapEmployeeToPersonProfile(employee);
        // Merge profile data if available
        if (employee.profiles) {
          person.personalInfo.email = employee.profiles.email || '';
          person.personalInfo.fullName = employee.profiles.full_name || person.workInfo.personId || 'Unknown Employee';
        } else {
          person.personalInfo.fullName = person.workInfo.personId || 'Unknown Employee';
        }
        return person;
      });

      // Additional client-side filtering for fields not easily filtered in SQL
      let results = persons;

      if (filters.personType && filters.personType !== 'employee') {
        results = [];
      }

      if (filters.status) {
        results = results.filter(person => person.workInfo.status === filters.status);
      }

      if (filters.workType) {
        results = results.filter(person => person.workInfo.workType === filters.workType);
      }

      return results;
    } catch (error) {
      console.error('Error in searchPersons:', error);
      return [];
    }
  }

  // Statistics (simplified version)
  async getPersonStats(): Promise<PersonStats> {
    try {
      const allPersons = await this.getAllPersons();
      
      // Basic stats - you can enhance this with more complex queries
      return {
        totalPersons: allPersons.length,
        byType: [{ type: 'employee', count: allPersons.length, percentage: 100 }],
        activePersons: allPersons.filter(p => p.workInfo.status === 'active').length,
        newThisMonth: 0, // Would need more complex date filtering
        terminationsThisMonth: 0,
        averageCompensation: 0,
        totalCompensationCost: 0,
        departmentBreakdown: [],
        statusBreakdown: []
      };
    } catch (error) {
      console.error('Error in getPersonStats:', error);
      return {
        totalPersons: 0,
        byType: [],
        activePersons: 0,
        newThisMonth: 0,
        terminationsThisMonth: 0,
        averageCompensation: 0,
        totalCompensationCost: 0,
        departmentBreakdown: [],
        statusBreakdown: []
      };
    }
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

    // Generate a random number for now
    // In production, you'd query existing IDs to get the next number
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    return `${prefix}${String(randomNum).padStart(3, '0')}`;
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || 'system';
    } catch (error) {
      console.error('Error getting current user:', error);
      return 'system';
    }
  }

  // Export/Import functionality
  async exportPersonsData(): Promise<string> {
    const persons = await this.getAllPersons();
    return JSON.stringify({
      persons: persons,
      exportDate: new Date().toISOString(),
      source: 'supabase'
    }, null, 2);
  }

  // Bulk operations (simplified)
  async bulkUpdatePersons(personIds: string[], updates: PersonUpdateData): Promise<boolean> {
    let success = true;
    for (const id of personIds) {
      if (!(await this.updatePerson(id, updates))) {
        success = false;
      }
    }
    return success;
  }

  async bulkDeletePersons(personIds: string[]): Promise<boolean> {
    let success = true;
    for (const id of personIds) {
      if (!(await this.deletePerson(id))) {
        success = false;
      }
    }
    return success;
  }
}

// Singleton instance
export const supabasePersonManager = new SupabasePersonManager();