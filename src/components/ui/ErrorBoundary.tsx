import { Component, type ReactNode, type ErrorInfo } from 'react';

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-2xl">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-900">Algo deu errado</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ocorreu um erro inesperado. Tente recarregar a aplicacao.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-gray-50 border border-gray-100 rounded-xl p-4 overflow-auto max-h-32 text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Recarregar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
