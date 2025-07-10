--[=[

Docs: https://devforum.roblox.com/t/graph-module-easily-draw-graphs-of-your-data/828982/1

API:

function Graph.new(Frame)
	returns a GraphHandler

GraphHandler.Resolution = The number of points it renders
GraphHandler.BaselineZero = Whether the bottom of the graph should start at zero (or at the minimum value)
GraphHandler.Data = The dictionary of data sets
	(Data must be a dictionary of arrays with no holes)

function GraphHandler.Theme(ThemeDictionary)
	Updates the Colors of the graph

--]=]

local Graph = {}

local Theme = {
	Name = "Dark";

	Background = Color3.fromHex("#212121"),
	LightBackground = Color3.fromRGB(30,30,30),
	Text = Color3.fromRGB(200,200,200)
}
local isDark = true

local function getKeyColor(name)
	-- Shoutout to Vocksel for the core of this function

	local seed = 0
	for i=1, #name do
		seed = seed + (name:byte(i))
	end
	local rng = Random.new(seed)
	local hue = rng:NextInteger(0,50)/50

	return Color3.fromHSV(hue, isDark and 0.9 or 1, isDark and 0.84 or 0.8)
end


function Graph.new(Frame)
	if not Frame then error("Must give graph a frame") end
	local GraphHandler = {Frame = Frame; Resolution = 75;}

	-- Private variables
	local Busy = false

	-- Create the GUIs
	local BaseZIndex = GraphHandler.Frame.ZIndex

	local Background = Instance.new("Frame")
	Background.Name = "Background"
	Background.BackgroundColor3 = Theme.Background
	Background.Size = UDim2.new(1,0,1,0)
	Background.ZIndex = BaseZIndex+1
	Background.Parent = GraphHandler.Frame

	local MarkerBG = Instance.new("Frame")
	MarkerBG.Name = "YMarkerBackground"
	MarkerBG.Size = UDim2.new(0.066,0,1,0)
	MarkerBG.BackgroundColor3 = Theme.LightBackground
	MarkerBG.BorderSizePixel = 0
	MarkerBG.ZIndex = BaseZIndex+2
	MarkerBG.Parent = GraphHandler.Frame

	local XMarkerBG = Instance.new("Frame")
	XMarkerBG.Name = "XMarkerBackground"
	XMarkerBG.Size = UDim2.new(1,0,0.066,0)
	XMarkerBG.Position = UDim2.new(0,0,0.934,0)
	XMarkerBG.BackgroundColor3 = Theme.LightBackground
	XMarkerBG.BorderSizePixel = 0
	XMarkerBG.ZIndex = BaseZIndex+2
	XMarkerBG.Parent = GraphHandler.Frame

	local YMarkers = Instance.new("Frame")
	YMarkers.Name = "YMarkers"
	YMarkers.Size = UDim2.new(0.05,0,0.85,0)
	YMarkers.Position = UDim2.new(0.015,0,0.15,0)
	YMarkers.BackgroundTransparency = 1
	YMarkers.BorderSizePixel = 0
	YMarkers.ZIndex = BaseZIndex+2
	YMarkers.Parent = GraphHandler.Frame

	local XMarkers = Instance.new("Frame")
	XMarkers.Name = "XMarkers"
	XMarkers.Size = UDim2.new(1,0,0.066,0)
	XMarkers.Position = UDim2.new(0,0,0.934,0)
	XMarkers.BackgroundTransparency = 1
	XMarkers.BorderSizePixel = 0
	XMarkers.ZIndex = BaseZIndex+2
	XMarkers.Parent = GraphHandler.Frame

	local GraphingFrame = Instance.new("Frame")
	GraphingFrame.Name = "GraphingFrame"
	GraphingFrame.Size = UDim2.new(1,0,0.85,0)
	GraphingFrame.Position = UDim2.new(0,-65,0.15,0)
	GraphingFrame.BackgroundTransparency = 1
	GraphingFrame.ZIndex = BaseZIndex+2
	GraphingFrame.Parent = GraphHandler.Frame
