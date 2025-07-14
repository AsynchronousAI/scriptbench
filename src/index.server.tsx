import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import App from "app/App";

const toolbar = plugin.CreateToolbar("Scriptbench");
const toggle = toolbar.CreateButton(
  "Scriptbench",
  "Benchmarker with graphs, tables, and a microprofiler!",
  "rbxassetid://105442920358687",
);

function main() {
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
  toggle.Click.Connect(() => {
    widget.Enabled = !widget.Enabled;
    toggle.SetActive(widget.Enabled);
  });

  root.render(
    createPortal(
      <StrictMode>
        <App />
      </StrictMode>,
      widget,
    ),
  );
}

main();
