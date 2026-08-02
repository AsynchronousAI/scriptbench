import { ReactNode } from "react";
import { CommonProps } from "../../CommonProps";

export interface BaseLabelledToggleConsumerProps extends CommonProps {
	ContentAlignment?: Enum.HorizontalAlignment;
	ButtonAlignment?: Enum.HorizontalAlignment;
	OnChanged?: () => void;
	Label?: string;
}

export interface BaseLabelledToggleProps extends BaseLabelledToggleConsumerProps {
	RenderButton?: React.FC<{ Hovered: boolean }>;
}

export default function BaseLabelledToggle(props: BaseLabelledToggleProps): ReactNode;
