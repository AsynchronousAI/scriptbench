local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local RadioButton = require(script.Parent.Parent.Components.RadioButton)
local createStory = require(script.Parent.Helpers.createStory)

local function Story()
	local value, setValue = React.useState(true)

	return React.createElement(React.Fragment, {}, {
		Enabled = React.createElement(RadioButton, {
			Label = "Enabled",
			Value = value,
			OnChanged = function()
				setValue(not value)
			end,
			LayoutOrder = 1,
		}),
		Disabled = React.createElement(RadioButton, {
			Label = "Disabled",
			Value = value,
			Disabled = true,
			LayoutOrder = 2,
		}),
	})
end

return createStory(Story)
