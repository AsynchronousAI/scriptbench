import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

type ISplitterProps<T> = {
	Alpha: number;
	OnChanged: (alpha: number) => void;
	Disabled?: boolean;
	Size?: UDim2;
	MinAlpha?: number;
	MaxAlpha?: number;
	Orientation?: "Horizontal" | "Vertical";
	FillDirection?: Enum.FillDirection;
} & CommonProps &
	Partial<Pick<Frame, "Size" | "Position" | "AnchorPoint" | "ZIndex" | "LayoutOrder">>;

/** **Note: Needs two child elements.** */
export const Splitter: <T>(props: ISplitterProps<T>) => Element;
