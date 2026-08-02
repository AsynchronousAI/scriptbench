local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local ColorPicker = require(script.Parent.Parent.Components.ColorPicker)
local createStory = require(script.Parent.Helpers.createStory)

local function StoryItem(props: { Disabled: boolean? })
	local color, setColor = React.useState(Color3.fromRGB(255, 255, 0))

	return React.createElement(ColorPicker, {
		Color = color,
		OnChanged = setColor,
		Disabled = props.Disabled,
	})
end

local function Story()
	return React.createElement(React.Fragment, {}, {
		Enabled = React.createElement(StoryItem),
		Disabled = React.createElement(StoryItem, { Disabled = true }),
	})
end

return createStory(Story)
