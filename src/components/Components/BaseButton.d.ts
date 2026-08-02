import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

export interface IBaseButtonProps
	extends CommonProps,
		Partial<
			Omit<
				WritableInstanceProperties<TextButton>,
				| "Font"
				| "TextSize"
				| "TextColor3"
				| "BackgroundColor3"
				| "BorderColor3"
				| "BorderMode"
				| "AutoButtonColor"
			>
		> {
	Disabled?: boolean;
	Selected?: boolean;
	TextColorStyle?: Enum.StudioStyleGuideColor;
	BackgroundColorStyle?: Enum.StudioStyleGuideColor;
	BorderColorStyle?: Enum.StudioStyleGuideColor;
	OnActivated?: () => void;
}

export const BaseButton: (props: IBaseButtonProps) => Element;
