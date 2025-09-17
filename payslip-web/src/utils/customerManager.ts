import { supabase } from '../supabaseClient';

// Customer interface (separate from User/Employee)
export interface Customer {
  id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  person_type: 'customer' | 'vendor' | 'contractor' | 'freelancer' | 'consultant';
  work_type?: 'full-time' | 'part-time' | 'contractor' | 'freelance' | 'consultant' | 'customer' | 'vendor';
  status: 'active' | 'inactive' | 'suspended' | 'terminated' | 'completed';
  department?: string;
  position?: string;
  base_salary?: number;
  hourly_rate?: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
  custom_fields?: any;
  created_by_user_id: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  person_type?: 'customer' | 'vendor' | 'contractor' | 'freelancer' | 'consultant';
  work_type?: 'full-time' | 'part-time' | 'contractor' | 'freelance' | 'consultant' | 'customer' | 'vendor';
  department?: string;
  position?: string;
  base_salary?: number;
  hourly_rate?: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
  custom_fields?: any;
}

export interface UpdateCustomerData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  person_type?: 'customer' | 'vendor' | 'contractor' | 'freelancer' | 'consultant';
  work_type?: 'full-time' | 'part-time' | 'contractor' | 'freelance' | 'consultant' | 'customer' | 'vendor';
  status?: 'active' | 'inactive' | 'suspended' | 'terminated' | 'completed';
  department?: string;
  position?: string;
  base_salary?: number;
  hourly_rate?: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
  custom_fields?: any;
}

export interface CustomerFilters {
  searchTerm?: string;
  person_type?: string;
  status?: string;
  department?: string;
  created_by?: string;
}

