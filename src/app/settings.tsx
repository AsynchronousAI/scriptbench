import React, { useEffect, useState } from "@rbxts/react";
import {
  Button,
  Checkbox,
  Dropdown,
  MainButton,
  NumericInput,
  ScrollFrame,
  Splitter,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS, GetKeyColor } from "colors";
import {
  DefaultSettings,
  Settings as SettingsType,
  useSetting,
} from "settings";
import { usePx } from "hooks/usePx";
import { Settings as SettingsNamespace } from "settings";
import { TITLE_HEIGHT } from "configurations";
import Graph, { GraphingMode } from "./graph";
import { MockupGraphData } from "mockup";

/* Components */
function SettingsTitle(props: { Text: string }) {
  const px = usePx();
  return (
    <textlabel
      Size={new UDim2(1, 0, 0.05, 0)}
      RichText
      Text={`<b>${props.Text}:</b>`}
      BackgroundTransparency={1}
      TextColor3={COLORS.FocusText}
      TextYAlignment={"Bottom"}
      Font={"BuilderSans"}
      TextSize={px(18)}
    />
  );
}

/* Main UI */
export default function Settings() {
  const px = usePx();

  const [originalSettings, setOriginalSettings] = useState<
    Partial<SettingsType>
  >({});
  const [settings, setSettings] = useState(DefaultSettings);

  const setSettingsItem = (
    key: keyof typeof DefaultSettings,
    value: (typeof DefaultSettings)[keyof typeof DefaultSettings],
  ) => {
    SettingsNamespace.SetSetting(key, value);
    setSettings((settings) => {
      return { ...settings, [key]: value };
    });
  };
  const resetSettings = () => {
    for (const [key, defaultValue] of pairs(DefaultSettings)) {
      const cacheValue = originalSettings[key];
      const savedValue = SettingsNamespace.GetSetting(key);

      let value;
      if (cacheValue) {
        value = cacheValue;
      } else if (savedValue) {
        value = savedValue as SettingsType[keyof SettingsType];
      } else {
        value = defaultValue;
      }

      setOriginalSettings((originalSettings) => ({
        ...originalSettings,
        [key]: defaultValue,
      }));
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
    resetSettings(); // on mount
    return () => {
      resetSettings(); // on unmount
    };
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
            Size={new UDim2(1, 0, 1, 0)}
            Layout={{
              ClassName: "UIListLayout",
              HorizontalAlignment: Enum.HorizontalAlignment.Center,
              SortOrder: Enum.SortOrder.LayoutOrder,
              Padding: new UDim(0, px(10)),
            }}
          >
            <SettingsTitle Text="Prioritized Statistic" />
            <Dropdown
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Items={["10%", "50%", "90%", "Avg", "Min", "Max", "Mode"]}
              SelectedItem={settings.PrioritizedStat}
              OnItemSelected={(v) => setSettingsItem("PrioritizedStat", v)}
            />

            <SettingsTitle Text="Batching" />
            <NumericInput
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Value={settings.Batching}
              OnValidChanged={(v: number) => setSettingsItem("Batching", v)}
            />

            <SettingsTitle Text="Graph Rendering" />
            <Dropdown
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Items={["Steps", "Lines", "Spline"]}
              SelectedItem={settings.Rendering}
              OnItemSelected={(v) => setSettingsItem("Rendering", v)}
            />

            <SettingsTitle Text="Line Color" />
            <NumericInput
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Value={settings.LineHue}
              OnValidChanged={(v: number) => setSettingsItem("LineHue", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />
            <NumericInput
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Value={settings.LineSat}
              OnValidChanged={(v: number) => setSettingsItem("LineSat", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />
            <NumericInput
              Size={new UDim2(0.65, 0, 0.05, 0)}
              Value={settings.LineVal}
              OnValidChanged={(v: number) => setSettingsItem("LineVal", v)}
              Min={0}
              Max={100}
              Step={1}
              Slider
            />

            {/* Bottom bar with Save + Cancel */}
            <frame
              Size={new UDim2(1, 0, 0.05, 0)}
              Position={new UDim2(0.5, 0, 0.5, 0)}
              AnchorPoint={new Vector2(0.5, 0.5)}
              BackgroundTransparency={1}
            >
              <uilistlayout
                FillDirection={"Horizontal"}
                VerticalAlignment={"Center"}
                HorizontalAlignment={"Center"}
                Padding={new UDim(0.025, 0)}
              />
              <MainButton
                Text="Save"
                Size={new UDim2(0.3, 0, 1, 0)}
                OnActivated={saveSettings}
              />
              <Button
                Text="Cancel"
                Size={new UDim2(0.3, 0, 1, 0)}
                OnActivated={resetSettings}
              />
            </frame>
          </ScrollFrame>
        ),
        Side1: (
          <Graph
            Data={MockupGraphData}
            Mode={GraphingMode[settings.Rendering]}
          />
        ),
      }}
    </Splitter>
  );
}
