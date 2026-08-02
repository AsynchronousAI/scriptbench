import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

export type ITab<N extends string> = {
	Name: N;
	Disabled?: boolean;
};

type ITabContainerProps<N extends string> = {
	Tabs: ITab<N>[];
	OnTabSelected: (tab: N) => void;
	SelectedTab?: N;
} & CommonProps &
	Partial<Pick<Frame, "Size" | "Position" | "AnchorPoint" | "LayoutOrder" | "ZIndex">>;

export const TabContainer: <N extends string>(props: ITabContainerProps<N>) => Element;
