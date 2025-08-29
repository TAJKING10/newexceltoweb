import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { personManager } from '../utils/personManager';
import { PersonProfile, PersonType, PERSON_TYPE_CONFIG, PersonFilters } from '../types/PersonTypes';
import PersonEditModal from './PersonEditModal';
import { theme } from '../styles/theme';

const Container = styled.div`
  padding: 0;
  font-family: ${theme.typography.fontFamily.primary};
  background-color: transparent;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing[8]};
  background: ${theme.colors.gradients.primary};
  color: white;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.xl};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="800" r="200" fill="url(%23a)"/></svg>');
    pointer-events: none;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[6]} ${theme.spacing[4]};
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.black};
  font-family: ${theme.typography.fontFamily.secondary};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  margin: ${theme.spacing[2]} 0 0 0;
  opacity: 0.9;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.base};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${theme.spacing[4]};
  }
`;

const StatCard = styled.div`
  background: white;
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.base};
  text-align: center;
  border-left: 4px solid ${theme.colors.primary.main};
  position: relative;
  overflow: hidden;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.colors.gradients.primary};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`;

const StatNumber = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.black};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing[2]};
  font-family: ${theme.typography.fontFamily.secondary};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const StatLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const ControlsSection = styled.div`
  background: white;
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.base};
  margin-bottom: ${theme.spacing[6]};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[5]};
  align-items: end;
  border: 1px solid ${theme.colors.border.light};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    padding: ${theme.spacing[4]};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:hover {
    border-color: ${theme.colors.primary.light};
  }
  
  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:hover {
    border-color: ${theme.colors.primary.light};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  min-height: 44px;
  position: relative;
  overflow: hidden;
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary};
          color: white;
          box-shadow: ${theme.shadows.base};
          
          &:hover {
            box-shadow: ${theme.shadows.lg};
            transform: translateY(-2px);
          }
        `;
      case 'success':
        return `
          background: ${theme.colors.gradients.secondary};
          color: white;
          box-shadow: ${theme.shadows.base};
          
          &:hover {
            box-shadow: ${theme.shadows.lg};
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return `
          background-color: ${theme.colors.error.main};
          color: white;
          box-shadow: ${theme.shadows.base};
          
          &:hover {
            background-color: ${theme.colors.error.dark};
            box-shadow: ${theme.shadows.lg};
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background-color: white;
          color: ${theme.colors.text.secondary};
          border: 2px solid ${theme.colors.border.light};
          
          &:hover {
            background-color: ${theme.colors.gray[50]};
            border-color: ${theme.colors.primary.light};
            color: ${theme.colors.primary.main};
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

const PersonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: ${theme.spacing[4]};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const PersonCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.base};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  border-left: 4px solid ${theme.colors.primary.main};
  border: 1px solid ${theme.colors.border.light};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.colors.gradients.primary};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary.light};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
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
  margin: 0 0 ${theme.spacing[1]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily.secondary};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const PersonDetails = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const PersonMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 15px 0;
  font-size: 13px;
`;

const MetaItem = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const PersonActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const TypeFilter = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[2]};
  }
`;

const TypeChip = styled.button<{ active: boolean; color: string }>`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${props => props.color};
  background-color: ${props => props.active ? props.color : 'white'};
  color: ${props => props.active ? 'white' : props.color};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    background-color: ${props => props.color};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
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
    <Container className="animate-fadeIn">
      <Header>
        <HeaderContent>
          <Title>👥 Universal Person Management</Title>
          <Subtitle>Manage employees, customers, contractors, freelancers, and more</Subtitle>
        </HeaderContent>
      </Header>

      <StatsGrid className="stagger-children">
        <StatCard className="hover-float">
          <StatNumber>{persons.length}</StatNumber>
          <StatLabel>Total Persons</StatLabel>
        </StatCard>
        <StatCard className="hover-float">
          <StatNumber>{persons.filter(p => p.workInfo.status === 'active').length}</StatNumber>
          <StatLabel>Active</StatLabel>
        </StatCard>
        <StatCard className="hover-float">
          <StatNumber>{getPersonTypeCount('employee')}</StatNumber>
          <StatLabel>Employees</StatLabel>
        </StatCard>
        <StatCard className="hover-float">
          <StatNumber>{getPersonTypeCount('customer')}</StatNumber>
          <StatLabel>Customers</StatLabel>
        </StatCard>
        <StatCard className="hover-float">
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

      <PersonGrid className="stagger-children">
        {filteredPersons.map(person => (
          <PersonCard key={person.id} className="card-interactive hover-glow">
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