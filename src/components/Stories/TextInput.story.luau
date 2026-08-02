local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local TextInput = require(script.Parent.Parent.Components.TextInput)
local createStory = require(script.Parent.Helpers.createStory)

local function StoryItem(props: {
	Label: string,
	LayoutOrder: number,
	Disabled: boolean?,
	Filter: ((s: string) -> string)?,
})
	local text, setText = React.useState(if props.Disabled then props.Label else "")

	return React.createElement("Frame", {
		Size = UDim2.fromOffset(175, 20),
		LayoutOrder = props.LayoutOrder,
		BackgroundTransparency = 1,
	}, {
		Input = React.createElement(TextInput, {
			Text = text,
			PlaceholderText = props.Label,
			Disabled = props.Disabled,
			OnChanged = function(newText)
				local filtered = newText
				if props.Filter then
					filtered = props.Filter(newText)
				end
				setText(filtered)
			end,
		}),
	})
end

local function Story()
	return React.createElement(React.Fragment, {}, {
		Enabled = React.createElement(StoryItem, {
			Label = "Any text allowed",
			LayoutOrder = 1,
		}),
		Filtered = React.createElement(StoryItem, {
			Label = "Numbers only",
			LayoutOrder = 2,
			Filter = function(text)
				return (string.gsub(text, "%D", ""))
			end,
		}),
		Disabled = React.createElement(StoryItem, {
			Label = "Disabled",
			LayoutOrder = 3,
			Disabled = true,
		}),
	})
end

return createStory(Story)
