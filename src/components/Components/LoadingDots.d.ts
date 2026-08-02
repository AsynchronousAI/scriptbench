import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface LoadingDotsProps extends CommonProps {
	Disabled?: boolean;
}

/**
 * A basic animated loading indicator. This matches similar indicators used in various places
 * around Studio. This should be used for short processes where the user does not need to see
 * information about how complete the loading is. For longer or more detailed loading processes,
 * consider using a [ProgressBar].
 *
 * Example of usage:
 *
 * ```lua
 * local function MyComponent()
 *     return React.createElement(StudioComponents.LoadingDots, {})
 * end
 * ```
 */
export const LoadingDots: (props: LoadingDotsProps) => Element;
