import { Element } from "@rbxts/react";
import { IBaseButtonProps } from "./BaseButton";
import { CommonProps } from "../CommonProps";

interface IButtonProps extends IBaseButtonProps, CommonProps {
	Icon?: {
		Image: string;
		Size: Vector2;
		Transparency?: number;
		Color?: Color3;
		UseThemeColor?: boolean;
		Alignment?: Enum.HorizontalAlignment;
	};

	Transparency?: number;
	Color?: Color3;
	UseThemeColor?: boolean;
	Alignment?: Enum.HorizontalAlignment;
}

export const Button: (props: IButtonProps) => Element;
