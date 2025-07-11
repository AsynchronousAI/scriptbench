-- GraphModule.lua

local Graph = {}

local Theme = {
	Name = "Dark",
	Background = Color3.fromHex("#212121"),
	LightBackground = Color3.fromRGB(30, 30, 30),
	Text = Color3.fromRGB(200, 200, 200)
}
local isDark = true

local function getKeyColor(name)
	local seed = 0
	for i = 1, #name do
		seed += name:byte(i)
	end
	local rng = Random.new(seed)
	local hue = rng:NextInteger(0, 50) / 50
	return Color3.fromHSV(hue, isDark and 0.9 or 1, isDark and 0.84 or 0.8)
end

local function preprocessDataSet(Set, resolution)
	local chunkSize = math.ceil(#Set / resolution)
	local downsampled = {}

	for i = 1, #Set, chunkSize do
		local chunk = {}
		for j = i, math.min(i + chunkSize - 1, #Set) do
			local v = Set[j]
			if typeof(v) == "number" then
				table.insert(chunk, {Index = j, Value = v})
			end
		end
		table.sort(chunk, function(a, b) return a.Value < b.Value end)
		local median = chunk[math.round(#chunk * 0.55)]
		if median then table.insert(downsampled, median) end
	end

	return downsampled
end

function Graph.new(Frame)
	assert(Frame, "Must provide a Frame to draw graph")

	local GraphHandler = {
		Frame = Frame,
		Resolution = 75,
		BaselineZero = false,
		Data = {},
		HighlightedX = {},
	}

	local Busy = false
	local BaseZIndex = Frame.ZIndex

	local Background = Instance.new("Frame")
	Background.BackgroundColor3 = Theme.Background
	Background.Size = UDim2.new(1, 0, 1, 0)
	Background.ZIndex = BaseZIndex + 1
	Background.Parent = Frame

	local MarkerBG = Instance.new("Frame")
	MarkerBG.Size = UDim2.new(0.066, 0, 1, 0)
	MarkerBG.BackgroundColor3 = Theme.LightBackground
	MarkerBG.BorderSizePixel = 0
	MarkerBG.ZIndex = BaseZIndex + 2
	MarkerBG.Parent = Frame

	local XMarkerBG = Instance.new("Frame")
	XMarkerBG.Size = UDim2.new(1, 0, 0.066, 0)
	XMarkerBG.Position = UDim2.new(0, 0, 0.934, 0)
	XMarkerBG.BackgroundColor3 = Theme.LightBackground
	XMarkerBG.BorderSizePixel = 0
	XMarkerBG.ZIndex = BaseZIndex + 2
	XMarkerBG.Parent = Frame

	local YMarkers = Instance.new("Frame")
	YMarkers.Size = UDim2.new(0.066, 0, 1, 0)
	YMarkers.Position = UDim2.new(-0.02, 0, 0, 0)
	YMarkers.BackgroundTransparency = 1
	YMarkers.ZIndex = BaseZIndex + 3
	YMarkers.Parent = Frame

	local XMarkers = Instance.new("Frame")
	XMarkers.Size = UDim2.new(1, 0, 0.066, 0)
	XMarkers.Position = UDim2.new(0, 0, 0.934, 0)
	XMarkers.BackgroundTransparency = 1
	XMarkers.ZIndex = BaseZIndex + 3
	XMarkers.Parent = Frame

	local GraphingFrame = Instance.new("Frame")
	GraphingFrame.AnchorPoint = Vector2.new(0.5, 0.5)
	GraphingFrame.Size = UDim2.new(0.935, 0, 0.949, 0)
	GraphingFrame.Position = UDim2.new(0.532, 0, 0.475, 0)
	GraphingFrame.BackgroundTransparency = 1
	GraphingFrame.ZIndex = BaseZIndex + 4
	GraphingFrame.Parent = Frame

	local function renderAxisLabels(RangeMin, Range, DomainMin, Domain)
		YMarkers:ClearAllChildren()
		XMarkers:ClearAllChildren()

		for y = 0, 1, 0.125 do
			local label = Instance.new("TextLabel")
			label.Size = UDim2.new(1, 0, 0.08, 0)
			label.AnchorPoint = Vector2.new(0, 0.5)
			label.Position = UDim2.new(0, 0, 0.9 - y, 0)
			label.Text = string.format("%.2f", 1 + RangeMin + (Range * y))
			label.TextColor3 = Theme.Text
			label.Font = Enum.Font.SourceSans
			label.BackgroundTransparency = 1
			label.TextXAlignment = Enum.TextXAlignment.Right
			label.TextSize = (Frame.AbsoluteSize.X * 0.02)
			label.ZIndex = BaseZIndex + 5
			label.Parent = YMarkers
		end

		for x = 0, 1, 0.111 do
			local label = Instance.new("TextLabel")
			label.Size = UDim2.new(1, 0, 0.08, 0)
			label.AnchorPoint = Vector2.new(0, 0.5)
			label.Position = UDim2.new(x - 0.9, 0, 0.5, 0)
			label.Text = string.format("%.2f µs", DomainMin + (Domain) * x)
			label.TextColor3 = Theme.Text
			label.Font = Enum.Font.SourceSans
			label.BackgroundTransparency = 1
			label.TextXAlignment = Enum.TextXAlignment.Right
			label.TextSize = (Frame.AbsoluteSize.X * 0.02)
			label.ZIndex = BaseZIndex + 5
			label.Parent = XMarkers
		end
	end

	function GraphHandler.Render()
		if Busy then return end
		Busy = true

		GraphingFrame:ClearAllChildren()
		local allData = {}
		local RangeMin, RangeMax = math.huge, -math.huge
		local DomainMin, DomainMax = math.huge, -math.huge

		for Key, Set in pairs(GraphHandler.Data) do
			local dataPoints = preprocessDataSet(Set, GraphHandler.Resolution)
			allData[Key] = dataPoints
			for _, pt in ipairs(dataPoints) do
				RangeMin = math.min(RangeMin, pt.Value)
				RangeMax = math.max(RangeMax, pt.Value)
				DomainMin = math.min(DomainMin, pt.Index)
				DomainMax = math.max(DomainMax, pt.Index)
			end
		end

		if GraphHandler.BaselineZero then
			RangeMin = 0
			RangeMax = RangeMax * 1.75
		end

		local Range = RangeMax - RangeMin
		local Domain = DomainMax - DomainMin

		renderAxisLabels(RangeMin, Range, DomainMin, Domain)

		for Key, Points in pairs(allData) do
			local Color = getKeyColor(Key)
			local LastPoint

			for _, point in ipairs(Points) do
				local XScale = 0.025 + (point.Index - DomainMin) / (Domain + 1)
				local YScale = 0.95 - ((point.Value - RangeMin) / (Range + 1))

				local Dot = Instance.new("Frame")
                Dot.Position = UDim2.new(XScale, 0, YScale, 0)
                Dot.Size = UDim2.new(0.02, 0, 0.02, 0)
                Dot.AnchorPoint = Vector2.new(0.5, 0.5)
                Dot.BackgroundColor3 = Color
                Dot.BorderSizePixel = 0
                Dot.ZIndex = BaseZIndex + 6

                Instance.new("UIAspectRatioConstraint", Dot)

                local Corner = Instance.new("UICorner")
                Corner.CornerRadius = UDim.new(1, 0)
                Corner.Parent = Dot

                -- Tooltip Label
                local Tooltip = Instance.new("TextLabel")
                Tooltip.Visible = false
                Tooltip.RichText = true
                Tooltip.BackgroundColor3 = Theme.LightBackground
                Tooltip.TextColor3 = Theme.Text
                Tooltip.Font = Enum.Font.Code
                Tooltip.ZIndex = BaseZIndex + 10

                local color = Color
                local R, G, B = math.floor(color.R * 255), math.floor(color.G * 255), math.floor(color.B * 255)
                Tooltip.Text = string.format(
               					'<b><font color="rgb(%d,%d,%d)">%s</font></b>\n\nCalls: %.2f\nTime: %d µs',
               					R, G, B, Key, point.Value, point.Index
                )
                Tooltip.Size = UDim2.new(0, Frame.AbsoluteSize.X * 0.15, 0, Frame.AbsoluteSize.Y * 0.12)
                Tooltip.Position = UDim2.new(1, 0, 0.4, 0)
                Tooltip.BackgroundTransparency = 0.05
                Tooltip.TextSize = Frame.AbsoluteSize.X * 0.025
                Tooltip.TextWrapped = true
                Tooltip.Parent = Dot

                -- Hover behavior
                Dot.MouseEnter:Connect(function()
               					Tooltip.Visible = true
                end)
                Dot.MouseLeave:Connect(function()
               					Tooltip.Visible = false
                end)

                Dot.Parent = GraphingFrame


				local Corner = Instance.new("UICorner")
				Corner.CornerRadius = UDim.new(1, 0)
				Corner.Parent = Dot

				Dot.Parent = GraphingFrame

				if LastPoint then
					local Line = Instance.new("Frame")
					local s = GraphingFrame.AbsoluteSize
					local from = s * Vector2.new(LastPoint.X, LastPoint.Y)
					local to = s * Vector2.new(XScale, YScale)
					local delta = to - from

					Line.Size = UDim2.new(0, delta.Magnitude, 0, 2)
					Line.Position = UDim2.new(0, from.X + delta.X/2, 0, from.Y + delta.Y/2)
					Line.AnchorPoint = Vector2.new(0.5, 0.5)
					Line.BackgroundColor3 = Color
					Line.BorderSizePixel = 0
					Line.Rotation = math.deg(math.atan2(delta.Y, delta.X))
					Line.ZIndex = BaseZIndex + 5
					Line.Parent = GraphingFrame
				end

				LastPoint = {X = XScale, Y = YScale}
			end
		end

		Busy = false
	end

	function GraphHandler.Theme(newTheme)
		Theme = {
			Name = newTheme.Name or "Dark",
			Background = newTheme.Background or Color3.fromRGB(46,46,46),
			LightBackground = newTheme.LightBackground or Color3.fromRGB(70,70,70),
			Text = newTheme.Text or Color3.fromRGB(220,220,230),
		}
		Background.BackgroundColor3 = Theme.Background
		MarkerBG.BackgroundColor3 = Theme.LightBackground
		XMarkerBG.BackgroundColor3 = Theme.LightBackground
		GraphHandler.Render()
	end

	-- React to resizing
	Frame:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
		task.defer(function()
			GraphHandler.Render()
		end)
	end)

	return setmetatable({}, {
		__index = function(_, key) return GraphHandler[key] end,
		__newindex = function(_, key, value)
			if key == "Data" then
				GraphHandler.Data = value
				GraphHandler.Render()
			elseif key == "Resolution" then
				GraphHandler.Resolution = math.clamp(value, 3, 500)
				GraphHandler.Render()
			elseif key == "BaselineZero" then
				GraphHandler.BaselineZero = value
				GraphHandler.Render()
			elseif key == "HighlightedX" then
				GraphHandler.HighlightedX = value
				GraphHandler.Render()
			end
		end,
	})
end

return Graph
