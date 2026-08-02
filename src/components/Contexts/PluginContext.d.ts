/// <reference types="@rbxts/types" />

import { Context } from "@rbxts/react";

/**
 * The structure of the PluginContext, which provides plugin-related
 * utilities to components in the React tree.
 */
interface PluginContextValue {
	/** The plugin instance (usually the global `plugin`). */
	plugin: Plugin;

	/** Push a mouse icon to the icon stack and return its ID. */
	pushMouseIcon: (icon: string) => string;

	/** Remove a mouse icon from the stack by ID. */
	popMouseIcon: (id: string) => void;
}

/**
 * React context that provides access to the PluginContext throughout
 * the component tree. This context is `undefined` if not wrapped in a PluginProvider.
 */
declare const PluginContext: Context<PluginContextValue | undefined>;
export = PluginContext;