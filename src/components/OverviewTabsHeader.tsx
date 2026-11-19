import { PlatformWorkspaceHeader } from './platform/PlatformWorkspaceHeader';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlarmClock, BarChart3, Layers, ShieldCheck } from 'lucide-react';
import { Page } from '../types/navigation';
import { ManualHelpIconButton } from './ManualHelpIconButton';
import { AntigravityInstalledVersionBadge } from './AntigravityInstalledVersionBadge';
import { PlatformId } from '../types/platform';
import {
  findGroupByPlatform,
  resolveGroupChildName,
  usePlatformLayoutStore,
} from '../stores/usePlatformLayoutStore';
import { getPlatformLabel, renderPlatformIcon } from '../utils/platformMeta';
import { PlatformGroupSwitcher } from './platform/PlatformGroupSwitcher';

interface OverviewTabsHeaderProps {
  active: Page;
  onNavigate?: (page: Page) => void;
  subtitle: string;
  title?: string;
  onOpenManual?: () => void;
}

interface TabSpec {
  key: Page;
  label: string;
  icon: ReactNode;
}

export function OverviewTabsHeader({
  active,
  onNavigate,
  subtitle,
  title,
  onOpenManual,
}: OverviewTabsHeaderProps) {
  const { t } = useTranslation();
  const { platformGroups } = usePlatformLayoutStore();
  const currentPlatformId: PlatformId = 'antigravity';
  const currentGroup = useMemo(
    () => findGroupByPlatform(platformGroups, currentPlatformId),
    [platformGroups, currentPlatformId],
  );
  const switchablePlatforms = currentGroup ? currentGroup.platformIds : [currentPlatformId];
  const currentPlatformLabel = getPlatformLabel(currentPlatformId, t);
  const currentDisplayName = useMemo(
    () =>
      title
        ? title
        : currentGroup
          ? resolveGroupChildName(currentGroup, currentPlatformId, currentPlatformLabel)
          : currentPlatformLabel,
    [title, currentGroup, currentPlatformId, currentPlatformLabel],
  );
  const switchOptions = useMemo(
    () =>
      switchablePlatforms.map((platformId) => ({
        platformId,
        label: currentGroup
          ? resolveGroupChildName(currentGroup, platformId, getPlatformLabel(platformId, t))
          : getPlatformLabel(platformId, t),
      })),
    [switchablePlatforms, currentGroup, t],
  );
  const tabs: TabSpec[] = [
    {
      key: 'overview',
      label: t('overview.title'),
      icon: <span className="tab-icon">{renderPlatformIcon(currentPlatformId, 16)}</span>,
    },
    {
      key: 'antigravity-usage',
      label: t('antigravityTokenUsage.tab', 'Session Usage'),
      icon: <BarChart3 className="tab-icon" />,
    },
    {
      key: 'instances',
      label: t('instances.title', '应用多开'),
      icon: <Layers className="tab-icon" />,
    },
    {
      key: 'wakeup',
      label: t('wakeup.title'),
      icon: <AlarmClock className="tab-icon" />,
    },
    {
      key: 'verification',
      label: t('wakeup.verification.title'),
      icon: <ShieldCheck className="tab-icon" />,
    },
  ];

  const activeTab = tabs.find((tab) => tab.key === active);
  return (
    <PlatformWorkspaceHeader
      identity={(
        <PlatformGroupSwitcher
          currentPlatformId={currentPlatformId}
          currentLabel={currentDisplayName}
          options={switchOptions}
          currentGroupId={currentGroup?.id ?? null}
        />
      )}
      title={activeTab?.label ?? currentDisplayName}
      subtitle={subtitle}
      help={<ManualHelpIconButton className="platform-workspace-help" onClick={onOpenManual} />}
      status={<AntigravityInstalledVersionBadge />}
      tabsLabel={currentDisplayName}
      tabs={tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={'platform-workspace-tab' + (active === tab.key ? ' active' : '')}
          aria-current={active === tab.key ? 'page' : undefined}
          onClick={() => onNavigate?.(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    />
  );
}
