import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { personManager } from '../utils/personManager';
import { PersonProfile, PersonType, PERSON_TYPE_CONFIG, PersonFilters } from '../types/PersonTypes';
import PersonEditModal from './PersonEditModal';

const Container = styled.div`
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 4px solid #667eea;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const ControlsSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  align-items: end;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #667eea;
          color: white;
          &:hover { background-color: #5a67d8; }
        `;
      case 'success':
        return `
          background-color: #48bb78;
          color: white;
          &:hover { background-color: #38a169; }
        `;
      case 'danger':
        return `
          background-color: #f56565;
          color: white;
          &:hover { background-color: #e53e3e; }
        `;
      default:
        return `
          background-color: #e2e8f0;
          color: #4a5568;
          &:hover { background-color: #cbd5e0; }
        `;
    }
  }}
`;

const PersonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const PersonCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid #667eea;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const PersonHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const PersonTypeIcon = styled.div<{ backgroundColor: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.backgroundColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 15px;
`;

const PersonInfo = styled.div`
  flex: 1;
`;

const PersonName = styled.h3`
  margin: 0 0 5px 0;
  color: #2d3748;
  font-size: 18px;
`;

const PersonDetails = styled.p`
  margin: 0;
  color: #718096;
  font-size: 14px;
`;

const PersonMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 15px 0;
  font-size: 13px;
`;

const MetaItem = styled.div`
  color: #4a5568;
`;

const PersonActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const TypeFilter = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const TypeChip = styled.button<{ active: boolean; color: string }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.color};
  background-color: ${props => props.active ? props.color : 'white'};
  color: ${props => props.active ? 'white' : props.color};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background-color: ${props => props.color};
    color: white;
  }
`;

const PersonManagement: React.FC = () => {
  const [persons, setPersons] = useState<PersonProfile[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonProfile[]>([]);
  const [filters, setFilters] = useState<PersonFilters>({});
  const [selectedType, setSelectedType] = useState<PersonType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPerson, setEditingPerson] = useState<PersonProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadPersons();
    loadStats();
  }, []);

  useEffect(() => {
    filterPersons();
  }, [persons, filters, selectedType, searchTerm]);

  const loadPersons = () => {
    const allPersons = personManager.getAllPersons();
    setPersons(allPersons);
  };

  const loadStats = () => {
    const personStats = personManager.getPersonStats();
    setStats(personStats);
  };

  const filterPersons = () => {
    let filtered = persons;

    if (selectedType !== 'all') {
      filtered = filtered.filter(person => person.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(person =>
        person.personalInfo.fullName.toLowerCase().includes(term) ||
        person.personalInfo.email.toLowerCase().includes(term) ||
        person.workInfo.personId.toLowerCase().includes(term) ||
        person.workInfo.department?.toLowerCase().includes(term) ||
        person.workInfo.position?.toLowerCase().includes(term)
      );
    }

    setFilteredPersons(filtered);
  };

  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowEditModal(true);
  };

  const handleEditPerson = (person: PersonProfile) => {
    setEditingPerson(person);
    setShowEditModal(true);
  };

  const handleDeletePerson = (personId: string) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      personManager.deletePerson(personId);
      loadPersons();
      loadStats();
    }
  };

  const handleSavePerson = (personId: string, updates: any) => {
    if (personId) {
      personManager.updatePerson(personId, updates);
    } else {
      personManager.createPerson(updates);
    }
    setShowEditModal(false);
    loadPersons();
    loadStats();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getPersonTypeCount = (type: PersonType) => {
    return persons.filter(person => person.type === type).length;
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>👥 Universal Person Management</Title>
          <Subtitle>Manage employees, customers, contractors, freelancers, and more</Subtitle>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{persons.length}</StatNumber>
          <StatLabel>Total Persons</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{persons.filter(p => p.workInfo.status === 'active').length}</StatNumber>
          <StatLabel>Active</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{getPersonTypeCount('employee')}</StatNumber>
          <StatLabel>Employees</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{getPersonTypeCount('customer')}</StatNumber>
          <StatLabel>Customers</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{getPersonTypeCount('contractor')}</StatNumber>
          <StatLabel>Contractors</StatLabel>
        </StatCard>
      </StatsGrid>

      <ControlsSection>
        <InputGroup>
          <Label>Search Persons</Label>
          <Input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <div>
          <Button variant="primary" onClick={handleAddPerson}>
            ➕ Add New Person
          </Button>
        </div>
      </ControlsSection>

      <TypeFilter>
        <TypeChip 
          active={selectedType === 'all'} 
          color="#667eea"
          onClick={() => setSelectedType('all')}
        >
          🌟 All Types ({persons.length})
        </TypeChip>
        {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => (
          <TypeChip
            key={type}
            active={selectedType === type}
            color={config.color}
            onClick={() => setSelectedType(type as PersonType)}
          >
            {config.icon} {config.label}s ({getPersonTypeCount(type as PersonType)})
          </TypeChip>
        ))}
      </TypeFilter>

      <PersonGrid>
        {filteredPersons.map(person => (
          <PersonCard key={person.id}>
            <PersonHeader>
              <PersonTypeIcon backgroundColor={PERSON_TYPE_CONFIG[person.type].color}>
                {PERSON_TYPE_CONFIG[person.type].icon}
              </PersonTypeIcon>
              <PersonInfo>
                <PersonName>{person.personalInfo.fullName}</PersonName>
                <PersonDetails>
                  {person.workInfo.personId} • {PERSON_TYPE_CONFIG[person.type].label}
                </PersonDetails>
              </PersonInfo>
            </PersonHeader>

            <PersonMeta>
              <MetaItem>📧 {person.personalInfo.email}</MetaItem>
              <MetaItem>📱 {person.personalInfo.phone}</MetaItem>
              {person.workInfo.department && (
                <MetaItem>🏢 {person.workInfo.department}</MetaItem>
              )}
              {person.workInfo.position && (
                <MetaItem>💼 {person.workInfo.position}</MetaItem>
              )}
              <MetaItem>📅 Created: {formatDate(person.createdDate)}</MetaItem>
              <MetaItem>🔄 Status: {person.workInfo.status}</MetaItem>
            </PersonMeta>

            <PersonActions>
              <Button variant="primary" onClick={() => handleEditPerson(person)}>
                ✏️ Edit
              </Button>
              <Button variant="danger" onClick={() => handleDeletePerson(person.id)}>
                🗑️ Delete
              </Button>
            </PersonActions>
          </PersonCard>
        ))}
      </PersonGrid>

      {filteredPersons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No persons found</h3>
          <p>Try adjusting your filters or add a new person.</p>
        </div>
      )}

      {showEditModal && (
        <PersonEditModal
          person={editingPerson}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePerson}
        />
      )}
    </Container>
  );
};

export default PersonManagement;