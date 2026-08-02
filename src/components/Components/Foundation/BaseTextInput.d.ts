import { ReactNode } from "react";
import { CommonProps } from "../../CommonProps";

export interface BaseTextInputConsumerProps extends CommonProps {
	PlaceholderText?: string;
	ClearTextOnFocus?: boolean;
	OnFocused?: () => void;
	OnFocusLost?: (text: string, enterPressed: boolean, input: InputObject) => void;
	children?: ReactNode;
}

export interface BaseTextInputProps extends BaseTextInputConsumerProps {
	Text: string;
	OnChanged: (newText: string) => void;
	RightPaddingExtra?: number;
}

export default function BaseTextInput(props: BaseTextInputProps): ReactNode;
