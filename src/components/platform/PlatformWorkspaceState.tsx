import type { ReactNode } from 'react';
import { Loader2, SearchX, UserRoundPlus } from 'lucide-react';

interface PlatformWorkspaceStateProps {
  kind: 'loading' | 'empty' | 'no-match';
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PlatformWorkspaceState({ kind, title, description, children }: PlatformWorkspaceStateProps) {
  return (
    <div
      className="platform-workspace-state"
      data-state={kind}
      role={kind === 'loading' ? 'status' : undefined}
    >
      <span className="platform-workspace-state-mark" aria-hidden="true">
        {kind === 'loading' ? <Loader2 size={22} className="spin" />
          : kind === 'no-match' ? <SearchX size={22} />
          : <UserRoundPlus size={22} />}
      </span>
      <div className="platform-workspace-state-copy">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="platform-workspace-state-actions">{children}</div>}
    </div>
  );
}
