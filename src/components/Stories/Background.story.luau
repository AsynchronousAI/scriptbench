local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local Background = require(script.Parent.Parent.Components.Background)
local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	return React.createElement(Background)
end

return createStory(Story)
