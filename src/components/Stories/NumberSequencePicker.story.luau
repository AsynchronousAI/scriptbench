local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local NumberSequencePicker = require(script.Parent.Parent.Components.NumberSequencePicker)
local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	local value, setValue = React.useState(NumberSequence.new({
		NumberSequenceKeypoint.new(0.0, 0.00),
		NumberSequenceKeypoint.new(0.4, 0.75, 0.10),
		NumberSequenceKeypoint.new(0.5, 0.45, 0.15),
		NumberSequenceKeypoint.new(0.8, 0.75),
		NumberSequenceKeypoint.new(1.0, 0.50),
	}))

	return React.createElement("Frame", {
		BackgroundTransparency = 1,
		Size = UDim2.fromScale(1, 1),
	}, {
		Picker = React.createElement(NumberSequencePicker, {
			Value = value,
			OnChanged = setValue,
			AnchorPoint = Vector2.new(0.5, 0.5),
			Position = UDim2.fromScale(0.5, 0.5),
		}),
	})
end

return createStory(Story)
