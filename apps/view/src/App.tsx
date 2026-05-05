import { ConfigProvider } from 'antd';
import { type FC, useLayoutEffect, useMemo } from 'react';
import {
  createGlobalStyle,
  type DefaultTheme,
  ThemeProvider,
} from 'styled-components';
import { useColorScheme } from 'use-color-scheme';
import { MainWidgetContainer } from './components/main-widget-container';
import { SettingsPage } from './components/settings-page';
import { SingleWidgetChart } from './components/single-widget-chart';
import { isSettingsPath } from './services/app-routes';
import {
  applyDashboardCustomizations,
  type DashboardCustomizations,
  getBackgroundMode,
} from './services/dashboard-customization';
import { MobileContextProvider } from './services/mobile';
import { useQuery } from './services/query-params';
import { useSetting } from './services/settings';
import { darkTheme, lightTheme } from './theme/theme';

const getLightGradient = (theme: DefaultTheme) => `
radial-gradient(
  circle at 10% 10%,
  ${theme.colors.secondary}66 10%,
  transparent 10.2%
),
radial-gradient(circle at 10% 10%, #ffffff 10%, transparent 10.2%),
radial-gradient(
  circle at 90% 85%,
  ${theme.colors.primary}66 20%,
  transparent 20.2%
),
radial-gradient(circle at 90% 85%, white 20%, transparent 20.2%),
linear-gradient(
  200deg,
  ${theme.colors.primary} 0%,
  ${theme.colors.secondary} 60%
)`;

const getDarkGradient = (theme: DefaultTheme) => `
radial-gradient(
  circle at 10% 10%,
  ${theme.colors.primary} 10%,
  transparent 10.5%
),
radial-gradient(
  circle at 110% 90%,
  ${theme.colors.secondary} 30%,
  transparent 30.5%
),
linear-gradient(
  290deg,
  ${theme.colors.primary} 0%,
  ${theme.colors.secondary} 40%
)`;

const getAuroraGradient = (theme: DefaultTheme) => `
radial-gradient(
  circle at 18% 18%,
  ${theme.colors.primary}cc 0%,
  transparent 24%
),
radial-gradient(
  circle at 82% 12%,
  ${theme.colors.secondary}aa 0%,
  transparent 28%
),
radial-gradient(
  circle at 72% 78%,
  ${theme.colors.networkPrimary}99 0%,
  transparent 24%
),
linear-gradient(
  140deg,
  ${theme.colors.background} 0%,
  ${theme.colors.secondary} 46%,
  ${theme.colors.primary} 100%
)`;

const getStudioGradient = (theme: DefaultTheme) => `
linear-gradient(
  125deg,
  ${theme.colors.background} 0%,
  ${theme.colors.secondary} 42%,
  ${theme.colors.primary} 100%
),
radial-gradient(
  ellipse at top left,
  ${theme.colors.primary}88 0%,
  transparent 38%
),
radial-gradient(
  ellipse at bottom right,
  ${theme.colors.gpuPrimary}66 0%,
  transparent 42%
)`;

const getAppBackground = (
  theme: DefaultTheme,
  customizations: DashboardCustomizations,
) => {
  const backgroundMode = getBackgroundMode(customizations);
  const backgroundImage = customizations.backgroundImage?.trim();

  if (backgroundMode === 'image' && backgroundImage) {
    return {
      css: `linear-gradient(
        135deg,
        ${theme.colors.background}cc 0%,
        ${theme.colors.secondary}88 100%
      ), url("${backgroundImage}")`,
      size: 'cover',
      position: 'center center',
    };
  }

  if (backgroundMode === 'aurora') {
    return {
      css: getAuroraGradient(theme),
      size: 'auto',
      position: 'center center',
    };
  }

  if (backgroundMode === 'studio') {
    return {
      css: getStudioGradient(theme),
      size: 'auto',
      position: 'center center',
    };
  }

  return {
    css: theme.dark ? getDarkGradient(theme) : getLightGradient(theme),
    size: 'auto',
    position: 'center center',
  };
};

