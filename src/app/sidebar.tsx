import { String } from "@rbxts/luau-polyfill";
import React, { useEffect, useState } from "@rbxts/react";
import {
  Button,
  MainButton,
  ScrollFrame,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";

export interface SidebarProps {
  Benchmarks: string[];
  OnRefresh?: () => void;
  OnNew?: () => void;
  OnSelection?: (benchmarkName: string) => void;
  ToggleSettings?: () => void;
  SettingsOpen?: boolean;
}
interface BottomButtonProps {
  SettingsOpen?: boolean;
  Benchmarks: string[];
  ToggleSettings?: () => void;
  SetSelected: (benchmarkName: string) => void;
  OnRefresh?: () => void;
  OnNew?: () => void;
}

const GraphIcon = {
  Image: "rbxassetid://105442920358687",
  Size: Vector2.one.mul(16),
  UseThemeColor: true,
  Alignment: Enum.HorizontalAlignment.Left,
};

const ITEM_SIZE = 32;
const ICON_SIZE = 14;
const BOTTOM_BAR_HEIGHT = ITEM_SIZE + 8;

function BottomOptions(props: BottomButtonProps) {
  const settingsButton = props.SettingsOpen ? (
    <MainButton
      LayoutOrder={props.Benchmarks.size() + 1}
      Size={new UDim2(0, ITEM_SIZE, 0, ITEM_SIZE)}
      Icon={{
        Image: "rbxassetid://183390139",
        Color: COLORS.Text,
        Size: new Vector2(ICON_SIZE, ICON_SIZE),
      }}
      OnActivated={() => {
        props.ToggleSettings?.();
        props.SetSelected("");
      }}
    />
  ) : (
    <Button
      LayoutOrder={props.Benchmarks.size() + 1}
      Size={new UDim2(0, ITEM_SIZE, 0, ITEM_SIZE)}
      Icon={{
        Image: "rbxassetid://183390139",
        Color: COLORS.Text,
        Size: new Vector2(ICON_SIZE, ICON_SIZE),
      }}
      OnActivated={() => {
        props.ToggleSettings?.();
        props.SetSelected("");
      }}
    />
  );

  return (
    <frame
      Size={new UDim2(1, 0, 0, BOTTOM_BAR_HEIGHT)}
      Position={new UDim2(0, 0, 1, -BOTTOM_BAR_HEIGHT)}
      BackgroundTransparency={1}
    >
      <uilistlayout
        FillDirection={"Horizontal"}
        HorizontalAlignment={"Center"}
        VerticalAlignment={"Center"}
        Padding={new UDim(0, 6)}
        SortOrder={"LayoutOrder"}
      />
      {settingsButton}
      <Button
        LayoutOrder={props.Benchmarks.size() + 2}
        Size={new UDim2(0, ITEM_SIZE, 0, ITEM_SIZE)}
        Icon={{
          Image: "rbxassetid://11541290790",
          Color: COLORS.Text,
          Size: new Vector2(ICON_SIZE, ICON_SIZE),
        }}
        OnActivated={() => {
          props.OnRefresh?.();
          props.SetSelected("");
        }}
      />
      <Button
        LayoutOrder={props.Benchmarks.size() + 3}
        Size={new UDim2(0, ITEM_SIZE, 0, ITEM_SIZE)}
        Icon={{
          Image: "rbxassetid://15081504003",
          Color: COLORS.Text,
          Size: new Vector2(ICON_SIZE, ICON_SIZE),
        }}
        OnActivated={() => props.OnNew?.()}
      />
    </frame>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [currentlySelected, setCurrentlySelected] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (props.OnSelection) props.OnSelection(currentlySelected);
  }, [currentlySelected]);

  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      BorderSizePixel={0}
      BackgroundTransparency={1}
    >
      <uipadding
        PaddingTop={new UDim(0, 8)}
        PaddingBottom={new UDim(0, 8)}
        PaddingLeft={new UDim(0, 8)}
        PaddingRight={new UDim(0, 8)}
      />
      <ScrollFrame
        Size={new UDim2(1, 0, 1, -(BOTTOM_BAR_HEIGHT + 8))}
        Layout={{
          ClassName: "UIListLayout",
          Padding: new UDim(0, 6),
        }}
      >
        <TextInput
          Size={new UDim2(1, 0, 0, ITEM_SIZE)}
          PlaceholderText="Filter"
          Text={searchTerm}
          OnChanged={(t) => setSearchTerm(t)}
        />
        {props.Benchmarks.map((name, index) => {
          if (!String.includes(name.lower(), searchTerm.lower())) return <></>;

          return currentlySelected === name ? (
            <MainButton
              LayoutOrder={index}
              Text={name}
              Icon={GraphIcon}
              Size={new UDim2(1, 0, 0, ITEM_SIZE)}
            />
          ) : (
            <Button
              LayoutOrder={index}
              Text={name}
              Icon={GraphIcon}
              Size={new UDim2(1, 0, 0, ITEM_SIZE)}
              OnActivated={() => setCurrentlySelected(name)}
            />
          );
        })}
      </ScrollFrame>
      <BottomOptions
        SetSelected={setCurrentlySelected}
        SettingsOpen={props.SettingsOpen}
        OnRefresh={props.OnRefresh}
        OnNew={props.OnNew}
        ToggleSettings={props.ToggleSettings}
        Benchmarks={props.Benchmarks}
      />
    </frame>
  );
}
