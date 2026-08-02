local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local LoadingDots = require(script.Parent.Parent.Components.LoadingDots)
local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	return React.createElement(LoadingDots, {})
end

return createStory(Story)
