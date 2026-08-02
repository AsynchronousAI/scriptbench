import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface DropShadowFrameProps extends CommonProps {
	children?: Element | Element[];
}

/**
 * A container frame equivalent in appearance to a [Background] with a
 * drop shadow in the lower right sides and corner.
 * This matches the appearance of some built-in Roblox Studio elements such as tooltips.
 * It is useful for providing contrast against a background.
 *
 * Any children passed will be parented to the container frame.
 */
export const DropShadowFrame: (props: DropShadowFrameProps) => Element;
