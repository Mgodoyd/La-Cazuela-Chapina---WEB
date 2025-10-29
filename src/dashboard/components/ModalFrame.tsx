import type { ReactNode } from 'react';

type ModalWidth = 'md' | 'lg' | 'xl';

const widthMap: Record<ModalWidth, string> = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

interface ModalFrameProps {
  title: string;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
  children: ReactNode;
  width?: ModalWidth;
}

export function ModalFrame({
  title,
  description,
  onClose,
  actions,
  children,
  width = 'lg',
}: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
      <div
        className={`w-full ${widthMap[width]} overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label={`Cerrar ${title}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
