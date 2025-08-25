import { createContext, useContext } from "@rbxts/react";
import { HttpService } from "@rbxts/services";
import PluginContext from "@rbxts/studiocomponents-react2/out/Contexts/PluginContext";
import { Stats } from "benchmark/types";

interface Settings {
  PrioritizedStat: keyof Stats<unknown>;
  Batching: number;
  LineHue: number;
  LineSat: number;
  LineVal: number;
  FilterOutliers: boolean;
  OutlierDivider: number;
}

export const DefaultSettings: Settings = {
  PrioritizedStat: "50%",
  Batching: 100,
  LineHue: 0,
  LineSat: 63,
  LineVal: 84,
  FilterOutliers: true,
  OutlierDivider: 700,
};

/* Access methods */
export namespace Settings {
  let plugin: Plugin | undefined;

  export function LoadPlugin(p: Plugin) {
    plugin = p;
  }

  export function SetSetting(
    key: keyof typeof DefaultSettings,
    value: (typeof DefaultSettings)[keyof typeof DefaultSettings],
  ) {
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
