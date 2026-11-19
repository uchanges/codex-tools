import type { ReactNode } from 'react';
import { ArrowUpRight, CheckCircle2, EyeOff, Loader2, RotateCw, Sparkles, UserRoundPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardPlatformPanelProps {
  platform: 'codex' | 'antigravity';
  title: string;
  icon: ReactNode;
  accountCount: number;
  loading: boolean;
  refreshing: boolean;
  canRefresh: boolean;
  currentAccount: ReactNode;
  recommendedAccount: ReactNode;
  onRefresh: () => void;
  onHide: () => void;
  onManage: () => void;
}

export function DashboardPlatformPanel({
  platform,
  title,
  icon,
  accountCount,
  loading,
  refreshing,
  canRefresh,
  currentAccount,
  recommendedAccount,
  onRefresh,
  onHide,
  onManage,
}: DashboardPlatformPanelProps) {
  const { t } = useTranslation();
  const refreshLabel = t('common.refresh', 'Refresh');
  const hideLabel = t('accounts.compact.hide', 'Hide');
  const hasAccounts = accountCount > 0 || currentAccount != null || recommendedAccount != null;
  const initialLoading = loading && !hasAccounts;
  const headingId = 'workspace-platform-' + platform;

  return (
    <article
      className="workspace-platform-panel"
      data-platform={platform}
      aria-labelledby={headingId}
      aria-busy={initialLoading || refreshing}
    >
      <header className="workspace-platform-top">
        <div className="workspace-platform-mark" aria-hidden="true">{icon}</div>
        <div className="workspace-platform-heading">
          <h3 id={headingId}>{title}</h3>
          <p>
            {initialLoading
              ? t('common.loading', 'Loading…')
              : t('dashboard.workspace.accountCount', {
                  count: accountCount,
                  defaultValue: '{{count}} accounts',
                })}
          </p>
        </div>
        <div className="workspace-platform-actions">
          <button
            type="button"
            className="workspace-icon-button"
            title={refreshLabel}
            aria-label={title + ' · ' + refreshLabel}
            disabled={refreshing || !canRefresh || initialLoading}
            onClick={onRefresh}
          >
            <RotateCw size={15} className={refreshing ? 'spin' : undefined} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="workspace-icon-button"
            title={hideLabel}
            aria-label={title + ' · ' + hideLabel}
            onClick={onHide}
          >
            <EyeOff size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      {initialLoading ? (
        <div className="workspace-panel-state" role="status">
          <span className="workspace-state-mark"><Loader2 size={18} className="spin" aria-hidden="true" /></span>
          <strong>{t('dashboard.workspace.loadingAccounts', 'Loading accounts')}</strong>
        </div>
      ) : !hasAccounts ? (
        <div className="workspace-panel-state">
          <span className="workspace-state-mark"><UserRoundPlus size={18} aria-hidden="true" /></span>
          <div>
            <strong>{t('dashboard.workspace.noAccounts', 'No accounts yet')}</strong>
            <p>{t('dashboard.workspace.noAccountsHint', 'Add or import an account to see its quota here.')}</p>
          </div>
        </div>
      ) : (
        <div className="workspace-panel-accounts">
          <section className="workspace-account-slot" data-slot="current">
            <h4><CheckCircle2 size={13} aria-hidden="true" />{t('dashboard.current', 'Current account')}</h4>
            {currentAccount ?? (
              <p className="workspace-current-missing">
                {t('dashboard.workspace.noCurrentAccount', 'No current account. Select one from the account page.')}
              </p>
            )}
          </section>
          {recommendedAccount != null && (
            <section className="workspace-account-slot" data-slot="recommended">
              <h4><Sparkles size={13} aria-hidden="true" />{t('dashboard.recommended', 'Recommended account')}</h4>
              {recommendedAccount}
            </section>
          )}
        </div>
      )}

      <footer className="workspace-platform-footer">
        <button type="button" className="workspace-manage-button" onClick={onManage}>
          <span>{t('dashboard.workspace.manageAccounts', 'Manage accounts')}</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}
