--[[
This file is for use by Benchmarker (https://boatbomber.itch.io/benchmarker)

|WARNING| THIS RUNS IN YOUR REAL ENVIRONMENT. |WARNING|
--]]

local ARRAY_SIZE = 3000

return {
	ParameterGenerator = function()
		return
	end,

	Functions = {
		["t[i]"] = function(Profiler)
			Profiler.Begin("create")
			local arr = table.create(ARRAY_SIZE)
			Profiler.End()
			Profiler.Begin("fill")
			for i = 1, ARRAY_SIZE do
				arr[i] = math.random(10000)
			end
			Profiler.End()
		end,

		["table.insert"] = function(Profiler)
			Profiler.Begin("create")
			local arr = table.create(ARRAY_SIZE)
			Profiler.End()
			Profiler.Begin("fill")
			for i = 1, ARRAY_SIZE do
				table.insert(arr, math.random(10000))
			end
			Profiler.End()
		end,

		["t[#t+1]"] = function(Profiler)
			Profiler.Begin("create")
			local arr = table.create(ARRAY_SIZE)
			Profiler.End()
			Profiler.Begin("fill")
			for i = 1, ARRAY_SIZE do
				arr[#arr + 1] = math.random(10000)
			end
			Profiler.End()
		end,
	},
}
