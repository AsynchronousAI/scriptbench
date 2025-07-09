import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import App from "app/App";

const toolbar = plugin.CreateToolbar("Plugin");
const toggle = toolbar.CreateButton("Toggle", "", "");

function main() {
  const widgetInfo = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Float,
    false,
    false,
    300,
    300,
    300,
    300,
  );
  const widget = plugin.CreateDockWidgetPluginGui("plugin", widgetInfo);

  widget.Name = "Plugin";

  const root = createRoot(new Instance("Folder"));

  toggle.Click.Connect(() => {
    widget.Enabled = !widget.Enabled;

    toggle.SetActive(widget.Enabled);
  });

  toggle.SetActive(widget.Enabled);

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
