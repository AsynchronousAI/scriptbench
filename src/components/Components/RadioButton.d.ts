import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

type IRadioButtonProps = {
	OnActivated: () => void;
	Disabled?: boolean;
	Value?: boolean;
	Label?: string;
} & CommonProps &
	Partial<Pick<TextButton, "LayoutOrder" | "ZIndex">>;

export const RadioButton: <T>(props: IRadioButtonProps) => Element;
