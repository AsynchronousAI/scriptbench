import { CommonProps } from "../CommonProps";
import { BaseTextInputConsumerProps } from "./Foundation/BaseTextInput";

export interface NumericInputProps extends BaseTextInputConsumerProps, CommonProps {
	OnValidChanged?: (n: number) => void;
	Value: number;
	Min?: number;
	Max?: number;
	Step?: number;
	OnSubmitted?: (n: number) => void;
	FormatValue?: (n: number) => string;
	Arrows?: boolean;
	Slider?: boolean;
}

export interface Props extends NumericInputProps {
	PlaceholderText?: string;
	ClearTextOnFocus?: boolean;
	OnFocused?: () => void;
	OnFocusLost?: (text: string, enterPressed: boolean, input: InputObject) => void;
}

export function NumericInput(props: NumericInputProps): JSX.Element;
