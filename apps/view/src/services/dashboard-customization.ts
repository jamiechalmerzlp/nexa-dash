import type { Config } from '@nexadash/common';
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
export type BackgroundMode = 'theme' | 'aurora' | 'studio' | 'image';

export type DashboardCustomizations = {
  dashboardName?: string;
  browserTitle?: string;
  visibleWidgets?: WidgetKey[];
  colors?: ThemeColorOverrides;
  backgroundMode?: BackgroundMode;
  backgroundImage?: string;
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

export const backgroundModeLabels: {
  value: BackgroundMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'theme',
    label: 'Theme Glow',
    description: 'Uses the built-in animated glassmorphism backdrop.',
  },
  {
    value: 'aurora',
    label: 'Aurora',
    description: 'Adds a brighter layered neon wash behind the widgets.',
  },
  {
    value: 'studio',
    label: 'Studio',
    description: 'Uses sharper spotlight shapes for a moodier control room.',
  },
  {
    value: 'image',
    label: 'Custom Image',
    description: 'Displays an uploaded background image with a dark overlay.',
  },
];

const DEFAULT_DASHBOARD_NAME = 'NexaDash';

const trimValue = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const getDashboardName = (customizations?: DashboardCustomizations) =>
  trimValue(customizations?.dashboardName) ?? DEFAULT_DASHBOARD_NAME;

export const getBackgroundMode = (
  customizations?: DashboardCustomizations,
): BackgroundMode => customizations?.backgroundMode ?? 'theme';

export const getBrowserTitle = (
  config?: Config,
  customizations?: DashboardCustomizations,
) => {
  const browserTitle = trimValue(customizations?.browserTitle);
  if (browserTitle) {
    return browserTitle;
  }

  if (trimValue(customizations?.dashboardName)) {
    return getDashboardName(customizations);
  }

  return config?.page_title ?? DEFAULT_DASHBOARD_NAME;
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
