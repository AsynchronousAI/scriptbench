/// <reference types="@rbxts/types" />

import { ReactNode } from "@rbxts/react";

/**
 * Interface for the PluginProvider component's props.
 * 
 * @within PluginProvider
 * @tag Component Props
 */
export interface PluginProviderProps {
	/** The root plugin instance (typically the global `plugin` variable). */
	Plugin: Plugin;

	/** The child components rendered within the context of the provider. */
	children: ReactNode;
}

/**
 * Provides an interface to plugin APIs for other components in the tree.
 *
 * Only needed if you're using components that require access to the plugin context,
 * like the `Splitter` or using the `useMouseIcon` hook.
 *
 * Typically rendered at the root of your plugin UI component tree.
 *
 * @example
 * ```tsx
 * const MyComponent = () => (
 *   <StudioComponents.PluginProvider Plugin={plugin}>
 *     <MyExample />
 *   </StudioComponents.PluginProvider>
 * );
 * ```
 *
 * @param props The props for PluginProvider
 * @returns A React element
 */
export function PluginProvider(props: PluginProviderProps): JSX.Element;