class CustomerManager {
  private static instance: CustomerManager;
  private customersCache: Customer[] = [];
  private lastFetch: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): CustomerManager {
    if (!CustomerManager.instance) {
      CustomerManager.instance = new CustomerManager();
    }
    return CustomerManager.instance;
  }

  // Get all customers for current user (respects RLS)
  async getCustomers(forceRefresh: boolean = false): Promise<Customer[]> {
    const now = Date.now();

    if (!forceRefresh && this.customersCache.length > 0 && (now - this.lastFetch) < this.cacheDuration) {
      return this.customersCache;
    }

    try {
      // First try the new customers table
      let { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      // If customers table doesn't exist yet, fallback to existing persons data
      // but filter out employee users (temporary solution)
      if (error && error.message?.includes('does not exist')) {
        console.log('Customers table not available, using fallback to existing persons');

        // Try to get from persons/profiles but exclude employee accounts
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('persons')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          // If persons table also doesn't exist, create mock data for development
          console.log('No persons table available, creating mock data');
          this.customersCache = this.createMockCustomers();
          this.lastFetch = now;
          return this.customersCache;
        }

        // Transform persons data to customer format
        data = this.transformPersonsToCustomers(fallbackData || []);
      } else if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      this.customersCache = data || [];
      this.lastFetch = now;
      return this.customersCache;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Return mock data for development purposes
      this.customersCache = this.createMockCustomers();
      this.lastFetch = now;
      return this.customersCache;
    }
  }

  // Temporary method to create mock customers for development
  private createMockCustomers(): Customer[] {
    // Note: This is synchronous fallback data - in real usage, auth would be checked elsewhere
    const userId = 'mock-user-id';

    return [
      {
        id: 'mock-customer-1',
        person_id: 'CUST_001',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        person_type: 'customer',
        work_type: 'full-time',
        status: 'active',
        department: 'Sales',
        position: 'Sales Representative',
        base_salary: 50000,
        currency: 'USD',
        created_by_user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-customer-2',
        person_id: 'CUST_002',
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0456',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        person_type: 'contractor',
        work_type: 'contractor',
        status: 'active',
        department: 'Engineering',
        position: 'Software Developer',
        hourly_rate: 75,
        currency: 'USD',
        created_by_user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Transform existing persons data to customer format
  private transformPersonsToCustomers(persons: any[]): Customer[] {
    return persons
      .filter(person => {
        // Filter out employee accounts - exclude emails that look like employee emails
        const email = person.email?.toLowerCase() || '';
        const excludeEmails = ['poweroftaj@gmail.com', 'users1@hotmail.com'];
        return !excludeEmails.includes(email) &&
               person.person_type !== 'employee' &&
               person.type !== 'employee';
      })
      .map(person => ({
        id: person.id,
        person_id: person.person_id || person.employee_id || `CUST_${Date.now()}`,
        first_name: person.first_name || person.name?.split(' ')[0] || '',
        last_name: person.last_name || person.name?.split(' ').slice(1).join(' ') || '',
        full_name: person.full_name || person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        email: person.email || '',
        phone: person.phone || '',
        address: person.address || {},
        person_type: person.person_type || 'customer',
        work_type: person.work_type || person.type || 'customer',
        status: person.status || 'active',
        department: person.department || '',
        position: person.position || '',
        base_salary: person.base_salary || person.salary,
        hourly_rate: person.hourly_rate,
        currency: person.currency || 'EUR',
        payment_method: person.payment_method || '',
        notes: person.notes || '',
        custom_fields: person.custom_fields || {},
        created_by_user_id: person.created_by || person.owner_id || 'unknown',
        company_id: person.company_id,
        created_at: person.created_at || new Date().toISOString(),
        updated_at: person.updated_at || new Date().toISOString()
      }));
  }

  // Get filtered customers
  async getFilteredCustomers(filters: CustomerFilters): Promise<Customer[]> {
    let query = supabase
      .from('customers')
      .select('*');

    // Apply filters
    if (filters.person_type && filters.person_type !== 'all') {
      query = query.eq('person_type', filters.person_type);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }

    if (filters.searchTerm) {
      query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,person_id.ilike.%${filters.searchTerm}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error filtering customers:', error);
      throw error;
    }

    return data || [];
  }

  // Get single customer by ID
  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return null;
    }
  }

  // Get customer by person_id
  async getCustomerByPersonId(personId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('person_id', personId)
        .single();

      if (error) {
        console.error('Error fetching customer by person ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch customer by person ID:', error);
      return null;
    }
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    try {
      // Get current user for created_by_user_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User must be authenticated to create customers');
      }

      // Generate person_id if not provided
      const personId = customerData.person_id || this.generatePersonId('CUST');

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          person_id: personId,
          person_type: customerData.person_type || 'customer',
          work_type: customerData.work_type || 'customer',
          currency: customerData.currency || 'EUR',
          status: 'active',
          created_by_user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      // Update cache
      this.customersCache.unshift(data);

      return data;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id: string, updates: UpdateCustomerData): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      // Update cache
      const index = this.customersCache.findIndex(c => c.id === id);
      if (index !== -1) {
        this.customersCache[index] = data;
      }

      return data;
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      // Update cache
      this.customersCache = this.customersCache.filter(c => c.id !== id);

      return true;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    try {
      const customers = await this.getCustomers();

      const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status !== 'active').length,
        byType: {} as Record<string, number>
      };

      // Count by type
      customers.forEach(customer => {
        const type = customer.person_type;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get customer stats:', error);
      throw error;
    }
  }

  // Generate unique person ID
  generatePersonId(prefix: string = 'CUST'): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}_${timestamp}${random}`;
  }

  // Validate customer data
  validateCustomerData(data: CreateCustomerData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!data.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.person_id?.trim()) {
      errors.push('Person ID is required');
    }

    if (data.base_salary && data.base_salary < 0) {
      errors.push('Base salary cannot be negative');
    }

    if (data.hourly_rate && data.hourly_rate < 0) {
      errors.push('Hourly rate cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear cache
  clearCache(): void {
    this.customersCache = [];
    this.lastFetch = 0;
  }

  // Check if current user can edit customer
  async canEditCustomer(customerId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const customer = await this.getCustomer(customerId);
      if (!customer) return false;

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      if (profile?.role === 'admin') return true;

      // Check if user created this customer
      return customer.created_by_user_id === user.user.id;
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return false;
    }
  }
}

// Export singleton instance
export const customerManager = CustomerManager.getInstance();