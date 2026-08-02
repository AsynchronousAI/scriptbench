import { ReactNode } from "react";
import { CommonProps } from "../../CommonProps";

export interface BaseButtonConsumerProps extends CommonProps {
	AutomaticSize?: Enum.AutomaticSize;
	OnActivated?: () => void;
	Selected?: boolean;
	Text?: string;
	TextTransparency?: number;
	Icon?: {
		Image: string;
		Size: Vector2;
		Transparency?: number;
		Color?: Color3;
		UseThemeColor?: boolean;
		Alignment?: Enum.HorizontalAlignment;
	};
}

export interface BaseButtonProps extends BaseButtonConsumerProps {
	BackgroundColorStyle?: Enum.StudioStyleGuideColor;
	BorderColorStyle?: Enum.StudioStyleGuideColor;
	TextColorStyle?: Enum.StudioStyleGuideColor;
}

export default function BaseButton(props: BaseButtonProps): ReactNode;
