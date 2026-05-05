import { faArrowLeft, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Switch } from 'antd';
import { type ChangeEvent, type Dispatch, type FC, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import styled, { useTheme } from 'styled-components';
import { getDashboardPath } from '../services/app-routes';
import {
  allWidgetKeys,
  backgroundModeLabels,
  type DashboardCustomizations,
  getBackgroundMode,
  getDashboardName,
  getVisibleWidgets,
  themeColorLabels,
  widgetLabels,
  type WidgetKey,
} from '../services/dashboard-customization';
import { useIsMobile } from '../services/mobile';
import { usePageData } from '../services/page-data';
import { GlassPane } from './glass-pane';
import { ThemedText } from './text';

const Page = styled.div<{ $mobile: boolean }>`
  min-height: 100vh;
  max-width: 1180px;
  margin: 0 auto;
  padding: ${({ $mobile }) => ($mobile ? '24px 18px 42px' : '48px 32px 64px')};
`;

const Header = styled.div<{ $mobile: boolean }>`
  display: flex;
  flex-direction: ${({ $mobile }) => ($mobile ? 'column' : 'row')};
  align-items: start;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Eyebrow = styled(ThemedText)`
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.78rem;
  opacity: 0.75;
`;

const Title = styled(ThemedText)`
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  line-height: 0.98;
  max-width: 13ch;
`;

const Subtitle = styled(ThemedText)`
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.84;
  max-width: 54ch;
`;

const Summary = styled.div<{ $mobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ $mobile }) =>
    $mobile ? '1fr' : 'repeat(2, minmax(0, 1fr))'};
  gap: 16px;
  margin-bottom: 22px;
`;

const SummaryCard = styled(GlassPane)`
  min-height: unset;
  max-height: unset;
  align-self: start;
`;

const SummaryContent = styled.div`
  width: 100%;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

const BodyGrid = styled.div<{ $mobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ $mobile }) =>
    $mobile ? '1fr' : 'minmax(0, 1.08fr) minmax(320px, 0.92fr)'};
  align-items: start;
  gap: 22px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Panel = styled(GlassPane)`
  min-height: unset;
  max-height: unset;
  align-self: start;
`;

const PanelContent = styled.div`
  width: 100%;
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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

const SelectInput = styled.select`
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

const FileInput = styled.input`
  width: 100%;
  border: 1px dashed ${({ theme }) => `${theme.colors.text}40`};
  background: ${({ theme }) => `${theme.colors.surface}55`};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 14px;
  padding: 12px 14px;
  font: inherit;
  cursor: pointer;

  &::file-selector-button {
    margin-right: 12px;
    padding: 6px 12px;
    border: 1px solid ${({ theme }) => `${theme.colors.text}33`};
    background: ${({ theme }) => `${theme.colors.surface}aa`};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    font: inherit;
    cursor: pointer;
  }
`;

const ResetRow = styled.div<{ $mobile: boolean }>`
  display: flex;
  flex-direction: ${({ $mobile }) => ($mobile ? 'column' : 'row')};
  gap: 10px;
  flex-wrap: wrap;
`;

const InlineActions = styled.div<{ $mobile: boolean }>`
  display: flex;
  flex-direction: ${({ $mobile }) => ($mobile ? 'column' : 'row')};
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled(Button)`
  height: 44px;
  border-radius: 12px;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
`;

const ToggleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
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

const PreviewCard = styled.div`
  border: 1px solid ${({ theme }) => `${theme.colors.text}1a`};
  background: ${({ theme }) => `${theme.colors.surface}66`};
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreviewLabel = styled(ThemedText)`
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.72;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BackdropPreview = styled.div`
  min-height: 150px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => `${theme.colors.text}14`};
  background:
    radial-gradient(
      circle at 18% 20%,
      ${({ theme }) => `${theme.colors.primary}cc`} 0%,
      transparent 24%
    ),
    linear-gradient(
      145deg,
      ${({ theme }) => theme.colors.background} 0%,
      ${({ theme }) => theme.colors.secondary} 52%,
      ${({ theme }) => theme.colors.primary} 100%
    );
  overflow: hidden;
  position: relative;
`;

const BackdropImage = styled(PreviewImage)`
  position: absolute;
  inset: 0;
`;

const BackdropOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    ${({ theme }) => `${theme.colors.background}bb`} 0%,
    ${({ theme }) => `${theme.colors.secondary}88`} 100%
  );
