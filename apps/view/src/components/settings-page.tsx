import { faArrowLeft, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Switch } from 'antd';
import { type Dispatch, type FC, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import styled, { useTheme } from 'styled-components';
import { getDashboardPath } from '../services/app-routes';
import {
  allWidgetKeys,
  type DashboardCustomizations,
  getDashboardName,
  getVisibleWidgets,
  themeColorLabels,
  widgetLabels,
  type WidgetKey,
} from '../services/dashboard-customization';
import { useIsMobile } from '../services/mobile';
import { usePageData } from '../services/page-data';
import { ErrorWidget } from '../widgets/error';
import { GlassPane } from './glass-pane';
import { ThemedText } from './text';

const Page = styled.div<{ $mobile: boolean }>`
  min-height: 100vh;
  padding: ${({ $mobile }) => ($mobile ? '32px 20px' : '56px 4vw')};
`;

const Header = styled.div<{ $mobile: boolean }>`
  display: flex;
  flex-direction: ${({ $mobile }) => ($mobile ? 'column' : 'row')};
  align-items: ${({ $mobile }) => ($mobile ? 'stretch' : 'center')};
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Eyebrow = styled(ThemedText)`
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.78rem;
  opacity: 0.75;
`;

const Title = styled(ThemedText)`
  font-size: clamp(2rem, 3vw, 3.4rem);
  font-weight: 800;
  line-height: 0.95;
`;

const Subtitle = styled(ThemedText)`
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.92;
  max-width: 640px;
`;

const Summary = styled.div<{ $mobile: boolean }>`
  display: grid;
  grid-template-columns: repeat(${({ $mobile }) => ($mobile ? 1 : 2)}, 1fr);
  gap: 18px;
  margin-bottom: 24px;
`;

const SummaryCard = styled(GlassPane)`
  min-height: unset;
  max-height: unset;
`;

const SummaryContent = styled.div`
  width: 100%;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryLabel = styled(ThemedText)`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
`;

const SummaryValue = styled(ThemedText)`
  font-size: 1.3rem;
  font-weight: 700;
`;

const Grid = styled.div<{ $mobile: boolean }>`
  display: grid;
  grid-template-columns: repeat(${({ $mobile }) => ($mobile ? 1 : 2)}, 1fr);
  gap: 24px;
`;

const Panel = styled(GlassPane)`
  min-height: unset;
  max-height: unset;
`;

const PanelContent = styled.div`
  width: 100%;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const PanelTitle = styled(ThemedText)`
  font-size: 1.35rem;
  font-weight: 700;
`;

const PanelDescription = styled(ThemedText)`
  line-height: 1.5;
  opacity: 0.8;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldLabel = styled(ThemedText)`
  font-size: 0.94rem;
  font-weight: 700;
`;

const FieldHint = styled(ThemedText)`
  line-height: 1.45;
  opacity: 0.75;
`;

const TextInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => `${theme.colors.text}26`};
  background: ${({ theme }) => `${theme.colors.surface}99`};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 14px;
  padding: 14px 16px;
  font: inherit;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}26`};
  }
`;

const InlineActions = styled.div<{ $mobile: boolean }>`
  display: flex;
  flex-direction: ${({ $mobile }) => ($mobile ? 'column' : 'row')};
  gap: 12px;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
`;

const ToggleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ToggleLabel = styled(ThemedText)`
  font-weight: 700;
`;

const ToggleHint = styled(ThemedText)`
  opacity: 0.75;
  line-height: 1.4;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
`;

const ColorField = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ theme }) => `${theme.colors.text}1a`};
  background: ${({ theme }) => `${theme.colors.surface}66`};
  border-radius: 16px;
  padding: 12px 14px;
`;

const ColorInput = styled.input`
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const ColorCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ColorName = styled(ThemedText)`
  font-weight: 700;
`;

const ColorValue = styled(ThemedText)`
  opacity: 0.7;
  text-transform: uppercase;
`;

type SettingsPageProps = {
  customizations: DashboardCustomizations;
  setCustomizations: Dispatch<DashboardCustomizations>;
  darkMode: boolean;
  setDarkMode: Dispatch<boolean>;
};

