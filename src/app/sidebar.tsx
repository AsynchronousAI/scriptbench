import { String } from "@rbxts/luau-polyfill";
import React, { useEffect, useState } from "@rbxts/react";
import {
  Background,
  Button,
  MainButton,
  ScrollFrame,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import { usePx } from "hooks/usePx";

export interface SidebarProps {
  Benchmarks: string[];
  OnRefresh?: () => void;
  OnNew?: () => void;
  OnSelection?: (benchmarkName: string) => void;
  ToggleSettings?: () => void;
  SettingsOpen?: boolean;
}

const GraphIcon = {
  Image: "rbxassetid://105442920358687",
  Size: Vector2.one.mul(16),
  UseThemeColor: true,
  Alignment: Enum.HorizontalAlignment.Left,
};

const ITEM_SIZE = 48;
const BOTTOM_BUTTONS_N = 3;

export default function Sidebar(props: SidebarProps) {
  const [currentlySelected, setCurrentlySelected] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const px = usePx();

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
        PaddingTop={new UDim(0, px(10))}
        PaddingBottom={new UDim(0, px(10))}
        PaddingLeft={new UDim(0, px(10))}
        PaddingRight={new UDim(0, px(10))}
      />
      <ScrollFrame Size={new UDim2(1, 0, 1, -px(ITEM_SIZE) * BOTTOM_BUTTONS_N)}>
        {/* Top to Bottom */}
        <TextInput
          Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
          PlaceholderText="Filter"
          Text={searchTerm}
          OnChanged={(t) => {
            setSearchTerm(t);
          }}
        />
        {props.Benchmarks.map((name, index) => {
          if (!String.includes(name.lower(), searchTerm.lower())) return <></>;

          return currentlySelected === name ? (
            <MainButton
              LayoutOrder={index}
              Text={name}
              Icon={GraphIcon}
              Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
            />
          ) : (
            <Button
              LayoutOrder={index}
              Text={name}
              Icon={GraphIcon}
              Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
              OnActivated={() => {
                setCurrentlySelected(name);
              }}
            />
          );
        })}
      </ScrollFrame>
      <frame
        Size={new UDim2(1, 0, 0, px(ITEM_SIZE) * BOTTOM_BUTTONS_N)}
        Position={new UDim2(0, 0, 1, -px(ITEM_SIZE) * BOTTOM_BUTTONS_N)}
        BackgroundTransparency={1}
      >
        {/* Bottom to Top */}
        <uilistlayout
          FillDirection={"Vertical"}
          HorizontalAlignment={"Center"}
          VerticalAlignment={"Bottom"}
          Padding={new UDim(0.1, 0)}
          SortOrder={"LayoutOrder"}
        />
        {props.SettingsOpen ? (
          <MainButton
            LayoutOrder={props.Benchmarks.size() + 1}
            Position={new UDim2(1, 0, 0, 0)}
            Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
            Text="Settings"
            Icon={{
              Image: "rbxassetid://183390139",
              Color: COLORS.Text,
              Size: new Vector2(14, 14),
            }}
            OnActivated={() => {
              props.ToggleSettings?.();
              setCurrentlySelected("");
            }}
          />
        ) : (
          <Button
            LayoutOrder={props.Benchmarks.size() + 1}
            Position={new UDim2(1, 0, 0, 0)}
            Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
            Text="Settings"
            Icon={{
              Image: "rbxassetid://183390139",
              Color: COLORS.Text,
              Size: new Vector2(14, 14),
            }}
            OnActivated={() => {
              props.ToggleSettings?.();
              setCurrentlySelected("");
            }}
          />
        )}
        <Button
          LayoutOrder={props.Benchmarks.size() + 2}
          Position={new UDim2(1, 0, 0, 0)}
          Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
          Text="Refresh"
          Icon={{
            Image: "rbxassetid://11541290790",
            Color: COLORS.Text,
            Size: new Vector2(14, 14),
          }}
          OnActivated={() => {
            props.OnRefresh?.();
            setCurrentlySelected("");
          }}
        />
        <Button
          LayoutOrder={props.Benchmarks.size() + 3}
          Position={new UDim2(1, 0, 0, 0)}
          Size={new UDim2(1, 0, 0, px(ITEM_SIZE))}
          Text="New Bench"
          Icon={{
            Image: "rbxassetid://15081504003",
            Color: COLORS.Text,
            Size: new Vector2(14, 14),
          }}
          OnActivated={() => {
            props.OnNew?.();
          }}
        />
      </frame>
    </frame>
  );
}
