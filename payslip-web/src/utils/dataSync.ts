/**
 * Unified Data Synchronization Service
 * Ensures data input in one view automatically appears in the other view for the same template
 */

interface SyncedData {
  templateId: string;
  personId?: string;
  data: any;
  lastModified: Date;
}

class DataSyncService {
  private readonly STORAGE_KEY = 'unified-payslip-data';
  private listeners: Set<(templateId: string, personId?: string) => void> = new Set();

  /**
   * Save data for a specific template and person combination
   */
  saveData(templateId: string, data: any, personId?: string): void {
    try {
      const existingData = this.getAllData();
      const key = this.getDataKey(templateId, personId);
      
      const syncedData: SyncedData = {
        templateId,
        personId,
        data: { ...data },
        lastModified: new Date()
      };

      existingData[key] = syncedData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));

      console.log(`💾 DataSync: Saved data for template ${templateId}${personId ? ` and person ${personId}` : ''}`);
      
      // Notify all listeners
      this.notifyListeners(templateId, personId);
    } catch (error) {
      console.error('Error saving synced data:', error);
    }
  }

  /**
   * Load data for a specific template and person combination
   */
  loadData(templateId: string, personId?: string): any | null {
    try {
      const allData = this.getAllData();
      const key = this.getDataKey(templateId, personId);
      
      const syncedData = allData[key];
      if (syncedData) {
        console.log(`📂 DataSync: Loaded data for template ${templateId}${personId ? ` and person ${personId}` : ''}`);
        return syncedData.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading synced data:', error);
      return null;
    }
  }

  /**
   * Update specific field for a template/person combination
   */
  updateField(templateId: string, fieldId: string, value: any, personId?: string): void {
    try {
      const existingData = this.loadData(templateId, personId) || {};
      existingData[fieldId] = value;
      
      this.saveData(templateId, existingData, personId);
      console.log(`🔄 DataSync: Updated field ${fieldId} for template ${templateId}`);
    } catch (error) {
      console.error('Error updating field:', error);
    }
  }

  /**
   * Clear data for a specific template/person combination
   */
  clearData(templateId: string, personId?: string): void {
    try {
      const allData = this.getAllData();
      const key = this.getDataKey(templateId, personId);
      
      delete allData[key];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
      
      console.log(`🧹 DataSync: Cleared data for template ${templateId}${personId ? ` and person ${personId}` : ''}`);
      
      // Notify listeners
      this.notifyListeners(templateId, personId);
    } catch (error) {
      console.error('Error clearing synced data:', error);
    }
  }

  /**
   * Get all templates that have synced data
   */
  getTemplatesWithData(): string[] {
    try {
      const allData = this.getAllData();
      const templateIds = new Set<string>();
      
      Object.values(allData).forEach((syncedData: SyncedData) => {
        templateIds.add(syncedData.templateId);
      });
      
      return Array.from(templateIds);
    } catch (error) {
      console.error('Error getting templates with data:', error);
      return [];
    }
  }

  /**
   * Subscribe to data changes
   */
  subscribe(callback: (templateId: string, personId?: string) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Force refresh - useful when switching between views
   */
  forceRefresh(templateId: string, personId?: string): void {
    console.log('🔄 DataSync: Force refresh triggered');
    this.notifyListeners(templateId, personId);
  }

  private getAllData(): { [key: string]: SyncedData } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting all synced data:', error);
      return {};
    }
  }

  private getDataKey(templateId: string, personId?: string): string {
    return personId ? `${templateId}-${personId}` : `${templateId}-global`;
  }

  private notifyListeners(templateId: string, personId?: string): void {
    this.listeners.forEach(callback => {
      try {
        callback(templateId, personId);
      } catch (error) {
        console.error('Error in data sync listener:', error);
      }
    });
  }

  /**
   * Clear all synced data
   */
  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 DataSync: Cleared all synced data');
    } catch (error) {
      console.error('Error clearing all synced data:', error);
    }
  }

  /**
   * Get data statistics
   */
  getStats(): { totalEntries: number; templatesWithData: number } {
    try {
      const allData = this.getAllData();
      const entries = Object.keys(allData).length;
      const uniqueTemplates = new Set(Object.values(allData).map(d => d.templateId)).size;
      
      return {
        totalEntries: entries,
        templatesWithData: uniqueTemplates
      };
    } catch (error) {
      console.error('Error getting data sync stats:', error);
      return { totalEntries: 0, templatesWithData: 0 };
    }
  }
}

// Export singleton instance
export const dataSync = new DataSyncService();