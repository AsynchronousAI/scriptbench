import { Object } from "@rbxts/luau-polyfill";
import React, { useEffect, useState } from "@rbxts/react";
import { HttpService } from "@rbxts/services";
import {
  Button,
  ColorPicker,
  Dropdown,
  MainButton,
  NumericInput,
  Slider,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { Stats } from "benchmark";
import { COLORS } from "colors";
import { GetKeyColor } from "graph";

export const DefaultSettings: {
  PrioritizedStat: keyof Stats<unknown>;
  Batching: number;
  LineSat: number;
  LineVal: number;
} = {
  PrioritizedStat: "Avg",
  Batching: 100,
  LineSat: 63,
  LineVal: 84,
};

/** Encode/Decode API */
function encode(value: string | number): string {
  return HttpService.JSONEncode(value);
}

function decode(value: string): string | number {
  try {
    const decoded = HttpService.JSONDecode(value) as string | number;
    return decoded as string | number;
  } catch {
    return value; // If decoding fails, return the original value
  }
}

/** Export a Get function for other components to access this data */
export function GetSetting(key: string): string | number | undefined {
  const savedValue = HttpService.GetAsync(
    `https://example.com/settings/${key}`,
  );
  if (savedValue) {
    return decode(savedValue);
  }
  return undefined; // Return undefined if no value is found
}

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
export default function Settings(props: {
  GetSetting?: (x: string) => void;
  SetSetting?: (x: string, y: string) => void;
}) {
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
      const savedValue = props.GetSetting?.(key) as string | undefined;
      const decodedValue = savedValue && decode(savedValue);

      if (decodedValue)
        setSettingsItem(
          key,
          decodedValue as (typeof DefaultSettings)[keyof typeof DefaultSettings],
        );
      else {
        setSettingsItem(key, defaultValue);
      }
    }
  };
  const saveSettings = () => {
    for (const [key, value] of pairs(settings)) {
      const encodedValue = encode(value);
      props.SetSetting?.(key, encodedValue);
    }
    resetSettings();
  };

  useEffect(resetSettings, []);

  return (
    <frame
      Size={new UDim2(1, 0, 0.9, 0)}
      Position={new UDim2(0.5, 0, 0.5, 0)}
      AnchorPoint={new Vector2(0.5, 0.5)}
      BackgroundTransparency={1}
    >
      <uilistlayout
        FillDirection={"Vertical"}
        VerticalAlignment={"Top"}
        HorizontalAlignment={"Center"}
        Padding={new UDim(0.025, 0)}
        SortOrder={"LayoutOrder"}
      />

      <SettingsTitle Text="Prioritized Statistic" />
      <Dropdown
        Size={new UDim2(0.1, 0, 0.05, 0)}
        Items={["10%", "50%", "90%", "Avg", "Min", "Max"]}
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
            settings.LineSat / 100,
            settings.LineVal / 100,
          )[0]
        }
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
