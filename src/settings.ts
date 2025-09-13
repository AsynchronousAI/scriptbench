import { createContext, useContext, useState } from "@rbxts/react";
import { HttpService } from "@rbxts/services";
import { Stats } from "benchmark/types";
import {
  MICROPROFILER_HEIGHT,
  RESULTS_WIDTH,
  SIDEBAR_WIDTH,
} from "configurations";

export interface Settings {
  PrioritizedStat: keyof Stats<unknown>;
  Batching: number;
  LineHue: number;
  LineSat: number;
  LineVal: number;
  FilterOutliers: boolean;
  OutlierDivider: number;
  Rendering: "Lines" | "Steps" | "Spline";

  /* Panes */
  RightPaneAlpha: number;
  SettingsRightPaneAlpha: number;
  BottomPaneAlpha: number;
  SideBarPaneAlpha: number;
}

export const DefaultSettings: Settings = {
  PrioritizedStat: "50%",
  Batching: 1250,
  LineHue: 0,
  LineSat: 63,
  LineVal: 84,
  FilterOutliers: true,
  OutlierDivider: 700,
  Rendering: "Steps",

  RightPaneAlpha: RESULTS_WIDTH,
  SettingsRightPaneAlpha: RESULTS_WIDTH * 1.5,
  BottomPaneAlpha: 1 - MICROPROFILER_HEIGHT,
  SideBarPaneAlpha: SIDEBAR_WIDTH,
};

/* Access methods */
export namespace Settings {
  let plugin: Plugin | undefined;
  let cache = new Map<keyof Settings, Settings[keyof Settings]>();

  export function LoadPlugin(p: Plugin) {
    plugin = p;
    cache.clear();
  }

  export function SetSetting(
    key: keyof typeof DefaultSettings,
    value: (typeof DefaultSettings)[keyof typeof DefaultSettings],
  ) {
    cache.set(key, value);
    if (!plugin) return;

    let encoded: string;

    if (typeIs(value, "boolean")) {
      encoded =
        tostring(
          value,
        ); /* JSONEncode for a boolean returns a boolean?.., luckily Decode works fine */
    } else {
      encoded = HttpService.JSONEncode(value);
    }

    plugin.SetSetting(key, encoded);
  }

  export function GetSetting<T extends keyof Settings>(key: T): Settings[T] {
    if (cache.has(key)) return cache.get(key) as Settings[T];
    if (!plugin) return DefaultSettings[key];

    const value = plugin.GetSetting(key) as string;
    try {
      const decoded = HttpService.JSONDecode(value) as string | number;
      return decoded as Settings[T];
    } catch {
      return DefaultSettings[key];
    }
  }
}

/* Access within React */
export function useSetting<T extends keyof Settings>(
  key: T,
): [Settings[T], (newValue: Settings[T]) => void] {
  const [value, setValue] = useState(Settings.GetSetting(key));

  return [
    value,
    (newValue) => {
      Settings.SetSetting(key, newValue);
      setValue(newValue);
    },
  ];
}
