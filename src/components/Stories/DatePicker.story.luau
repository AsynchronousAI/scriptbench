local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local DatePicker = require(script.Parent.Parent.Components.DatePicker)
local Label = require(script.Parent.Parent.Components.Label)
local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	local date, setDate = React.useState(DateTime.now())

	return React.createElement(React.Fragment, {}, {
		Picker = React.createElement(DatePicker, {
			Date = date,
			OnChanged = setDate,
			LayoutOrder = 1,
		}),
		Display = React.createElement(Label, {
			LayoutOrder = 2,
			Size = UDim2.new(1, 0, 0, 20),
			Text = `Selected: {date:FormatUniversalTime("LL", "en-us")}`,
		}),
	})
end

return createStory(Story)
