local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

export type PluginContext = {
	plugin: Plugin,
	pushMouseIcon: (icon: string) -> string,
	popMouseIcon: (id: string) -> (),
}

return React.createContext(nil :: PluginContext?)