--[[
	local KeyNames = Instance.new("Frame")
	KeyNames.Name = "KeyNames"
	KeyNames.Size = UDim2.new(1,0,0.1,0)
	KeyNames.Position = UDim2.new(0,0,0,0)
	KeyNames.BackgroundColor3 = Theme.LightBackground
	KeyNames.BorderSizePixel = 0
	KeyNames.ZIndex = BaseZIndex+2
	KeyNames.Parent = GraphHandler.Frame
]]

	-- Rerender if the frame changes size since our lines will be all wonky
	GraphHandler.Frame:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
		local Size = GraphHandler.Frame.AbsoluteSize
		task.wait(0.04)
		if Size == GraphHandler.Frame.AbsoluteSize then
			GraphHandler.Render()
		end
	end)

	function GraphHandler.Theme(newTheme)
		task.wait()
		-- Make sure we have latest theme data
		Theme = {
			Name = newTheme.Name or "Dark";

			Background = newTheme.Background or Color3.fromRGB(46,46,46);
			LightBackground = newTheme.LightBackground or Color3.fromRGB(70,70,70);
			Text = newTheme.Text or Color3.fromRGB(220,220,230);
		}

		-- Update GUIs
		Background.BackgroundColor3 = Theme.Background
		MarkerBG.BackgroundColor3 = Theme.LightBackground
		--KeyNames.BackgroundColor3 = Theme.LightBackground

		-- Redraw graph with new colors
		GraphHandler.Render()
	end

	function GraphHandler.Render()
		-- Validate we have stuff to render
		if not GraphHandler.Frame or not GraphHandler.Data or not GraphHandler.Resolution then
			return
		end

		while Busy do task.wait() end
		Busy = true

		-- Clear old graph values
		YMarkers:ClearAllChildren()
		GraphingFrame:ClearAllChildren()
		XMarkers:ClearAllChildren()
		--KeyNames:ClearAllChildren()

		BaseZIndex = GraphHandler.Frame.ZIndex

		Background.ZIndex = BaseZIndex+1
		MarkerBG.ZIndex = BaseZIndex+2
		XMarkerBG.ZIndex = BaseZIndex+2
		YMarkers.ZIndex = BaseZIndex+2
		GraphingFrame.ZIndex = BaseZIndex+2
		--KeyNames.ZIndex = BaseZIndex+2

		--[[local KeyLayout = Instance.new("UIListLayout")
		KeyLayout.FillDirection = Enum.FillDirection.Horizontal
		KeyLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
		KeyLayout.VerticalAlignment = Enum.VerticalAlignment.Center
		KeyLayout.Padding = UDim.new(0.01,0)
		KeyLayout.Parent = KeyNames]]

		local Range, Domain

		-- Calculate our range of values
		local RangeMax, RangeMin = -math.huge,math.huge
		for Key, Set in pairs(GraphHandler.Data) do
			local SetAmount = #Set

			for i=1,SetAmount, math.ceil(SetAmount/GraphHandler.Resolution) do
				local SortedChunk = {}
				for x=i,i+math.ceil(SetAmount/GraphHandler.Resolution) do
					SortedChunk[#SortedChunk+1] = Set[x]
				end
				table.sort(SortedChunk)

				local Value = SortedChunk[math.round(#SortedChunk*0.55)]
				if not Value then continue end

				-- Record for our range calc
				RangeMin = math.min(RangeMin, Value)
				RangeMax = math.max(RangeMax, Value)
			end
		end

		if GraphHandler.BaselineZero then
			RangeMin = 0
			RangeMax = RangeMax * 1.75
		end

		Range = RangeMax-RangeMin

		-- Calculate the domain of our values
		local DomainMax, DomainMin = -math.huge, math.huge
		for Key, Set in pairs(GraphHandler.Data) do
		    local SetAmount = #Set

			for i=1,SetAmount, math.ceil(SetAmount/GraphHandler.Resolution) do
				local SortedChunk = {}
				for x=i,i+math.ceil(SetAmount/GraphHandler.Resolution) do
					SortedChunk[#SortedChunk+1] = x--Set[x]
				end
				table.sort(SortedChunk)

				local Value = SortedChunk[math.round(#SortedChunk*0.55)]
				if not Value then continue end

				-- Record for our domain calc
				DomainMin = math.min(DomainMin, Value)
				DomainMax = math.max(DomainMax, Value)
			end
		end

		Domain = DomainMax-DomainMin


		-- Mark our Y axis values along the derived range
		for y=0,1,0.2 do
			local Marker = Instance.new("TextLabel")
			Marker.Name = y
			Marker.Size = UDim2.new(1,0,0.08,0)
			Marker.AnchorPoint = Vector2.new(0,0.5)
			Marker.Position = UDim2.new(0,0,0.9 - y,0)
			Marker.Text = string.format("%.2f Calls", (RangeMin + (Range*y)))
			Marker.TextXAlignment = Enum.TextXAlignment.Right

			Marker.TextColor3 = Theme.Text
			Marker.Font = Enum.Font.SourceSans
			Marker.BackgroundTransparency = 1
			Marker.TextSize = (GraphHandler.Frame.AbsoluteSize.X*0.02)
			Marker.ZIndex = BaseZIndex+3
			Marker.Parent = YMarkers
		end


		-- Mark our X axis values along the derived domain
		for x=0,1,0.2 do
			local Marker = Instance.new("TextLabel")
			Marker.Name = x
			Marker.Size = UDim2.new(1,0,0.08,0)
			Marker.AnchorPoint = Vector2.new(0,0.5)
			Marker.Position = UDim2.new(x - 0.9,0,0.5,0)
			Marker.Text = `{math.floor(DomainMin + (DomainMax*x))} µs`
			Marker.TextXAlignment = Enum.TextXAlignment.Right

			Marker.TextColor3 = Theme.Text
			Marker.Font = Enum.Font.SourceSans
			Marker.BackgroundTransparency = 1
			Marker.TextSize = (GraphHandler.Frame.AbsoluteSize.X*0.02)
			Marker.ZIndex = BaseZIndex+3
			Marker.Parent = XMarkers
		end

		-- Draw the graph at this range
		local KeyColors = {}
		local thickness = math.clamp(0.2/GraphHandler.Resolution, 0.002,0.01)
		for Key, Set in pairs(GraphHandler.Data) do
			-- Designate a color for this dataset
			KeyColors[Key] = getKeyColor(Key)

            if GraphHandler.HighlightedX then
                local x = ((GraphHandler.HighlightedX - DomainMin) / DomainMax)
                local HighlightedXMarker = Instance.new("Frame")
                HighlightedXMarker.Size = UDim2.new(thickness,0,1.05,0)
                HighlightedXMarker.Position = UDim2.new(x, 0, -0.125, 0)
                HighlightedXMarker.BackgroundColor3 = KeyColors[Key]
                HighlightedXMarker.BackgroundTransparency = 0.5
                HighlightedXMarker.ZIndex = BaseZIndex+4
                HighlightedXMarker.Parent = GraphingFrame
            end

			--local TextSize = GraphHandler.Frame.AbsoluteSize.Y*0.08
			--local Size = TextService:GetTextSize(Key, TextSize, Enum.Font.SourceSansSemibold, KeyNames.AbsoluteSize)
			--[[local KeyMarker = Instance.new("TextLabel")
			KeyMarker.Text = Key
			KeyMarker.TextColor3 = KeyColors[Key]
			KeyMarker.Font = Enum.Font.SourceSansSemibold
			KeyMarker.BackgroundTransparency = 1
			KeyMarker.TextSize = TextSize
			KeyMarker.Size = UDim2.new(0,Size.X+TextSize,1,0)
			KeyMarker.ZIndex = BaseZIndex+3
			KeyMarker.Parent = KeyNames]]

			-- Graph the set
			local SetAmount = #Set
			local LastPoint

			--print("  "..Key, Set)

			for i=1,SetAmount, math.ceil(SetAmount/GraphHandler.Resolution) do
				local SortedChunk = {}
				for x=i,i+math.ceil(SetAmount/GraphHandler.Resolution) do
					if Set[x] then SortedChunk[#SortedChunk+1] = {x,Set[x]} end
				end
				table.sort(SortedChunk, function(a, b) return a[2] < b[2] end)

				local Index, Value = unpack(SortedChunk[math.round(#SortedChunk*0.55)])
				if not Value then continue end

				-- Create the point
				local Point = Instance.new("Frame")
				Point.Name = Key..i
				Point.Position = UDim2.new(0.05+((i/SetAmount)),0, 0.9 - (((Value-RangeMin)/Range)),0)
				Point.AnchorPoint = Vector2.new(0.5,0.5)
				Point.SizeConstraint = Enum.SizeConstraint.RelativeXX
				Point.Size = UDim2.new(math.clamp(0.5/GraphHandler.Resolution, 0.003,0.016),0,math.clamp(0.5/GraphHandler.Resolution, 0.003,0.016),0)
				Point.BackgroundColor3 = KeyColors[Key]
				Point.BorderSizePixel = 0
				Point.ZIndex = BaseZIndex+5

				local UICorner = Instance.new("UICorner")
				UICorner.CornerRadius = UDim.new(1,0)
				UICorner.Parent = Point

				local color = KeyColors[Key]
				local Title = `<b><font color="rgb({math.floor(color.R*255)},{math.floor(color.G*255)},{math.floor(color.B*255)})">{Key}</font></b>`
				local Calls = `Calls: {Value}`
				local Value = `Time: {Index}µs`

				-- Label
				local Label = Instance.new("TextLabel")
				Label.Visible = false
				Label.RichText = true
				Label.Text = `{Title}\n\n{Calls}\n{Value}`
				Label.BackgroundColor3 = Theme.LightBackground
				Label.TextColor3 = Theme.Text
				Label.Position = UDim2.new(1,0,0.4,0)
				Label.Font = Enum.Font.Code
				Label.TextSize = (GraphHandler.Frame.AbsoluteSize.X*0.025)
				Label.Size = UDim2.new(0,Label.TextSize * 10,0,Label.TextSize * 4.5)
				Label.Parent = Point
				Label.ZIndex = BaseZIndex+10

				Point.MouseEnter:Connect(function()
					Label.Visible = true
				end)
				Point.MouseLeave:Connect(function()
					Label.Visible = false
				end)

				-- Create the line
				if LastPoint then
					local Connector = Instance.new("Frame")
					Connector.Name = Key..i.."-"..i-1
					Connector.BackgroundColor3 = KeyColors[Key]
					Connector.BorderSizePixel = 0
					Connector.SizeConstraint = Enum.SizeConstraint.RelativeXX
					Connector.AnchorPoint = Vector2.new(0.5, 0.5)
					Connector.ZIndex = BaseZIndex+4

					local Size = GraphingFrame.AbsoluteSize
					local startX, startY = Point.Position.X.Scale*Size.X, Point.Position.Y.Scale*Size.Y
					local endX, endY = LastPoint.Position.X.Scale*Size.X, LastPoint.Position.Y.Scale*Size.Y

					local Distance = (Vector2.new(startX, startY) - Vector2.new(endX, endY)).Magnitude

					Connector.Size = UDim2.new(0, Distance, thickness, 0)
					Connector.Position = UDim2.new(0, (startX + endX) / 2, 0, (startY + endY) / 2)
					Connector.Rotation = math.atan2(endY - startY, endX - startX) * (180 / math.pi)

					Connector.Parent = GraphingFrame
				end

				LastPoint = Point
				Point.Parent = GraphingFrame

			end

		end

		Busy = false
	end

	return setmetatable({}, {
		__index = function(t,Key)
			return GraphHandler[Key]
		end;
		__newindex = function(t, Key, Value)
			if Key == "Data" and type(Value) == "table" then
				GraphHandler.Data = Value
				GraphHandler.Render()
			elseif Key == "Resolution" and type(Value) == "number" then
				GraphHandler.Resolution = math.clamp(Value, 3, 500)
				GraphHandler.Render()
			elseif Key == "BaselineZero" and type(Value) == "boolean" then
				GraphHandler.BaselineZero = Value
				GraphHandler.Render()
			elseif Key == "HighlightedX" and type(Value) == "number" then
				GraphHandler.HighlightedX = Value
				GraphHandler.Render()
			end
		end;
	})

end


return Graph
