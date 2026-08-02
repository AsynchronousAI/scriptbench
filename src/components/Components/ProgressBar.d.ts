import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface ProgressBarProps extends CommonProps {
	/**
	 * The current progress value.
	 */
	Value: number;

	/**
	 * The maximum value for the progress bar. Defaults to 1 if not provided.
	 */
	Max?: number;

	/**
	 * A function to format the progress text.
	 * @param value The current progress value.
	 * @param max The maximum progress value.
	 * @returns A string to be displayed as the progress text.
	 */
	Formatter?: (value: number, max: number) => string;
}

/**
 * A basic progress indicator. This should be used for longer or more detailed loading processes.
 * For shorter loading processes, consider using a LoadingDots component.
 */
export function ProgressBar(props: ProgressBarProps): Element;
