import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // In production, you could send this to an error tracking service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorService(error, errorInfo);
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-red-950/20" />
          
          <div className="relative z-10 text-center max-w-md">
            {/* Error icon */}
            <AlertTriangle className="w-20 h-20 mx-auto text-red-500 mb-6 animate-pulse" />
            
            {/* Title */}
            <h1 className="font-horror text-4xl text-red-500 text-glow-red mb-4">
              DIMENSIONAL RIFT
            </h1>
            
            {/* Message */}
            <p className="font-vt323 text-xl text-gray-400 mb-8">
              Something went wrong in the Upside Down. The portal has become unstable.
            </p>
            
            {/* Error details (development only) */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mb-6 p-4 bg-red-950/30 border border-red-600 rounded text-left overflow-auto max-h-40">
                <p className="font-code text-xs text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleReload}
                className="game-button flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                RELOAD GAME
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="game-button-secondary"
              >
                RETURN TO BASE
              </Button>
            </div>
            
            {/* Footer */}
            <p className="mt-8 font-code text-xs text-gray-600">
              ERROR CODE: UPSIDE-DOWN-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
