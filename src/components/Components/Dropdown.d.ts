import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface IDropdownProps<T extends string>
	extends CommonProps,
		Partial<Pick<Frame, "Position" | "AnchorPoint" | "LayoutOrder" | "ZIndex">> {
	Items: T[];
	SelectedItem: string;
	OnItemSelected: (item: T) => void;
	Disabled?: boolean;
	MaxVisibleRows?: number;
	RowHeightTop?: number;
	RowHeightItem?: number;
	Width?: UDim;
}

export const Dropdown: <T extends string>(props: IDropdownProps<T>) => Element;
