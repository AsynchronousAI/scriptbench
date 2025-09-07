import React, { useEffect, useState } from "@rbxts/react";
import {
  Button,
  Checkbox,
  Dropdown,
  MainButton,
  NumericInput,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS, GetKeyColor } from "colors";
import { DefaultSettings } from "settings";
import { usePx } from "hooks/usePx";
import { Settings as SettingsNamespace } from "settings";

/* Components */
function SettingsTitle(props: { Text: string }) {
  return (
    <textlabel
      Size={new UDim2(1, 0, 0.0325, 0)}
      RichText
      Text={`<b>${props.Text}:</b>`}
      BackgroundTransparency={1}
      TextColor3={COLORS.FocusText}
      TextScaled
      Font={"BuilderSans"}
    />
  );
}
function SettingsSubTitle(props: { Text: string }) {
  return (
    <textlabel
      Size={new UDim2(1, 0, 0.02, 0)}
      RichText
      Text={`${props.Text}`}
      BackgroundTransparency={1}
      TextColor3={COLORS.Text}
      TextScaled
      Font={"BuilderSans"}
    />
  );
}

/* Main UI */
export default function Settings() {
  const px = usePx();
  const [colorPreviewIndex, setColorPreviewIndex] = useState(1);
  const [settings, setSettings] = useState(DefaultSettings);

  const setSettingsItem = (
    key: keyof typeof DefaultSettings,
    value: (typeof DefaultSettings)[keyof typeof DefaultSettings],
  ) => {
    setSettings((settings) => {
      return { ...settings, [key]: value };
    });
  };
  const resetSettings = () => {
    for (const [key, defaultValue] of pairs(DefaultSettings)) {
      const savedValue = SettingsNamespace.GetSetting(key);

      if (savedValue)
        setSettingsItem(
          key,
          savedValue as (typeof DefaultSettings)[keyof typeof DefaultSettings],
        );
      else {
        setSettingsItem(key, defaultValue);
      }
    }
  };
  const saveSettings = () => {
    for (const [key, value] of pairs(settings)) {
      SettingsNamespace.SetSetting(key, value);
    }
    resetSettings();
  };

  useEffect(resetSettings, []);

  return (
    <frame
      Size={new UDim2(1, 0, 0.95, 0)}
      Position={new UDim2(0.5, 0, 0.55, 0)}
      AnchorPoint={new Vector2(0.5, 0.5)}
      BackgroundTransparency={1}
    >
      <uilistlayout
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        SortOrder={Enum.SortOrder.LayoutOrder}
        Padding={new UDim(0, px(10))}
      />

      <SettingsTitle Text="Prioritized Statistic" />
      <Dropdown
        Size={new UDim2(0.1, 0, 0.05, 0)}
        Items={["10%", "50%", "90%", "Avg", "Min", "Max", "Mode"]}
        SelectedItem={settings.PrioritizedStat}
        OnItemSelected={(v) => setSettingsItem("PrioritizedStat", v)}
      />

      <SettingsTitle Text="Batching" />
      <SettingsSubTitle Text="How many calls to run per frame" />
      <NumericInput
        Size={new UDim2(0.1, 0, 0.05, 0)}
        Value={settings.Batching}
        OnValidChanged={(v: number) => setSettingsItem("Batching", v)}
      />

      <SettingsTitle Text="Graphics Rendering" />
      <SettingsSubTitle Text="How is rendering done, Steps has best performance." />
      <Dropdown
        Size={new UDim2(0.1, 0, 0.05, 0)}
        Items={["Steps", "Lines", "Spline"]}
        SelectedItem={"Steps"}
        OnItemSelected={print}
      />

      <SettingsTitle Text="Line Color" />

      <SettingsSubTitle Text="Saturation" />
      <NumericInput
        Size={new UDim2(0.3, 0, 0.05, 0)}
        Value={settings.LineSat}
        OnValidChanged={(v: number) => setSettingsItem("LineSat", v)}
        Min={0}
        Max={100}
        Step={1}
        Slider
      />
      <SettingsSubTitle Text="Value" />
      <NumericInput
        Size={new UDim2(0.3, 0, 0.05, 0)}
        Value={settings.LineVal}
        OnValidChanged={(v: number) => setSettingsItem("LineVal", v)}
        Min={0}
        Max={100}
        Step={1}
        Slider
      />
      <SettingsSubTitle Text="Test" />

      <NumericInput
        Value={colorPreviewIndex}
        Size={new UDim2(0.2, 0, 0.05, 0)}
        Arrows
        PlaceholderText="Try color from names"
        OnValidChanged={(v: number) => setColorPreviewIndex(v)}
      />
      <textlabel
        Text={`<b>Preview Text</b>`}
        RichText
        TextColor3={GetKeyColor(
          colorPreviewIndex,
          settings.LineSat / 100,
          settings.LineVal / 100,
        )}
        Font="Code"
        TextScaled
        BackgroundTransparency={1}
        Size={new UDim2(0.3, 0, 0.025, 0)}
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
          Size={new UDim2(0.1, 0, 1, 0)}
          OnActivated={saveSettings}
        />
        <Button
          Text="Cancel"
          Size={new UDim2(0.1, 0, 1, 0)}
          OnActivated={resetSettings}
        />
      </frame>
    </frame>
  );
}
