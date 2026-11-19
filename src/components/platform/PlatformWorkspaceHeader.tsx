import type { ReactNode } from 'react';
import '../../styles/platform-workspace.css';

interface PlatformWorkspaceHeaderProps {
  identity: ReactNode;
  title: string;
  subtitle?: string;
  help?: ReactNode;
  status?: ReactNode;
  tabs: ReactNode;
  tabsLabel: string;
  more?: ReactNode;
}

export function PlatformWorkspaceHeader({
  identity,
  title,
  subtitle,
  help,
  status,
  tabs,
  tabsLabel,
  more,
}: PlatformWorkspaceHeaderProps) {
  return (
    <header className="platform-workspace-header">
      <div className="platform-workspace-intro">
        <div className="platform-workspace-title-block">
          <div className="platform-workspace-identity">{identity}</div>
          <div className="platform-workspace-title">
            <h1>{title}</h1>
            {help}
          </div>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {status && <div className="platform-workspace-status">{status}</div>}
      </div>
      <nav className="platform-workspace-nav" aria-label={tabsLabel}>
        <div className="platform-workspace-tabs">{tabs}</div>
        {more}
      </nav>
    </header>
  );
}