export const SettingsPage: FC<SettingsPageProps> = ({
  customizations,
  setCustomizations,
  darkMode,
  setDarkMode,
}) => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const { pageLoaded, error, config } = usePageData();
  const visibleWidgets = getVisibleWidgets(config, customizations);
  const visibleWidgetCount = visibleWidgets.length;

  useEffect(() => {
    document.title = `${getDashboardName(customizations)}. settings`;
  }, [customizations]);

  const updateCustomizations = (next: Partial<DashboardCustomizations>) => {
    setCustomizations({
      ...customizations,
      ...next,
    });
  };

  const updateColor = (key: keyof NonNullable<DashboardCustomizations['colors']>) => {
    return (value: string) => {
      updateCustomizations({
        colors: {
          ...(customizations.colors ?? {}),
          [key]: value,
        },
      });
    };
  };

  const toggleWidget = (widget: WidgetKey, enabled: boolean) => {
    const widgetOrder = [
      ...new Set([...(config?.widget_list ?? []), ...allWidgetKeys]),
    ] as WidgetKey[];
    const nextWidgets = enabled
      ? Array.from(new Set([...visibleWidgets, widget]))
      : visibleWidgets.filter((currentWidget) => currentWidget !== widget);

    updateCustomizations({
      visibleWidgets: widgetOrder.filter((key) => nextWidgets.includes(key)),
    });
  };

  if (error) {
    return (
      <SimpleBar style={{ height: '100%' }}>
        <Page $mobile={isMobile}>
          <Header $mobile={isMobile}>
            <Button
              icon={<FontAwesomeIcon icon={faArrowLeft} />}
              href={getDashboardPath(window.location.pathname)}
            >
              Back to dashboard
            </Button>
          </Header>
          <Panel grow={0} minWidth={420}>
            <PanelContent>
              <ErrorWidget errorText={error.text} />
            </PanelContent>
          </Panel>
        </Page>
      </SimpleBar>
    );
  }

  if (!pageLoaded || !config) {
    return null;
  }

  const dashboardName = getDashboardName(customizations);

  return (
    <SimpleBar style={{ height: '100%' }}>
      <Page $mobile={isMobile}>
        <Header $mobile={isMobile}>
          <HeaderText>
            <Eyebrow>Local Customization</Eyebrow>
            <Title>{dashboardName} control room</Title>
            <Subtitle>
              Personalize the dashboard without touching the server config.
              These settings stay in this browser and layer on top of the
              current Nexa Dash setup.
            </Subtitle>
          </HeaderText>

          <InlineActions $mobile={isMobile}>
            <Button
              icon={<FontAwesomeIcon icon={faArrowLeft} />}
              href={getDashboardPath(window.location.pathname)}
            >
              Back to dashboard
            </Button>
            <Button
              icon={<FontAwesomeIcon icon={faRotateLeft} />}
              onClick={() => setCustomizations({})}
            >
              Reset customizations
            </Button>
          </InlineActions>
        </Header>

        <Summary $mobile={isMobile}>
          <SummaryCard grow={1} minWidth={260}>
            <SummaryContent>
              <SummaryLabel>Browser title</SummaryLabel>
              <SummaryValue>
                {customizations.browserTitle?.trim() || `${dashboardName}.`}
              </SummaryValue>
            </SummaryContent>
          </SummaryCard>

          <SummaryCard grow={1} minWidth={260}>
            <SummaryContent>
              <SummaryLabel>Visible widgets</SummaryLabel>
              <SummaryValue>
                {visibleWidgetCount} of {allWidgetKeys.length}
              </SummaryValue>
            </SummaryContent>
          </SummaryCard>
        </Summary>

        <Grid $mobile={isMobile}>
          <Panel grow={1} minWidth={320}>
            <PanelContent>
              <div>
                <PanelTitle>Branding</PanelTitle>
                <PanelDescription>
                  Rename the dashboard and control the title shown in the
                  browser tab.
                </PanelDescription>
              </div>

              <Field>
                <FieldLabel>Dashboard name</FieldLabel>
                <TextInput
                  value={customizations.dashboardName ?? ''}
                  placeholder="dash"
                  onChange={(event) =>
                    updateCustomizations({
                      dashboardName: event.target.value,
                    })
                  }
                />
                <FieldHint>
                  This replaces the hard-coded dash label in the main server
                  card.
                </FieldHint>
              </Field>

              <Field>
                <FieldLabel>Browser title</FieldLabel>
                <TextInput
                  value={customizations.browserTitle ?? ''}
                  placeholder={`${dashboardName}.`}
                  onChange={(event) =>
                    updateCustomizations({
                      browserTitle: event.target.value,
                    })
                  }
                />
                <FieldHint>
                  Leave this blank to derive it from the dashboard name.
                </FieldHint>
              </Field>
            </PanelContent>
          </Panel>

          <Panel grow={1} minWidth={320}>
            <PanelContent>
              <div>
                <PanelTitle>Appearance</PanelTitle>
                <PanelDescription>
                  Switch between light and dark mode, then fine-tune the color
                  palette that drives the glass panels and charts.
                </PanelDescription>
              </div>

              <ToggleRow>
                <ToggleText>
                  <ToggleLabel>Dark mode</ToggleLabel>
                  <ToggleHint>
                    Uses the same toggle the dashboard already exposes on the
                    server widget.
                  </ToggleHint>
                </ToggleText>
                <Switch
                  checked={darkMode}
                  onChange={(checked) => setDarkMode(checked)}
                />
              </ToggleRow>

              <ColorGrid>
                {themeColorLabels.map(({ key, label }) => {
                  const value = customizations.colors?.[key] ?? theme.colors[key];

                  return (
                    <ColorField key={key}>
                      <ColorInput
                        type="color"
                        value={value}
                        onChange={(event) => updateColor(key)(event.target.value)}
                      />
                      <ColorCopy>
                        <ColorName>{label}</ColorName>
                        <ColorValue>{value}</ColorValue>
                      </ColorCopy>
                    </ColorField>
                  );
                })}
              </ColorGrid>

              <Button
                onClick={() => {
                  const nextCustomizations = {
                    ...customizations,
                  };
                  delete nextCustomizations.colors;
                  setCustomizations(nextCustomizations);
                }}
              >
                Use default palette
              </Button>
            </PanelContent>
          </Panel>

          <Panel grow={1} minWidth={320}>
            <PanelContent>
              <div>
                <PanelTitle>Widgets</PanelTitle>
                <PanelDescription>
                  Show or hide sections without changing the server-side widget
                  order.
                </PanelDescription>
              </div>

              <ToggleList>
                {allWidgetKeys.map((widget) => (
                  <ToggleRow key={widget}>
                    <ToggleText>
                      <ToggleLabel>{widgetLabels[widget]}</ToggleLabel>
                      <ToggleHint>
                        {config.widget_list.includes(widget)
                          ? 'Included by the current server configuration.'
                          : 'Available as a client-side override.'}
                      </ToggleHint>
                    </ToggleText>
                    <Switch
                      checked={visibleWidgets.includes(widget)}
                      onChange={(checked) => toggleWidget(widget, checked)}
                    />
                  </ToggleRow>
                ))}
              </ToggleList>
            </PanelContent>
          </Panel>

          <Panel grow={1} minWidth={320}>
            <PanelContent>
              <div>
                <PanelTitle>What this changes</PanelTitle>
                <PanelDescription>
                  This first pass is focused on the personalization layer you
                  described: naming, palette, and widget visibility. It keeps
                  the existing graphs and server-fed data intact while making
                  the surface configurable.
                </PanelDescription>
              </div>

              <ToggleList>
                <ToggleRow>
                  <ToggleText>
                    <ToggleLabel>Stored locally</ToggleLabel>
                    <ToggleHint>
                      Each browser can keep its own layout and color choices.
                    </ToggleHint>
                  </ToggleText>
                </ToggleRow>
                <ToggleRow>
                  <ToggleText>
                    <ToggleLabel>Safe defaulting</ToggleLabel>
                    <ToggleHint>
                      If you clear a value, Nexa Dash falls back to its current
                      server config.
                    </ToggleHint>
                  </ToggleText>
                </ToggleRow>
                <ToggleRow>
                  <ToggleText>
                    <ToggleLabel>Ready to expand</ToggleLabel>
                    <ToggleHint>
                      This structure can grow into per-widget options, reordering,
                      and fuller page config later.
                    </ToggleHint>
                  </ToggleText>
                </ToggleRow>
              </ToggleList>
            </PanelContent>
          </Panel>
        </Grid>
      </Page>
    </SimpleBar>
  );
};
