/**
 * Person Synchronization Service
 *
 * This service manages person selection synchronization between Excel and Basic views.
 * When a person is selected in one view, it automatically updates the other view
 * and loads/clears data accordingly.
 */

import { Customer } from './customerManager';

export interface PersonSyncData {
  selectedPerson: Customer | null;
  selectedPersonType: 'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other';
  lastUpdated: number;
}

type PersonChangeCallback = (person: Customer | null) => void;
type PersonTypeChangeCallback = (personType: string) => void;

class PersonSyncService {
  private selectedPerson: Customer | null = null;
  private selectedPersonType: 'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other' = 'all';
  private personChangeCallbacks: PersonChangeCallback[] = [];
  private personTypeChangeCallbacks: PersonTypeChangeCallback[] = [];
  private lastUpdated: number = Date.now();

  /**
   * Subscribe to person selection changes
   */
  onPersonChange(callback: PersonChangeCallback): () => void {
    this.personChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.personChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.personChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to person type filter changes
   */
  onPersonTypeChange(callback: PersonTypeChangeCallback): () => void {
    this.personTypeChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.personTypeChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.personTypeChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Set the selected person and notify all subscribers
   */
  setSelectedPerson(person: Customer | null, source?: string): void {
    console.log(`🔄 PersonSync: Setting selected person to ${person?.full_name || 'none'} from ${source || 'unknown'}`);

    this.selectedPerson = person;
    this.lastUpdated = Date.now();

    // Notify all subscribers
    this.personChangeCallbacks.forEach(callback => {
      try {
        callback(person);
      } catch (error) {
        console.error('PersonSync: Error in person change callback:', error);
      }
    });
  }

  /**
   * Set the selected person type filter and notify all subscribers
   */
  setSelectedPersonType(personType: 'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other', source?: string): void {
    console.log(`🔄 PersonSync: Setting person type to ${personType} from ${source || 'unknown'}`);

    this.selectedPersonType = personType;
    this.lastUpdated = Date.now();

    // Notify all subscribers
    this.personTypeChangeCallbacks.forEach(callback => {
      try {
        callback(personType);
      } catch (error) {
        console.error('PersonSync: Error in person type change callback:', error);
      }
    });
  }

  /**
   * Get the currently selected person
   */
  getSelectedPerson(): Customer | null {
    return this.selectedPerson;
  }

  /**
   * Get the currently selected person type
   */
  getSelectedPersonType(): 'all' | 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other' {
    return this.selectedPersonType;
  }

  /**
   * Get the current sync data
   */
  getSyncData(): PersonSyncData {
    return {
      selectedPerson: this.selectedPerson,
      selectedPersonType: this.selectedPersonType,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Clear the selected person (useful for fresh starts)
   */
  clearSelectedPerson(source?: string): void {
    console.log(`🔄 PersonSync: Clearing selected person from ${source || 'unknown'}`);
    this.setSelectedPerson(null, source);
  }

  /**
   * Check if a person is currently selected
   */
  hasSelectedPerson(): boolean {
    return this.selectedPerson !== null;
  }

  /**
   * Get person by ID (helper method)
   */
  findPersonById(persons: Customer[], personId: string): Customer | null {
    return persons.find(person => person.id === personId) || null;
  }

  /**
   * Force refresh all subscribers with current data
   */
  forceRefresh(source?: string): void {
    console.log(`🔄 PersonSync: Force refreshing all subscribers from ${source || 'unknown'}`);
    this.setSelectedPerson(this.selectedPerson, source);
    this.setSelectedPersonType(this.selectedPersonType, source);
  }
}

// Export singleton instance
export const personSync = new PersonSyncService();