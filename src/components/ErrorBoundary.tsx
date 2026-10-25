import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Baswara Sky Suites:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0B0F19] text-[#E5E7EB] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#111827] border border-[#D4AF37]/30 p-8 shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <AlertCircle size={24} />
            </div>

            <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-2">
              Baswara Sky Suites
            </div>

            <h1 className="text-2xl font-serif text-[#F3E5AB] mb-4">
              Terjadi Kendala Tampilan
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-light mb-6">
              Halaman mengalami kendala saat memuat aset residensial. Silakan muat ulang halaman untuk membuka kembali portal hunian.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] font-medium text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              <RotateCcw size={16} />
              <span>Muat Ulang Portal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
