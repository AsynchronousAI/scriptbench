local Plugin = script.Parent.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

local Constants = require(script.Parent.Parent.Parent.Constants)
local useTheme = require(script.Parent.Parent.Parent.Hooks.useTheme)

local function AxisLabel(props: {
	AnchorPoint: Vector2?,
	Position: UDim2?,
	TextXAlignment: Enum.TextXAlignment?,
	Value: number,
	Disabled: boolean?,
})
	local theme = useTheme()

	return React.createElement("TextLabel", {
		AnchorPoint = props.AnchorPoint,
		Position = props.Position,
		Size = UDim2.fromOffset(14, 14),
		BackgroundTransparency = 1,
		Text = tostring(props.Value),
		Font = Constants.DefaultFont,
		TextSize = Constants.DefaultTextSize,
		TextColor3 = theme:GetColor(Enum.StudioStyleGuideColor.DimmedText),
		TextTransparency = if props.Disabled then 0.5 else 0,
		TextXAlignment = props.TextXAlignment,
		ZIndex = -1,
	})
end

return AxisLabel
