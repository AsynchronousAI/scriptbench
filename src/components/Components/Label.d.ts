import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

type ILabelProps = {
	Disabled?: boolean;
	TextColorStyle?: Enum.StudioStyleGuideColor;
} & CommonProps &
	Partial<Omit<WritableInstanceProperties<TextLabel>, "TextColor3">>;

export const Label: (props: ILabelProps) => Element;
