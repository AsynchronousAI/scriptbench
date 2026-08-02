import { Element } from "@rbxts/react";
import { IBaseButtonProps } from "./BaseButton";

interface IMainButtonProps extends IBaseButtonProps {
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

export const MainButton: (props: IMainButtonProps) => Element;
