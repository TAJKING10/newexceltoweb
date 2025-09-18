/**
 * Customer Excel Service
 * Handles customer-specific Excel file storage, management, and operations
 */

import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

export interface CustomerExcelFile {
  id?: string;
  customer_id: string;
  customer_name: string;
  file_name: string;
  file_data: any; // Excel workbook data
  file_size: number;
  sheet_names: string[];
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  is_active?: boolean;
  description?: string;
  version?: number;
}

export interface ExcelCellData {
  address: string;
  value: any;
  formula?: string;
  type: string;
}

export interface ExcelSheetData {
  sheetName: string;
  cells: ExcelCellData[];
  range: string;
}

class CustomerExcelService {
  
  /**
   * Save Excel file for a specific customer
   */
  async saveCustomerExcelFile(
    customerId: string,
    customerName: string,
    fileName: string,
    excelData: any,
    description?: string
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Convert Excel data to workbook if it's a File
      let workbook: XLSX.WorkBook;
      let fileSize = 0;
      
      if (excelData instanceof File) {
        const arrayBuffer = await excelData.arrayBuffer();
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
        fileSize = excelData.size;
      } else if (typeof excelData === 'object' && excelData.SheetNames) {
        // Already a workbook
        workbook = excelData;
        fileSize = JSON.stringify(excelData).length;
      } else {
        return { success: false, error: 'Invalid Excel data format' };
      }

      // Extract sheet names
      const sheetNames = workbook.SheetNames;

      // Prepare data for saving
      const saveData: Partial<CustomerExcelFile> = {
        customer_id: customerId,
        customer_name: customerName,
        file_name: fileName,
        file_data: workbook,
        file_size: fileSize,
        sheet_names: sheetNames,
        owner_id: user.id,
        is_active: true,
        description: description || `Excel file for ${customerName}`,
        version: 1
      };

      console.log('💾 Saving Excel file for customer:', {
        customer: customerName,
        fileName,
        sheets: sheetNames.length,
        size: fileSize
      });

      // Check if file already exists for this customer
      const { data: existingFiles, error: fetchError } = await supabase
        .from('customer_excel_files')
        .select('id, version')
        .eq('customer_id', customerId)
        .eq('file_name', fileName)
        .eq('owner_id', user.id)
        .eq('is_active', true);

      if (fetchError) {
        console.error('Error checking existing files:', fetchError);
        return { success: false, error: fetchError.message };
      }

      let result;
      if (existingFiles && existingFiles.length > 0) {
        // Update existing file with incremented version
        const existingFile = existingFiles[0];
        saveData.version = (existingFile.version || 1) + 1;
        
        console.log('📝 Updating existing Excel file with version:', saveData.version);
        
        const { data, error } = await supabase
          .from('customer_excel_files')
          .update(saveData)
          .eq('id', existingFile.id)
          .select('id')
          .single();

        result = { data, error };
      } else {
        // Insert new file
        console.log('📝 Inserting new Excel file');
        
        const { data, error } = await supabase
          .from('customer_excel_files')
          .insert([saveData])
          .select('id')
          .single();

        result = { data, error };
      }

      if (result.error) {
        console.error('❌ Database operation failed:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Successfully saved customer Excel file with ID:', result.data?.id);
      return { success: true, id: result.data?.id };

    } catch (error: any) {
      console.error('❌ Error in saveCustomerExcelFile:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load Excel file for a specific customer
   */
  async loadCustomerExcelFile(customerId: string, fileName?: string): Promise<{ success: boolean; data?: CustomerExcelFile; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading Excel file for customer:', customerId, fileName ? `file: ${fileName}` : '(latest)');

      let query = supabase
        .from('customer_excel_files')
        .select('*')
        .eq('customer_id', customerId)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (fileName) {
        query = query.eq('file_name', fileName);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('❌ Error loading customer Excel file:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No Excel file found for this customer');
        return { success: false, error: 'No Excel file found' };
      }

      const excelFile = data[0];
      console.log('✅ Successfully loaded customer Excel file:', {
        fileName: excelFile.file_name,
        sheets: excelFile.sheet_names?.length || 0,
        version: excelFile.version
      });

      return { success: true, data: excelFile };

    } catch (error: any) {
      console.error('❌ Error in loadCustomerExcelFile:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Get all Excel files for a customer
   */
  async getCustomerExcelFiles(customerId: string): Promise<{ success: boolean; data?: CustomerExcelFile[]; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('customer_excel_files')
        .select('*')
        .eq('customer_id', customerId)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting customer Excel files:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error: any) {
      console.error('❌ Error in getCustomerExcelFiles:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Extract sheet data from Excel file
   */
  extractSheetData(workbook: XLSX.WorkBook, sheetName?: string): ExcelSheetData[] {
    const sheets: ExcelSheetData[] = [];
    const sheetNames = sheetName ? [sheetName] : workbook.SheetNames;

    sheetNames.forEach(name => {
      const worksheet = workbook.Sheets[name];
      if (!worksheet) return;

      const cells: ExcelCellData[] = [];
      const range = worksheet['!ref'] || 'A1:A1';
      const decodedRange = XLSX.utils.decode_range(range);

      for (let row = decodedRange.s.r; row <= decodedRange.e.r; row++) {
        for (let col = decodedRange.s.c; col <= decodedRange.e.c; col++) {
          const address = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[address];

          if (cell) {
            cells.push({
              address,
              value: cell.v,
              formula: cell.f,
              type: cell.t || 'unknown'
            });
          }
        }
      }

      sheets.push({
        sheetName: name,
        cells,
        range
      });
    });

    return sheets;
  }

  /**
   * Update specific cell in customer's Excel file
   */
  async updateCustomerExcelCell(
    customerId: string,
    fileName: string,
    sheetName: string,
    cellAddress: string,
    value: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Load the current Excel file
      const loadResult = await this.loadCustomerExcelFile(customerId, fileName);
      if (!loadResult.success || !loadResult.data) {
        return { success: false, error: loadResult.error || 'Failed to load Excel file' };
      }

      const workbook = loadResult.data.file_data;
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        return { success: false, error: `Sheet '${sheetName}' not found` };
      }

      // Update the cell
      worksheet[cellAddress] = { v: value, t: typeof value === 'number' ? 'n' : 's' };

      // Save the updated file
      const saveResult = await this.saveCustomerExcelFile(
        customerId,
        loadResult.data.customer_name,
        fileName,
        workbook,
        loadResult.data.description
      );

      return saveResult;

    } catch (error: any) {
      console.error('❌ Error updating Excel cell:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Delete customer Excel file
   */
  async deleteCustomerExcelFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('customer_excel_files')
        .update({ is_active: false })
        .eq('id', fileId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('❌ Error deleting customer Excel file:', error);
        return { success: false, error: error.message };
      }

      console.log('🗑️ Successfully deleted customer Excel file');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in deleteCustomerExcelFile:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Export Excel file as buffer for download
   */
  exportCustomerExcelFile(workbook: XLSX.WorkBook, fileName: string): Uint8Array {
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }

  /**
   * Create new Excel file from template for customer
   */
  async createCustomerExcelFromTemplate(
    customerId: string,
    customerName: string,
    templateData: any,
    fileName: string
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Add a default sheet with template data
      const worksheet = XLSX.utils.json_to_sheet(templateData || []);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip Data');

      // Save the new Excel file
      return await this.saveCustomerExcelFile(
        customerId,
        customerName,
        fileName,
        workbook,
        `Excel file created from template for ${customerName}`
      );

    } catch (error: any) {
      console.error('❌ Error creating Excel from template:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
}

// Export singleton instance
export const customerExcelService = new CustomerExcelService();