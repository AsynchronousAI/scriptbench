import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { HttpService, RunService } from "@rbxts/services";
import { PluginProvider } from "@rbxts/studiocomponents-react2";
import App from "app";
import { DefaultSettings } from "app/settings";

const toolbar = plugin.CreateToolbar("Scriptbench");
const toggle = toolbar.CreateButton(
  "Scriptbench",
  "Benchmarker with graphs, tables, and a microprofiler!",
  "rbxassetid://105442920358687",
);

function main() {
  if (RunService.IsRunMode()) return;

  const widgetInfo = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Float,
    false,
    false,
    900,
    450,
    900,
    300,
  );
  const widget = plugin.CreateDockWidgetPluginGui("scriptbench", widgetInfo);
  (widget as unknown as { Title: string }).Title = "Scriptbench";
  widget.Name = "Scriptbench";

  const root = createRoot(new Instance("Folder"));
  (
    toggle as unknown as { ClickableWhenViewportHidden: boolean }
  ).ClickableWhenViewportHidden = true;
  toggle.Click.Connect(() => {
    widget.Enabled = !widget.Enabled;
    toggle.SetActive(widget.Enabled);
  });

  root.render(
    createPortal(
      <StrictMode>
        <PluginProvider Plugin={plugin}>
          <App
            GetSetting={(x: string) => plugin.GetSetting(x)}
            SetSetting={(x: string, y: string) => plugin.SetSetting(x, y)}
          />
        </PluginProvider>
      </StrictMode>,
      widget,
    ),
  );
}

main();
