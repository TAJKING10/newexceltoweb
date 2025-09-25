import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 16px;
  margin: 20px;
  min-height: 300px;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #dc2626;
`;

const ErrorTitle = styled.h2`
  color: #991b1b;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: #7f1d1d;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  text-align: center;
  margin: 0 0 24px 0;
  max-width: 500px;
`;

const ErrorDetails = styled.details`
  max-width: 600px;
  margin: 20px 0;
  background-color: #ffffff;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 0;
  
  summary {
    padding: 12px 16px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: #991b1b;
    background-color: #fef2f2;
    border-radius: 8px 8px 0 0;
    
    &:hover {
      background-color: #fecaca;
    }
  }
  
  pre {
    padding: 16px;
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background-color: #ffffff;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.2);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.25);
    transition-duration: 100ms;
  }
  
  &:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
`;

const SecondaryButton = styled(ErrorButton)`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3), 0 0 20px rgba(107, 114, 128, 0.2);
  }
  
  &:active {
    box-shadow: 0 4px 15px rgba(107, 114, 128, 0.25);
  }
  
  &:focus-visible {
    outline-color: #6b7280;
  }
`;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            The application encountered an unexpected error. You can try to recover by clicking retry, 
            or refresh the page to start over.
          </ErrorMessage>
          
          {this.state.error && this.state.errorInfo && (
            <ErrorDetails>
              <summary>Show Technical Details</summary>
              <pre>
                <strong>Error:</strong> {this.state.error.toString()}
                {'\n\n'}
                <strong>Component Stack:</strong>
                {this.state.errorInfo.componentStack}
              </pre>
            </ErrorDetails>
          )}
          
          <ButtonGroup>
            <ErrorButton onClick={this.handleRetry}>
              🔄 Try Again
            </ErrorButton>
            <SecondaryButton onClick={this.handleRefresh}>
              ↻ Refresh Page
            </SecondaryButton>
          </ButtonGroup>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;