`;

const PreviewText = styled(ThemedText)`
  opacity: 0.78;
  line-height: 1.45;
  margin: 0;
`;

const readImageAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

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
  const { config } = usePageData();
  const visibleWidgets = getVisibleWidgets(config, customizations);
  const visibleWidgetCount = visibleWidgets.length;
  const backgroundMode = getBackgroundMode(customizations);

  useEffect(() => {
    document.title = `${getDashboardName(customizations)} settings`;
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

  const updateImageCustomization =
    (key: 'backgroundImage') =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file || !file.type.startsWith('image/')) {
        return;
      }

      const image = await readImageAsDataUrl(file);
      updateCustomizations({
        [key]: image,
      } as Partial<DashboardCustomizations>);
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
              current NexaDash setup.
            </Subtitle>
          </HeaderText>

          <InlineActions $mobile={isMobile}>
            <ActionButton
              icon={<FontAwesomeIcon icon={faArrowLeft} />}
              href={getDashboardPath(window.location.pathname)}
            >
              Back to dashboard
            </ActionButton>
            <ActionButton
              icon={<FontAwesomeIcon icon={faRotateLeft} />}
              onClick={() => setCustomizations({})}
            >
              Reset customizations
            </ActionButton>
          </InlineActions>
        </Header>

        <Summary $mobile={isMobile}>
          <SummaryCard grow={1} minWidth={220}>
            <SummaryContent>
              <SummaryLabel>Browser title</SummaryLabel>
              <SummaryValue>
                {customizations.browserTitle?.trim() || dashboardName}
              </SummaryValue>
            </SummaryContent>
          </SummaryCard>

          <SummaryCard grow={1} minWidth={220}>
            <SummaryContent>
              <SummaryLabel>Visible widgets</SummaryLabel>
              <SummaryValue>
                {visibleWidgetCount} of {allWidgetKeys.length}
              </SummaryValue>
            </SummaryContent>
          </SummaryCard>
        </Summary>

        <BodyGrid $mobile={isMobile}>
          <Column>
            <Panel grow={1} minWidth={320}>
              <PanelContent>
                <PanelHeader>
                  <PanelTitle>Branding</PanelTitle>
                  <PanelDescription>
                    Rename the dashboard and control the title shown in the
                    browser tab.
                  </PanelDescription>
                </PanelHeader>

                <Field>
                  <FieldLabel>Dashboard name</FieldLabel>
                  <TextInput
                    value={customizations.dashboardName ?? ''}
                    placeholder="NexaDash"
                    onChange={(event) =>
                      updateCustomizations({
                        dashboardName: event.target.value,
                      })
                    }
                  />
                  <FieldHint>
                    This replaces the default NexaDash label in the main server
                    card.
                  </FieldHint>
                </Field>

                <Field>
                  <FieldLabel>Browser title</FieldLabel>
                  <TextInput
                    value={customizations.browserTitle ?? ''}
                    placeholder={dashboardName}
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
                <PanelHeader>
                  <PanelTitle>Appearance</PanelTitle>
                  <PanelDescription>
                    Switch between light and dark mode, then fine-tune the
                    color palette that drives the glass panels and charts.
                  </PanelDescription>
                </PanelHeader>

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

                <Field>
                  <FieldLabel>Background style</FieldLabel>
                  <SelectInput
                    value={backgroundMode}
                    onChange={(event) =>
                      updateCustomizations({
                        backgroundMode: event.target.value as DashboardCustomizations['backgroundMode'],
                      })
                    }
                  >
                    {backgroundModeLabels.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </SelectInput>
                  <FieldHint>
                    {
                      backgroundModeLabels.find(
                        (mode) => mode.value === backgroundMode,
                      )?.description
                    }
                  </FieldHint>
                </Field>

                <PreviewCard>
                  <PreviewLabel>Background preview</PreviewLabel>
                  <BackdropPreview>
                    {backgroundMode === 'image' &&
                    customizations.backgroundImage ? (
                      <>
                        <BackdropImage
                          src={customizations.backgroundImage}
                          alt="Background preview"
                        />
                        <BackdropOverlay />
                      </>
                    ) : null}
                  </BackdropPreview>
                  <PreviewText>
                    {backgroundMode === 'image'
                      ? customizations.backgroundImage
                        ? 'Custom image mode uses your uploaded art with a tinted overlay so widgets stay readable.'
                        : 'Upload an image below to switch from the generated backdrop to your own background.'
                      : 'Generated modes keep the dashboard responsive and adapt naturally to your chosen color palette.'}
                  </PreviewText>
                </PreviewCard>

                <Field>
                  <FieldLabel>Background image</FieldLabel>
                  <FileInput
                    type="file"
                    accept="image/*"
                    onChange={updateImageCustomization('backgroundImage')}
                  />
                  <FieldHint>
                    This is only used when the background style is set to
                    Custom Image.
                  </FieldHint>
                </Field>

                <ColorGrid>
                  {themeColorLabels.map(({ key, label }) => {
                    const value =
                      customizations.colors?.[key] ?? theme.colors[key];

                    return (
                      <ColorField key={key}>
                        <ColorInput
                          type="color"
                          value={value}
                          onChange={(event) =>
                            updateColor(key)(event.target.value)
                          }
                        />
                        <ColorCopy>
                          <ColorName>{label}</ColorName>
                          <ColorValue>{value}</ColorValue>
                        </ColorCopy>
                      </ColorField>
                    );
                  })}
                </ColorGrid>

                <ResetRow $mobile={isMobile}>
                  <Button
                    icon={<FontAwesomeIcon icon={faRotateLeft} />}
                    onClick={() => {
                      const nextCustomizations = {
                        ...customizations,
                      };
                      delete nextCustomizations.backgroundImage;
                      if (nextCustomizations.backgroundMode === 'image') {
                        nextCustomizations.backgroundMode = 'theme';
                      }
                      setCustomizations(nextCustomizations);
                    }}
                  >
                    Use generated background
                  </Button>
                  <Button
                    icon={<FontAwesomeIcon icon={faRotateLeft} />}
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
                </ResetRow>
              </PanelContent>
            </Panel>
          </Column>

          <Column>
            <Panel grow={1} minWidth={320}>
              <PanelContent>
                <PanelHeader>
                  <PanelTitle>Quick Actions</PanelTitle>
                  <PanelDescription>
                    Jump back to the live dashboard or reset this browser's
                    customization layer without touching server config.
                  </PanelDescription>
                </PanelHeader>

                <InlineActions $mobile={isMobile}>
                  <ActionButton
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                    href={getDashboardPath(window.location.pathname)}
                  >
                    Back to dashboard
                  </ActionButton>
                  <ActionButton
                    icon={<FontAwesomeIcon icon={faRotateLeft} />}
                    onClick={() => setCustomizations({})}
                  >
                    Reset customizations
                  </ActionButton>
                </InlineActions>
              </PanelContent>
            </Panel>

            <Panel grow={1} minWidth={320}>
              <PanelContent>
                <PanelHeader>
                  <PanelTitle>Widgets</PanelTitle>
                  <PanelDescription>
                    Show or hide sections without changing the server-side widget
                    order.
                  </PanelDescription>
                </PanelHeader>

                <ToggleList>
                  {allWidgetKeys.map((widget) => (
                    <ToggleRow key={widget}>
                      <ToggleText>
                        <ToggleLabel>{widgetLabels[widget]}</ToggleLabel>
                        <ToggleHint>
                          {config?.widget_list.includes(widget)
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
          </Column>
        </BodyGrid>
      </Page>
    </SimpleBar>
  );
};
