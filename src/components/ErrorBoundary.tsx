import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('wongok_posts');
      localStorage.removeItem('wongok_rentals');
      localStorage.removeItem('wongok_matches');
      localStorage.removeItem('wongok_role');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                원곡중학교 스포츠 원더풀
              </h2>
              <p className="text-sm font-bold text-slate-300">
                화면을 표시하는 중 일시적인 오류가 발생했습니다.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                안전한 복구를 위해 페이지를 새로고침하거나 브라우저 저장 데이터를 초기화해 보세요.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-950/60 rounded-xl p-3 text-left border border-slate-700/60 max-h-24 overflow-y-auto">
                <p className="text-[11px] font-mono text-rose-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>페이지 새로고침</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>데이터 초기화</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
