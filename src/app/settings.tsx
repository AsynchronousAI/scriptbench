import React, { useEffect, useState } from "@rbxts/react";
import {
  Button,
  Dropdown,
  MainButton,
  NumericInput,
  ScrollFrame,
  Splitter,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import {
  DefaultSettings,
  Settings as SettingsType,
  useSetting,
} from "settings";
import { Settings as SettingsNamespace } from "settings";
import { TITLE_HEIGHT } from "configurations";
import Graph, { GraphingMode } from "./graph";
import { MockupGraphData } from "mockup";

const ROW_H = 28; // fixed height for all form rows
const LABEL_H = 22; // fixed height for section title labels

function SettingsTitle(props: { Text: string }) {
  return (
    <textlabel
      Size={new UDim2(1, 0, 0, LABEL_H)}
      RichText
      Text={`<b>${props.Text}</b>`}
      BackgroundTransparency={1}
      TextColor3={COLORS.FocusText}
      TextXAlignment="Left"
      Font={"BuilderSans"}
      TextScaled
    />
  );
}

function SettingsLabel(props: { Text: string }) {
  return (
    <textlabel
      Size={new UDim2(1, 0, 0, LABEL_H - 4)}
      Text={props.Text}
      BackgroundTransparency={1}
      TextColor3={COLORS.Text}
      TextXAlignment="Left"
      Font={"BuilderSans"}
      TextScaled
    />
  );
}

export default function Settings() {
  const [originalSettings, setOriginalSettings] = useState<
    Partial<SettingsType>
  >({});
  const [settings, setSettings] = useState(DefaultSettings);

  const setSettingsItem = (
    key: keyof typeof DefaultSettings,
    value: (typeof DefaultSettings)[keyof typeof DefaultSettings],
  ) => {
    SettingsNamespace.SetSetting(key, value);
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const resetSettings = () => {
    for (const [key, defaultValue] of pairs(DefaultSettings)) {
      const cacheValue = originalSettings[key];
      const savedValue = SettingsNamespace.GetSetting(key);
      const value =
        cacheValue ??
        (savedValue as SettingsType[keyof SettingsType]) ??
        defaultValue;
      setOriginalSettings((s) => ({ ...s, [key]: defaultValue }));
      setSettingsItem(key, value);
    }
    setOriginalSettings({});
  };

  const saveSettings = () => {
    for (const [key, value] of pairs(settings)) {
      SettingsNamespace.SetSetting(key, value);
    }
    setOriginalSettings({});
    resetSettings();
  };

  useEffect(() => {
    resetSettings();
    return () => resetSettings();
  }, []);

  const [alpha, setAlpha] = useSetting("SettingsRightPaneAlpha");

  return (
    <Splitter
      Size={new UDim2(1, 0, 1 - TITLE_HEIGHT * 2, 0)}
      Position={new UDim2(0, 0, TITLE_HEIGHT * 2, 0)}
      Alpha={alpha}
      FillDirection={Enum.FillDirection.Horizontal}
      OnChanged={setAlpha}
    >
      {{
        Side0: (
          <ScrollFrame
            Size={new UDim2(0.85, 0, 1, 0)}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Layout={{
              ClassName: "UIListLayout",
              HorizontalAlignment: Enum.HorizontalAlignment.Center,
              SortOrder: Enum.SortOrder.LayoutOrder,
              Padding: new UDim(0, 6),
            }}
          >
            <uipadding
              PaddingTop={new UDim(0, 10)}
              PaddingBottom={new UDim(0, 10)}
              PaddingLeft={new UDim(0, 12)}
              PaddingRight={new UDim(0, 12)}
            />

            <SettingsTitle Text="Prioritized Statistic" />
            <Dropdown
              Size={new UDim2(1, 0, 0, ROW_H)}
              Items={["10%", "50%", "90%", "Avg", "Min", "Max", "Mode"]}
              SelectedItem={settings.PrioritizedStat}
              OnItemSelected={(v) => setSettingsItem("PrioritizedStat", v)}
            />

            <SettingsTitle Text="Batching" />
            <NumericInput
              Size={new UDim2(1, 0, 0, ROW_H)}
              Value={settings.Batching}
              OnValidChanged={(v: number) => setSettingsItem("Batching", v)}
            />

            <SettingsTitle Text="Graph Rendering" />
            <Dropdown
              Size={new UDim2(1, 0, 0, ROW_H)}
              Items={["Steps", "Lines", "Spline"]}
              SelectedItem={settings.Rendering}
              OnItemSelected={(v) => setSettingsItem("Rendering", v)}
            />

            <SettingsTitle Text="Line Color" />
            <SettingsLabel Text="Hue" />
            <NumericInput
              Size={new UDim2(1, 0, 0, ROW_H)}
              Value={settings.LineHue}
              OnValidChanged={(v: number) => setSettingsItem("LineHue", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />
            <SettingsLabel Text="Saturation" />
            <NumericInput
              Size={new UDim2(1, 0, 0, ROW_H)}
              Value={settings.LineSat}
              OnValidChanged={(v: number) => setSettingsItem("LineSat", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />
            <SettingsLabel Text="Value" />
            <NumericInput
              Size={new UDim2(1, 0, 0, ROW_H)}
              Value={settings.LineVal}
              OnValidChanged={(v: number) => setSettingsItem("LineVal", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />

            <frame Size={new UDim2(1, 0, 0, ROW_H)} BackgroundTransparency={1}>
              <uilistlayout
                FillDirection="Horizontal"
                VerticalAlignment="Center"
                HorizontalAlignment="Center"
                Padding={new UDim(0, 8)}
              />
              <MainButton
                Text="Save"
                Size={new UDim2(0, 80, 1, 0)}
                OnActivated={saveSettings}
              />
              <Button
                Text="Cancel"
                Size={new UDim2(0, 80, 1, 0)}
                OnActivated={resetSettings}
              />
            </frame>
          </ScrollFrame>
        ),
        Side1: (
          <Graph
            Data={MockupGraphData}
            XPrefix="µs"
            Mode={GraphingMode[settings.Rendering]}
          />
        ),
      }}
    </Splitter>
  );
}
