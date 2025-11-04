import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                The application encountered an unexpected error. Please try reloading the page.
              </p>
            </div>
            
            <button
              onClick={this.handleReload}
              className="btn btn-primary w-full mb-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mt-4 text-xs">
                <summary className="cursor-pointer text-gray-500 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="bg-gray-100 p-2 rounded text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;