import type { ReactNode } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaginationControls } from '../components/PaginationControls';
import { buildPaginationPageSizeStorageKey, usePagination } from '../hooks/usePagination';
import type { PlatformId } from '../types/platform';
import { getPlatformLabel, renderPlatformIcon } from '../utils/platformMeta';

const pageSizeKey = buildPaginationPageSizeStorageKey('dashboard');

interface AccountCard {
  id: string;
  platformId: PlatformId;
  render: () => ReactNode;
}

export function dashboardAccountCards<Account extends { id: string }>(
  platformId: PlatformId,
  accounts: readonly Account[],
  render: (account: Account) => ReactNode,
): AccountCard[] {
  return accounts.map((account) => ({
    id: account.id,
    platformId,
    render: () => render(account),
  }));
}

export function DashboardAllAccounts({ accounts, loading }: {
  accounts: AccountCard[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { pageItems, setPageSize, goToPreviousPage, goToNextPage, ...pagination } =
    usePagination({ items: accounts, storageKey: pageSizeKey });

  return (
    <section aria-label={t('dashboard.viewAllAccounts')}>
      {loading && accounts.length === 0 && (
        <div className="workspace-collection-state" role="status">
          <span className="workspace-state-mark"><Loader2 size={18} className="spin" aria-hidden="true" /></span>
          <strong>{t('dashboard.workspace.loadingAccounts', 'Loading accounts')}</strong>
        </div>
      )}
      {loading && accounts.length > 0 && (
        <div className="dashboard-all-accounts-status" role="status">
          <Loader2 size={14} className="spin" />
          <span>{t('common.loading')}</span>
        </div>
      )}
      {!loading && accounts.length === 0 && (
        <div className="workspace-collection-state">
          <span className="workspace-state-mark"><Inbox size={18} aria-hidden="true" /></span>
          <div>
            <strong>{t('dashboard.workspace.noAccounts', 'No accounts yet')}</strong>
            <p>{t('dashboard.workspace.noAccountsHint', 'Add or import an account to see its quota here.')}</p>
          </div>
        </div>
      )}
      <div className="dashboard-all-accounts-grid" aria-busy={loading}>
        {pageItems.map(({ id, platformId, render }) => (
          <article className="dashboard-all-accounts-item" key={`${platformId}:${id}`}>
            <h2 className="dashboard-all-accounts-platform">
              {renderPlatformIcon(platformId, 16)}
              {getPlatformLabel(platformId, t)}
            </h2>
            {render()}
          </article>
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <PaginationControls
          {...pagination}
          onPageSizeChange={setPageSize}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
        />
      )}
    </section>
  );
}
