const trimTrailingSlash = (pathname: string) => {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/+$/, '');
};

export const isSettingsPath = (pathname: string) =>
  trimTrailingSlash(pathname).endsWith('/settings');

export const getSettingsPath = (pathname: string) => {
  const trimmed = trimTrailingSlash(pathname);
  if (isSettingsPath(trimmed)) {
    return trimmed;
  }

  return trimmed === '/' ? '/settings' : `${trimmed}/settings`;
};

export const getDashboardPath = (pathname: string) => {
  const trimmed = trimTrailingSlash(pathname);

  if (!isSettingsPath(trimmed)) {
    return trimmed || '/';
  }

  const dashboardPath = trimmed.slice(0, -'/settings'.length);
  return dashboardPath === '' ? '/' : dashboardPath;
};
