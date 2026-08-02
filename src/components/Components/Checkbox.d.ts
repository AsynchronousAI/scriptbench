import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface ICheckboxProps extends CommonProps {
	OnChanged: () => void;
	Disabled?: boolean;
	Value?: boolean | "Indeterminate";
	Label?: string;
	Alignment?: "Left" | "Right";
	LayoutOrder?: Frame["LayoutOrder"];
	ZIndex?: Frame["ZIndex"];
	Position?: Frame["Position"];
	RichText?: TextLabel["RichText"];
	ContentAlignment?: Enum.HorizontalAlignment;
	ButtonAlignment?: Enum.HorizontalAlignment;
}

export const Checkbox: (props: ICheckboxProps) => Element;
