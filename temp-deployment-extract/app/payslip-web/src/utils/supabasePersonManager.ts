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

  // Convert Supabase customer record to PersonProfile
  private mapCustomerToPersonProfile(customer: any): PersonProfile {
    return {
      id: customer.id,
      type: customer.person_type || 'customer',
      personalInfo: {
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        fullName: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        emergencyContact: undefined // Not stored in customers table currently
      },
      workInfo: {
        personId: customer.person_id,
        department: customer.department || '',
        position: customer.position || '',
        workType: customer.work_type || 'customer',
        status: customer.status || 'active',
        startDate: undefined // Not applicable for customers
      },
      compensation: {
        baseSalary: customer.base_salary ? parseFloat(customer.base_salary) : undefined,
        hourlyRate: customer.hourly_rate ? parseFloat(customer.hourly_rate) : undefined,
        currency: customer.currency || 'EUR',
        payFrequency: 'monthly',
        salaryType: customer.base_salary ? 'salary' : (customer.hourly_rate ? 'hourly' : 'commission'),
        paymentMethod: customer.payment_method || 'direct-deposit',
        bankAccount: undefined,
        taxInfo: undefined
      },
      documents: [],
      createdDate: new Date(customer.created_at),
      lastModified: new Date(customer.updated_at),
      createdBy: customer.created_by_user_id,
      modifiedBy: customer.created_by_user_id,
      tags: [],
      notes: customer.notes || '',
      benefits: {},
      customFields: customer.custom_fields || {}
    };
  }

  // Convert PersonProfile to Supabase customer record
  private mapPersonProfileToCustomer(person: PersonProfile, isUpdate = false): any {
    const baseData: any = {
      person_id: person.workInfo.personId,
      first_name: person.personalInfo.firstName,
      last_name: person.personalInfo.lastName,
      email: person.personalInfo.email,
      phone: person.personalInfo.phone,
      address: person.personalInfo.address || {},
      person_type: person.type || 'customer',
      work_type: person.workInfo.workType || 'customer',
      status: person.workInfo.status || 'active',
      department: person.workInfo.department,
      position: person.workInfo.position,
      base_salary: person.compensation.baseSalary,
      hourly_rate: person.compensation.hourlyRate,
      currency: person.compensation.currency || 'EUR',
      payment_method: person.compensation.paymentMethod,
      notes: person.notes,
      custom_fields: person.customFields || {}
    };

    if (!isUpdate) {
      baseData.created_by_user_id = this.currentUser;
    }

    return baseData;
  }

  // Person CRUD Operations
  async createPerson(personData: PersonCreationData): Promise<string | null> {
    try {
      // Use the database function for proper validation and security
      const { data, error } = await supabase.rpc('create_customer', {
        p_person_id: personData.workInfo?.personId || this.generatePersonId(personData.type || 'customer'),
        p_first_name: personData.personalInfo?.firstName || '',
        p_last_name: personData.personalInfo?.lastName || '',
        p_email: personData.personalInfo?.email || '',
        p_phone: personData.personalInfo?.phone,
        p_person_type: personData.type || 'customer',
        p_work_type: personData.workInfo?.workType || 'customer',
        p_department: personData.workInfo?.department,
        p_position: personData.workInfo?.position,
        p_base_salary: personData.compensation?.baseSalary,
        p_currency: personData.compensation?.currency || 'EUR',
        p_address: personData.personalInfo?.address || {},
        p_custom_fields: personData.customFields || {}
      });

      if (error) {
        console.error('Error creating customer:', error);
        return null;
      }

      console.log('✅ Created customer in Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error in createPerson:', error);
      return null;
    }
  }

  async updatePerson(personId: string, updates: PersonUpdateData): Promise<boolean> {
    try {
      const updateData: any = {};

      if (updates.personalInfo) {
        if (updates.personalInfo.firstName) updateData.first_name = updates.personalInfo.firstName;
        if (updates.personalInfo.lastName) updateData.last_name = updates.personalInfo.lastName;
        if (updates.personalInfo.email) updateData.email = updates.personalInfo.email;
        if (updates.personalInfo.phone) updateData.phone = updates.personalInfo.phone;
        if (updates.personalInfo.address) updateData.address = updates.personalInfo.address;
      }

      if (updates.workInfo) {
        if (updates.workInfo.personId) updateData.person_id = updates.workInfo.personId;
        if (updates.workInfo.department) updateData.department = updates.workInfo.department;
        if (updates.workInfo.position) updateData.position = updates.workInfo.position;
        if (updates.workInfo.workType) updateData.work_type = updates.workInfo.workType;
        if (updates.workInfo.status) updateData.status = updates.workInfo.status;
      }

      if (updates.compensation) {
        if (updates.compensation.baseSalary) updateData.base_salary = updates.compensation.baseSalary;
        if (updates.compensation.hourlyRate) updateData.hourly_rate = updates.compensation.hourlyRate;
        if (updates.compensation.currency) updateData.currency = updates.compensation.currency;
        if (updates.compensation.paymentMethod) updateData.payment_method = updates.compensation.paymentMethod;
      }

      if (updates.type) updateData.person_type = updates.type;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.customFields) updateData.custom_fields = updates.customFields;

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', personId);

      if (error) {
        console.error('Error updating customer:', error);
        return false;
      }

      console.log('✅ Updated customer in Supabase:', personId);
      return true;
    } catch (error) {
      console.error('Error in updatePerson:', error);
      return false;
    }
  }

  async deletePerson(personId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', personId);

      if (error) {
        console.error('Error deleting customer:', error);
        return false;
      }

      console.log('✅ Deleted customer from Supabase:', personId);
      return true;
    } catch (error) {
      console.error('Error in deletePerson:', error);
      return false;
    }
  }

  async getPerson(personId: string): Promise<PersonProfile | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', personId)
        .single();

      if (error) {
        console.error('Error getting customer:', error);
        return null;
      }

      return this.mapCustomerToPersonProfile(data);
    } catch (error) {
      console.error('Error in getPerson:', error);
      return null;
    }
  }

  async getAllPersons(): Promise<PersonProfile[]> {
    try {
      // Use the database function to respect RLS policies
      const { data, error } = await supabase.rpc('get_my_customers');

      if (error) {
        console.error('Error getting customers:', error);
        return [];
      }

      // If the function doesn't work, fall back to direct query
      if (!data || data.length === 0) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (customerError) {
          console.error('Error getting customers (fallback):', customerError);
          return [];
        }

        const persons = customerData.map(customer => this.mapCustomerToPersonProfile(customer));
        console.log(`✅ Loaded ${persons.length} customers from Supabase (fallback)`);
        return persons;
      }

      // Map the function result to full customer records
      const customerIds = data.map((customer: any) => customer.id);
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds)
        .order('created_at', { ascending: false });

      if (customerError) {
        console.error('Error getting full customer data:', customerError);
        return [];
      }

      const persons = customerData.map(customer => this.mapCustomerToPersonProfile(customer));
      console.log(`✅ Loaded ${persons.length} customers from Supabase`);
      return persons;
    } catch (error) {
      console.error('Error in getAllPersons:', error);
      return [];
    }
  }

  async getPersonsByType(type: PersonType): Promise<PersonProfile[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('person_type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting customers by type:', error);
        return [];
      }

      return data.map(customer => this.mapCustomerToPersonProfile(customer));
    } catch (error) {
      console.error('Error in getPersonsByType:', error);
      return [];
    }
  }

  // Search and filter
  async searchPersons(filters: PersonFilters): Promise<PersonProfile[]> {
    try {
      let query = supabase
        .from('customers')
        .select('*');

      // Apply filters
      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      if (filters.personType) {
        query = query.eq('person_type', filters.personType);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.workType) {
        query = query.eq('work_type', filters.workType);
      }

      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        query = query.or(`person_id.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},department.ilike.${searchTerm},position.ilike.${searchTerm},phone.ilike.${searchTerm}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching customers:', error);
        return [];
      }

      return data.map(customer => this.mapCustomerToPersonProfile(customer));
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