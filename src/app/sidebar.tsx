import { String } from "@rbxts/luau-polyfill";
import React, { useEffect, useState } from "@rbxts/react";
import {
  Background,
  Button,
  MainButton,
  TextInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";

export interface SidebarProps {
  Benchmarks: string[];
  OnRefresh?: () => void;
  OnSelection?: (benchmarkName: string) => void;
}

const GraphIcon = {
  Image: "rbxassetid://105442920358687",
  Size: Vector2.one.mul(16),
  UseThemeColor: true,
  Alignment: Enum.HorizontalAlignment.Left,
};
const REFRESH_BUTTON_SIZE = 0.15;
export default function Sidebar(props: SidebarProps) {
  const [currentlySelected, setCurrentlySelected] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (props.OnSelection) props.OnSelection(currentlySelected);
  }, [currentlySelected]);

  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      BorderColor3={COLORS.Border}
      BackgroundColor3={COLORS.Background}
    >
      <uilistlayout
        FillDirection={"Vertical"}
        HorizontalAlignment={"Center"}
        VerticalAlignment={"Top"}
        Padding={new UDim(0.025, 0)}
        SortOrder={"LayoutOrder"}
      />

      <frame Size={new UDim2(1, 0, 0.05, 0)}>
        <TextInput
          Size={new UDim2(1 - REFRESH_BUTTON_SIZE, 0, 1, 0)}
          PlaceholderText="Filter"
          Text={searchTerm}
          OnChanged={(t) => {
            setSearchTerm(t);
          }}
        />
        <Button
          Position={new UDim2(1 - REFRESH_BUTTON_SIZE, 0, 0, 0)}
          Size={new UDim2(REFRESH_BUTTON_SIZE, 0, 1, 0)}
          Icon={{
            Image: "rbxassetid://11541290790",
            Color: COLORS.Text,
            Size: new Vector2(12, 12),
          }}
          OnActivated={props.OnRefresh}
        />
      </frame>

      {props.Benchmarks.map((name, index) => {
        if (!String.includes(name.lower(), searchTerm.lower())) return <></>;

        return currentlySelected === name ? (
          <MainButton
            LayoutOrder={index}
            Text={name}
            Icon={GraphIcon}
            Size={new UDim2(1, 0, 0.05, 0)}
          />
        ) : (
          <Button
            LayoutOrder={index}
            Text={name}
            Icon={GraphIcon}
            Size={new UDim2(1, 0, 0.05, 0)}
            OnActivated={() => {
              setCurrentlySelected(name);
            }}
          />
        );
      })}
    </frame>
  );
}
