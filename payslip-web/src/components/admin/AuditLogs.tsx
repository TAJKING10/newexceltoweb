import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: any;
  new_data?: any;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const Title = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Filters = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const LogsContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
`;

const LogItem = styled.div`
  padding: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.border.light};
  transition: background-color ${theme.animation.duration.normal};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.colors.background.secondary};
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[2]};
`;

const LogMainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const ActionBadge = styled.span<{ action: string }>`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  
  ${props => {
    switch (props.action) {
      case 'INSERT':
        return `background: ${theme.colors.success.light}20; color: ${theme.colors.success.dark};`;
      case 'UPDATE':
        return `background: ${theme.colors.warning.light}20; color: ${theme.colors.warning.dark};`;
      case 'DELETE':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.dark};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const LogTable = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const LogUser = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const LogTime = styled.div`
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.xs};
  text-align: right;
`;

const LogDetails = styled.div<{ expanded: boolean }>`
  margin-top: ${theme.spacing[3]};
  display: ${props => props.expanded ? 'block' : 'none'};
`;

const LogData = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  margin-top: ${theme.spacing[2]};
`;

const LogDataTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  margin-bottom: ${theme.spacing[2]};
`;

const LogDataContent = styled.pre`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  padding: ${theme.spacing[1]} 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: 'all',
    table: 'all'
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching audit logs with filters:', filters);
      
      // First, try to fetch with profiles join
      let { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!audit_logs_user_id_fkey (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // If foreign key join fails, fetch without it
      if (error) {
        console.warn('Foreign key join failed, fetching audit logs without profiles join:', error);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (fallbackError) throw fallbackError;
        data = fallbackData;
      }

      if (!data) {
        console.log('No audit logs data returned');
        setLogs([]);
        return;
      }

      console.log('Raw audit logs data:', data);

      // Apply filters
      let filteredData = data;
      
      if (filters.action !== 'all') {
        filteredData = filteredData.filter(log => log.action === filters.action);
      }
      
      if (filters.table !== 'all') {
        filteredData = filteredData.filter(log => log.table_name === filters.table);
      }

      // Format logs with user information
      const formattedLogs: AuditLog[] = await Promise.all(
        filteredData.map(async (log) => {
          // If we have profiles data from the join, use it
          let userInfo = log.profiles;
          
          // If not, try to fetch user info separately
          if (!userInfo && log.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', log.user_id)
              .single();
            userInfo = profileData;
          }

          return {
            ...log,
            user_name: userInfo?.full_name || userInfo?.email || 'Unknown User',
            user_email: userInfo?.email || 'Unknown'
          };
        })
      );

      console.log('Formatted audit logs:', formattedLogs);
      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Set empty array on error so user sees the empty state
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTableName = (tableName: string): string => {
    return tableName.replace('public.', '').replace(/_/g, ' ').toUpperCase();
  };

  const getUniqueTableNames = (): string[] => {
    const tableNamesSet = new Set(logs.map(log => log.table_name));
    const tableNames = Array.from(tableNamesSet);
    return tableNames.sort();
  };

  const toggleLogDetails = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (loading) {
    return <LoadingSpinner>Loading audit logs...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>Audit Logs ({logs.length} entries)</Title>
        <Filters>
          <Select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="all">All Actions</option>
            <option value="INSERT">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </Select>
          
          <Select
            value={filters.table}
            onChange={(e) => setFilters({ ...filters, table: e.target.value })}
          >
            <option value="all">All Tables</option>
            {getUniqueTableNames().map(table => (
              <option key={table} value={table}>
                {formatTableName(table)}
              </option>
            ))}
          </Select>
        </Filters>
      </Header>

      <LogsContainer>
        {logs.length === 0 ? (
          <EmptyState>
            No audit logs found matching the current filters.
          </EmptyState>
        ) : (
          logs.map(log => (
            <LogItem key={log.id}>
              <LogHeader>
                <LogMainInfo>
                  <ActionBadge action={log.action}>
                    {log.action}
                  </ActionBadge>
                  <LogTable>
                    {formatTableName(log.table_name)}
                  </LogTable>
                  <LogUser>
                    by {log.user_name}
                  </LogUser>
                </LogMainInfo>
                <LogTime>
                  {formatDate(log.created_at)}
                </LogTime>
              </LogHeader>
              
              <ToggleButton onClick={() => toggleLogDetails(log.id)}>
                {expandedLog === log.id ? 'Hide Details' : 'Show Details'}
              </ToggleButton>
              
              <LogDetails expanded={expandedLog === log.id}>
                <div>
                  <strong>Record ID:</strong> {log.record_id}
                </div>
                <div>
                  <strong>User ID:</strong> {log.user_id}
                </div>
                {log.user_email && (
                  <div>
                    <strong>User Email:</strong> {log.user_email}
                  </div>
                )}
                {log.ip_address && (
                  <div>
                    <strong>IP Address:</strong> {log.ip_address}
                  </div>
                )}
                
                {log.old_data && (
                  <LogData>
                    <LogDataTitle>Previous Data</LogDataTitle>
                    <LogDataContent>
                      {JSON.stringify(log.old_data, null, 2)}
                    </LogDataContent>
                  </LogData>
                )}
                
                {log.new_data && (
                  <LogData>
                    <LogDataTitle>New Data</LogDataTitle>
                    <LogDataContent>
                      {JSON.stringify(log.new_data, null, 2)}
                    </LogDataContent>
                  </LogData>
                )}
              </LogDetails>
            </LogItem>
          ))
        )}
      </LogsContainer>
    </Container>
  );
};