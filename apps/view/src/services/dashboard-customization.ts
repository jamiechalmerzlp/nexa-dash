import type { Config } from '@dashdot/common';
import type { DefaultTheme } from 'styled-components';
import { darkTheme } from '../theme/theme';

export const allWidgetKeys = [
  'os',
  'cpu',
  'storage',
  'ram',
  'network',
  'gpu',
] as const;

export type WidgetKey = (typeof allWidgetKeys)[number];
export type ThemeColorKey = keyof typeof darkTheme.colors;
export type ThemeColorOverrides = Partial<Record<ThemeColorKey, string>>;

export type DashboardCustomizations = {
  dashboardName?: string;
  browserTitle?: string;
  visibleWidgets?: WidgetKey[];
  colors?: ThemeColorOverrides;
};

export const widgetLabels: Record<WidgetKey, string> = {
  os: 'Server',
  cpu: 'Processor',
  storage: 'Storage',
  ram: 'Memory',
  network: 'Network',
  gpu: 'Graphics',
};

export const themeColorLabels: { key: ThemeColorKey; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'surface', label: 'Glass Surface' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'cpuPrimary', label: 'CPU Chart' },
  { key: 'ramPrimary', label: 'RAM Chart' },
  { key: 'storagePrimary', label: 'Storage Chart' },
  { key: 'networkPrimary', label: 'Network Chart' },
  { key: 'gpuPrimary', label: 'GPU Chart' },
];

const DEFAULT_DASHBOARD_NAME = 'dash';

const trimValue = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const getDashboardName = (customizations?: DashboardCustomizations) =>
  trimValue(customizations?.dashboardName) ?? DEFAULT_DASHBOARD_NAME;

export const getBrowserTitle = (
  config?: Config,
  customizations?: DashboardCustomizations,
) => {
  const browserTitle = trimValue(customizations?.browserTitle);
  if (browserTitle) {
    return browserTitle;
  }

  if (trimValue(customizations?.dashboardName)) {
    return `${getDashboardName(customizations)}.`;
  }

  return config?.page_title ?? `${DEFAULT_DASHBOARD_NAME}.`;
};

export const getVisibleWidgets = (
  config?: Config,
  customizations?: DashboardCustomizations,
): WidgetKey[] => {
  const orderedWidgetKeys = [
    ...new Set([...(config?.widget_list ?? []), ...allWidgetKeys]),
  ] as WidgetKey[];

  if (customizations?.visibleWidgets) {
    return orderedWidgetKeys.filter((widget) =>
      customizations.visibleWidgets?.includes(widget),
    );
  }

  return (config?.widget_list ?? allWidgetKeys) as WidgetKey[];
};

export const applyDashboardCustomizations = (
  baseTheme: DefaultTheme,
  customizations?: DashboardCustomizations,
): DefaultTheme => ({
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    ...(customizations?.colors ?? {}),
  },
});
