import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { RunService } from "@rbxts/services";
import { PluginProvider } from "components";
import App from "app";
import { VERSION_NUMBER, PLAYTIME } from "configurations";
import { Settings } from "settings";

const toolbar = plugin.CreateToolbar(`Scriptbench v${VERSION_NUMBER}`);
const toggle = toolbar.CreateButton(
  "Scriptbench",
  "Benchmarker with graphs, tables, and a microprofiler!",
  "rbxassetid://139419069549889",
);

function main() {
  if (RunService.IsRunMode()) return;

  if (PLAYTIME) {
    const suppressed = plugin.GetSetting("Scriptbench_SuppressPlayPrompt", false);
    if (!suppressed) {
      const [accepted, checked] = plugin.PromptGlobalConfirm(
        "Auto-Start Game",
        "Would you like to automatically start the game simulation for benchmarks?",
        "Do not show again"
      );
      if (checked) plugin.SetSetting("Scriptbench_SuppressPlayPrompt", true);
      if (accepted) task.defer(() => RunService.Run());
    }
  }

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

  Settings.LoadPlugin(plugin);
  root.render(
    createPortal(
      <StrictMode>
        <PluginProvider Plugin={plugin}>
          <App />
        </PluginProvider>
      </StrictMode>,
      widget,
    ),
  );
}

main();
