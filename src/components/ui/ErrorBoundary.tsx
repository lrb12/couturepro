import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 px-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Oups ! Une erreur est survenue.</h1>
          <p className="mb-4">Veuillez réessayer plus tard ou contacter le support.</p>
          <details className="text-left text-sm text-red-600 whitespace-pre-wrap">
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