const GlobalStyle = createGlobalStyle<{
  noBg: boolean;
  $backgroundCss: string;
  $backgroundSize: string;
  $backgroundPosition: string;
}>`
  body {
    background-color: ${({ theme, noBg }) =>
      noBg ? 'transparent' : theme.colors.background};
    height: 100vh;
    width: 100vw;
  }

  #root {
    width: 100%;
    height: 100%;

    background-color: ${({ theme, noBg }) =>
      noBg ? 'transparent' : theme.colors.background};
    background-image: ${({ noBg, $backgroundCss }) =>
      noBg ? 'none' : $backgroundCss};
    background-size: ${({ noBg, $backgroundSize }) =>
      noBg ? 'auto' : $backgroundSize};
    background-position: ${({ noBg, $backgroundPosition }) =>
      noBg ? 'initial' : $backgroundPosition};
    background-repeat: no-repeat;

    transition: background 0.5s ease;
    background-attachment: fixed;
  }

  .ant-switch {
    background-color: rgba(0, 0, 0, 0.25);
    background-image: unset;
  }

  .ant-btn {
    background: ${({ theme }) => theme.colors.background};
    border: none;
  }
`;

const overrideColor = (
  colors: (typeof darkTheme)['colors'],
  query: ReturnType<typeof useQuery>,
) => {
  const nextColors = {
    ...colors,
  };

  if (query.singleWidget) {
    if (query.overrideThemeColor) {
      nextColors.cpuPrimary = `#${query.overrideThemeColor}`;
      nextColors.storagePrimary = `#${query.overrideThemeColor}`;
      nextColors.ramPrimary = `#${query.overrideThemeColor}`;
      nextColors.networkPrimary = `#${query.overrideThemeColor}`;
      nextColors.gpuPrimary = `#${query.overrideThemeColor}`;
      nextColors.primary = `#${query.overrideThemeColor}`;
    }

    if (query.overrideThemeSurface) {
      nextColors.surface = `#${query.overrideThemeSurface}`;
    }
  }

  return nextColors;
};

export const App: FC = () => {
  const { scheme } = useColorScheme();
  const [darkMode, setDarkMode] = useSetting('darkMode', scheme === 'dark');
  const [dashboardCustomizations, setDashboardCustomizations] = useSetting(
    'dashboardCustomizations',
    {} as DashboardCustomizations,
  );
  const query = useQuery();
  const settingsPage = isSettingsPath(window.location.pathname);

  const theme = useMemo(() => {
    const baseTheme = darkMode ? darkTheme : lightTheme;
    const customizedBaseTheme = applyDashboardCustomizations(
      baseTheme,
      dashboardCustomizations,
    );

    if (query.singleWidget) {
      const queryTheme = query.overrideTheme
        ? query.overrideTheme === 'dark'
          ? darkTheme
          : lightTheme
        : baseTheme;
      const customizedQueryTheme = applyDashboardCustomizations(
        queryTheme,
        dashboardCustomizations,
      );

      return {
        ...customizedQueryTheme,
        colors: overrideColor(customizedQueryTheme.colors, query),
      };
    }

    return customizedBaseTheme;
  }, [darkMode, dashboardCustomizations, query]);

  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme.dark ? 'dark' : 'light');
    }
  }, [theme.dark]);

  const appBackground = useMemo(
    () => getAppBackground(theme, dashboardCustomizations),
    [dashboardCustomizations, theme],
  );

  return (
    <ThemeProvider theme={theme}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: theme.colors.primary,
            colorPrimaryHover: theme.colors.primary,
          },
        }}
      >
        <MobileContextProvider>
          {settingsPage ? (
            <SettingsPage
              customizations={dashboardCustomizations}
              setCustomizations={setDashboardCustomizations}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          ) : query.singleWidget ? (
            <SingleWidgetChart />
          ) : (
            <MainWidgetContainer />
          )}
        </MobileContextProvider>
      </ConfigProvider>
      <GlobalStyle
        noBg={query.singleWidget}
        $backgroundCss={appBackground.css}
        $backgroundSize={appBackground.size}
        $backgroundPosition={appBackground.position}
      />
    </ThemeProvider>
  );
};
