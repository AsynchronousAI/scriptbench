import React, { useEffect, useState } from "@rbxts/react";
import {
  Button,
  Checkbox,
  Dropdown,
  MainButton,
  NumericInput,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import { GetKeyColor } from "./graph/computation";
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
  const [colorPreviewText, setColorPreviewText] = useState("Hello, World!");
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

      <SettingsTitle Text="Line Color" />
      <SettingsSubTitle Text="Hue Offset" />
      <NumericInput
        Size={new UDim2(0.3, 0, 0.05, 0)}
        Value={settings.LineHue}
        OnValidChanged={(v: number) => setSettingsItem("LineHue", v)}
        Min={0}
        Max={360}
        Step={1}
        Slider
      />
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

      <TextInput
        Text={colorPreviewText}
        Size={new UDim2(0.3, 0, 0.025, 0)}
        PlaceholderText="Try color from names"
        OnChanged={(v: string) => setColorPreviewText(v)}
      />
      <textlabel
        Text={`<b>${colorPreviewText}</b>`}
        RichText
        TextColor3={
          GetKeyColor(
            colorPreviewText,
            settings.LineHue / 100,
            settings.LineSat / 100,
            settings.LineVal / 100,
          )[0]
        }
        Font="Code"
        TextScaled
        BackgroundTransparency={1}
        Size={new UDim2(0.3, 0, 0.025, 0)}
      />
      {/*
      <SettingsTitle Text="Additional Settings" />
      <Checkbox
        Label="Filter outliers? (reccomended)"
        Value={settings.FilterOutliers}
        ContentAlignment={Enum.HorizontalAlignment.Center}
        OnChanged={() => {
          setSettings((previousSettings) => ({
            ...previousSettings,
            FilterOutliers: !previousSettings.FilterOutliers,
          }));
        }}
      />*/}

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
