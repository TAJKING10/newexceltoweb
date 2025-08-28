import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PersonProfile, PersonType, PersonUpdateData, PERSON_TYPE_CONFIG } from '../types/PersonTypes';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 25px;
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  color: ${props => props.active ? '#667eea' : '#64748b'};
  border-bottom-color: ${props => props.active ? '#667eea' : 'transparent'};
  
  &:hover {
    color: #667eea;
    background-color: #f8fafc;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
  color: #2d3748;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PersonTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

const TypeOption = styled.button<{ selected: boolean; color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border: 2px solid ${props => props.selected ? props.color : '#e2e8f0'};
  background-color: ${props => props.selected ? props.color : 'white'};
  color: ${props => props.selected ? 'white' : props.color};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 600;
  
  &:hover {
    background-color: ${props => props.color};
    color: white;
  }
`;

const TypeIcon = styled.div`
  font-size: 24px;
`;

const ModalFooter = styled.div`
  padding: 20px 30px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.variant === 'primary' ? `
    background-color: #667eea;
    color: white;
    &:hover { background-color: #5a67d8; }
  ` : `
    background-color: #e2e8f0;
    color: #4a5568;
    &:hover { background-color: #cbd5e0; }
  `}
`;

interface PersonEditModalProps {
  person: PersonProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (personId: string, updates: PersonUpdateData) => void;
}

const PersonEditModal: React.FC<PersonEditModalProps> = ({ person, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<PersonUpdateData>({
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
      department: '',
      position: '',
      title: '',
      workType: 'full-time',
      status: 'active'
    },
    compensation: {
      baseSalary: 0,
      hourlyRate: 0,
      currency: 'USD',
      payFrequency: 'bi-weekly',
      salaryType: 'salary',
      paymentMethod: 'direct-deposit'
    },
    notes: ''
  });

  useEffect(() => {
    if (person) {
      setFormData({
        type: person.type,
        personalInfo: {
          firstName: person.personalInfo.firstName,
          lastName: person.personalInfo.lastName,
          fullName: person.personalInfo.fullName,
          email: person.personalInfo.email,
          phone: person.personalInfo.phone,
          address: { ...person.personalInfo.address }
        },
        workInfo: { ...person.workInfo },
        compensation: { ...person.compensation },
        notes: person.notes || ''
      });
    } else {
      // Reset form for new person
      setFormData({
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
          department: '',
          position: '',
          title: '',
          workType: 'full-time',
          status: 'active'
        },
        compensation: {
          baseSalary: 0,
          hourlyRate: 0,
          currency: 'USD',
          payFrequency: 'bi-weekly',
          salaryType: 'salary',
          paymentMethod: 'direct-deposit'
        },
        notes: ''
      });
    }
  }, [person]);

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      // Auto-update full name when first or last name changes
      if (path === 'personalInfo.firstName' || path === 'personalInfo.lastName') {
        const firstName = path === 'personalInfo.firstName' ? value : formData.personalInfo?.firstName || '';
        const lastName = path === 'personalInfo.lastName' ? value : formData.personalInfo?.lastName || '';
        newData.personalInfo!.fullName = `${firstName} ${lastName}`.trim();
      }
      
      return newData;
    });
  };

  const handleSave = () => {
    onSave(person?.id || '', formData);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {person ? '✏️ Edit Person' : '➕ Add New Person'}
          </ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          {!person && (
            <>
              <Label>Select Person Type</Label>
              <PersonTypeSelector>
                {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => (
                  <TypeOption
                    key={type}
                    selected={formData.type === type}
                    color={config.color}
                    onClick={() => handleInputChange('type', type)}
                  >
                    <TypeIcon>{config.icon}</TypeIcon>
                    {config.label}
                  </TypeOption>
                ))}
              </PersonTypeSelector>
            </>
          )}

          <TabsContainer>
            <Tab active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>
              👤 Basic Info
            </Tab>
            <Tab active={activeTab === 'work'} onClick={() => setActiveTab('work')}>
              💼 Work Details
            </Tab>
            <Tab active={activeTab === 'compensation'} onClick={() => setActiveTab('compensation')}>
              💰 Compensation
            </Tab>
            <Tab active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
              📝 Notes
            </Tab>
          </TabsContainer>

          {activeTab === 'basic' && (
            <FormGrid>
              <InputGroup>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.firstName || ''}
                  onChange={(e) => handleInputChange('personalInfo.firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.lastName || ''}
                  onChange={(e) => handleInputChange('personalInfo.lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.personalInfo?.email || ''}
                  onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                  placeholder="Enter email address"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.personalInfo?.phone || ''}
                  onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Street Address</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.address?.street || ''}
                  onChange={(e) => handleInputChange('personalInfo.address.street', e.target.value)}
                  placeholder="Enter street address"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>City</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.address?.city || ''}
                  onChange={(e) => handleInputChange('personalInfo.address.city', e.target.value)}
                  placeholder="Enter city"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>State</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.address?.state || ''}
                  onChange={(e) => handleInputChange('personalInfo.address.state', e.target.value)}
                  placeholder="Enter state"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  value={formData.personalInfo?.address?.zipCode || ''}
                  onChange={(e) => handleInputChange('personalInfo.address.zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </InputGroup>
            </FormGrid>
          )}

          {activeTab === 'work' && (
            <FormGrid>
              <InputGroup>
                <Label>Person ID *</Label>
                <Input
                  type="text"
                  value={formData.workInfo?.personId || ''}
                  onChange={(e) => handleInputChange('workInfo.personId', e.target.value)}
                  placeholder="Enter unique ID"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Department</Label>
                <Input
                  type="text"
                  value={formData.workInfo?.department || ''}
                  onChange={(e) => handleInputChange('workInfo.department', e.target.value)}
                  placeholder="Enter department"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Position/Title</Label>
                <Input
                  type="text"
                  value={formData.workInfo?.position || ''}
                  onChange={(e) => handleInputChange('workInfo.position', e.target.value)}
                  placeholder="Enter position"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Work Type</Label>
                <Select
                  value={formData.workInfo?.workType || 'full-time'}
                  onChange={(e) => handleInputChange('workInfo.workType', e.target.value)}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contractor">Contractor</option>
                  <option value="freelance">Freelance</option>
                  <option value="consultant">Consultant</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Status</Label>
                <Select
                  value={formData.workInfo?.status || 'active'}
                  onChange={(e) => handleInputChange('workInfo.status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                  <option value="completed">Completed</option>
                </Select>
              </InputGroup>
            </FormGrid>
          )}

          {activeTab === 'compensation' && (
            <FormGrid>
              <InputGroup>
                <Label>Base Salary</Label>
                <Input
                  type="number"
                  value={formData.compensation?.baseSalary || 0}
                  onChange={(e) => handleInputChange('compensation.baseSalary', parseFloat(e.target.value) || 0)}
                  placeholder="Enter base salary"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  value={formData.compensation?.hourlyRate || 0}
                  onChange={(e) => handleInputChange('compensation.hourlyRate', parseFloat(e.target.value) || 0)}
                  placeholder="Enter hourly rate"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Currency</Label>
                <Select
                  value={formData.compensation?.currency || 'USD'}
                  onChange={(e) => handleInputChange('compensation.currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Payment Method</Label>
                <Select
                  value={formData.compensation?.paymentMethod || 'direct-deposit'}
                  onChange={(e) => handleInputChange('compensation.paymentMethod', e.target.value)}
                >
                  <option value="direct-deposit">Direct Deposit</option>
                  <option value="check">Check</option>
                  <option value="paypal">PayPal</option>
                  <option value="wire-transfer">Wire Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="crypto">Cryptocurrency</option>
                </Select>
              </InputGroup>
            </FormGrid>
          )}

          {activeTab === 'notes' && (
            <InputGroup>
              <Label>Additional Notes</Label>
              <TextArea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes or comments..."
              />
            </InputGroup>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {person ? 'Update Person' : 'Create Person'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PersonEditModal;