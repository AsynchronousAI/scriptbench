local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local Checkbox = require(script.Parent.Parent.Components.Checkbox)
local DropShadowFrame = require(script.Parent.Parent.Components.DropShadowFrame)
local Label = require(script.Parent.Parent.Components.Label)

local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	local boxValue, setBoxValue = React.useState(false)

	return React.createElement(DropShadowFrame, {
		Size = UDim2.fromOffset(175, 75),
	}, {
		Layout = React.createElement("UIListLayout", {
			SortOrder = Enum.SortOrder.LayoutOrder,
			Padding = UDim.new(0, 10),
		}),
		Padding = React.createElement("UIPadding", {
			PaddingLeft = UDim.new(0, 10),
			PaddingRight = UDim.new(0, 10),
			PaddingTop = UDim.new(0, 10),
			PaddingBottom = UDim.new(0, 10),
		}),
		Label = React.createElement(Label, {
			LayoutOrder = 1,
			Text = "Example label",
			Size = UDim2.new(1, 0, 0, 16),
			TextXAlignment = Enum.TextXAlignment.Left,
		}),
		Checkbox = React.createElement(Checkbox, {
			LayoutOrder = 2,
			Value = boxValue,
			OnChanged = function()
				setBoxValue(not boxValue)
			end,
			Label = "Example checkbox",
		}),
	})
end

return createStory(Story)
