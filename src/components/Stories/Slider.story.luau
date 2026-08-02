local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local Slider = require(script.Parent.Parent.Components.Slider)
local createStory = require(script.Parent.Helpers.createStory)

local function StoryItem(props: {
	LayoutOrder: number,
	Disabled: boolean?,
})
	local value, setValue = React.useState(3)
	return React.createElement(Slider, {
		Value = value,
		Min = 0,
		Max = 10,
		Step = 0,
		OnChanged = setValue,
		Disabled = props.Disabled,
	})
end

local function Story()
	return React.createElement(React.Fragment, {}, {
		Enabled = React.createElement(StoryItem, {
			LayoutOrder = 1,
		}),
		Disabled = React.createElement(StoryItem, {
			LayoutOrder = 2,
			Disabled = true,
		}),
	})
end

return createStory(Story)
