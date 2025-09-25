/**
 * Cross-View Selection Synchronization Service
 * Ensures Excel View and Basic View always use the same template and person
 */
class ViewSyncService {
  private templateListeners: Set<(templateId: string | null) => void> = new Set();
  private personListeners: Set<(personId: string | null) => void> = new Set();
  private personTypeListeners: Set<(personType: string) => void> = new Set();
  private yearListeners: Set<(year: number) => void> = new Set();
  
  private readonly SELECTED_TEMPLATE_KEY = 'selected-template-id';
  private readonly SELECTED_PERSON_KEY = 'selected-person-id';
  private readonly SELECTED_PERSON_TYPE_KEY = 'selected-person-type';
  private readonly SELECTED_YEAR_KEY = 'selected-year';

  /**
   * Set the currently selected template across all views
   */
  setSelectedTemplate(templateId: string | null): void {
    try {
      if (templateId) {
        localStorage.setItem(this.SELECTED_TEMPLATE_KEY, templateId);
        console.log('🔄 ViewSync: Template selection synced:', templateId);
      } else {
        localStorage.removeItem(this.SELECTED_TEMPLATE_KEY);
      }
      
      // Notify all views about the template change
      this.templateListeners.forEach(callback => {
        try {
          callback(templateId);
        } catch (e) {
          console.error('Error in template listener:', e);
        }
      });
    } catch (e) {
      console.error('Error setting selected template:', e);
    }
  }

  /**
   * Get the currently selected template ID
   */
  getSelectedTemplate(): string | null {
    try {
      return localStorage.getItem(this.SELECTED_TEMPLATE_KEY);
    } catch (e) {
      console.error('Error getting selected template:', e);
      return null;
    }
  }

  /**
   * Set the currently selected person across all views
   */
  setSelectedPerson(personId: string | null): void {
    try {
      if (personId) {
        localStorage.setItem(this.SELECTED_PERSON_KEY, personId);
        console.log('🔄 ViewSync: Person selection synced:', personId);
      } else {
        localStorage.removeItem(this.SELECTED_PERSON_KEY);
      }
      
      // Notify all views about the person change
      this.personListeners.forEach(callback => {
        try {
          callback(personId);
        } catch (e) {
          console.error('Error in person listener:', e);
        }
      });
    } catch (e) {
      console.error('Error setting selected person:', e);
    }
  }

  /**
   * Get the currently selected person ID
   */
  getSelectedPerson(): string | null {
    try {
      return localStorage.getItem(this.SELECTED_PERSON_KEY);
    } catch (e) {
      console.error('Error getting selected person:', e);
      return null;
    }
  }

  /**
   * Subscribe to template selection changes
   */
  onTemplateChange(callback: (templateId: string | null) => void): () => void {
    this.templateListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.templateListeners.delete(callback);
    };
  }

  /**
   * Subscribe to person selection changes
   */
  onPersonChange(callback: (personId: string | null) => void): () => void {
    this.personListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.personListeners.delete(callback);
    };
  }

  /**
   * Set the currently selected person type across all views
   */
  setSelectedPersonType(personType: string): void {
    try {
      localStorage.setItem(this.SELECTED_PERSON_TYPE_KEY, personType);
      console.log('🔄 ViewSync: Person type selection synced:', personType);
      
      // Notify all views about the person type change
      this.personTypeListeners.forEach(callback => {
        try {
          callback(personType);
        } catch (e) {
          console.error('Error in person type listener:', e);
        }
      });
    } catch (e) {
      console.error('Error setting selected person type:', e);
    }
  }

  /**
   * Get the currently selected person type
   */
  getSelectedPersonType(): string {
    try {
      return localStorage.getItem(this.SELECTED_PERSON_TYPE_KEY) || 'all';
    } catch (e) {
      console.error('Error getting selected person type:', e);
      return 'all';
    }
  }

  /**
   * Subscribe to person type selection changes
   */
  onPersonTypeChange(callback: (personType: string) => void): () => void {
    this.personTypeListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.personTypeListeners.delete(callback);
    };
  }

  /**
   * Set the currently selected year across all views
   */
  setSelectedYear(year: number): void {
    try {
      localStorage.setItem(this.SELECTED_YEAR_KEY, year.toString());
      console.log('🔄 ViewSync: Year selection synced:', year);
      
      // Notify all views about the year change
      this.yearListeners.forEach(callback => {
        try {
          callback(year);
        } catch (e) {
          console.error('Error in year listener:', e);
        }
      });
    } catch (e) {
      console.error('Error setting selected year:', e);
    }
  }

  /**
   * Get the currently selected year
   */
  getSelectedYear(): number {
    try {
      const stored = localStorage.getItem(this.SELECTED_YEAR_KEY);
      return stored ? parseInt(stored) : new Date().getFullYear();
    } catch (e) {
      console.error('Error getting selected year:', e);
      return new Date().getFullYear();
    }
  }

  /**
   * Subscribe to year selection changes
   */
  onYearChange(callback: (year: number) => void): () => void {
    this.yearListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.yearListeners.delete(callback);
    };
  }

  /**
   * Get view-specific storage key for template+person combination
   */
  getViewDataKey(viewName: string, templateId?: string, personId?: string): string {
    const template = templateId || this.getSelectedTemplate() || 'default';
    const person = personId || this.getSelectedPerson() || 'default';
    return `${viewName}-data-${template}-${person}`;
  }

  /**
   * Save view-specific data with current template+person combination
   */
  saveViewData(viewName: string, data: any, templateId?: string, personId?: string): void {
    try {
      const key = this.getViewDataKey(viewName, templateId, personId);
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 ViewSync: Saved ${viewName} data for template+person combination`);
    } catch (e) {
      console.error(`Error saving ${viewName} data:`, e);
    }
  }

  /**
   * Load view-specific data for current template+person combination
   */
  loadViewData(viewName: string, templateId?: string, personId?: string): any {
    try {
      const key = this.getViewDataKey(viewName, templateId, personId);
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`📂 ViewSync: Loaded ${viewName} data for template+person combination`);
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      console.error(`Error loading ${viewName} data:`, e);
      return null;
    }
  }

  /**
   * Clear all view data (useful for fresh start)
   */
  clearViewData(viewName: string): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(`${viewName}-data-`));
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ ViewSync: Cleared all ${viewName} data`);
    } catch (e) {
      console.error(`Error clearing ${viewName} data:`, e);
    }
  }

  /**
   * Force notify all listeners (useful for initial sync)
   */
  forceSync(): void {
    const templateId = this.getSelectedTemplate();
    const personId = this.getSelectedPerson();
    const personType = this.getSelectedPersonType();
    const year = this.getSelectedYear();
    
    this.templateListeners.forEach(callback => {
      try {
        callback(templateId);
      } catch (e) {
        console.error('Error in template force sync:', e);
      }
    });
    
    this.personListeners.forEach(callback => {
      try {
        callback(personId);
      } catch (e) {
        console.error('Error in person force sync:', e);
      }
    });
    
    this.personTypeListeners.forEach(callback => {
      try {
        callback(personType);
      } catch (e) {
        console.error('Error in person type force sync:', e);
      }
    });
    
    this.yearListeners.forEach(callback => {
      try {
        callback(year);
      } catch (e) {
        console.error('Error in year force sync:', e);
      }
    });
    
    console.log('🔄 ViewSync: Force sync completed');
  }
}

// Export singleton instance
export const viewSync = new ViewSyncService();