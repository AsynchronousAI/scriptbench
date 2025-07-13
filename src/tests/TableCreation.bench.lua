--[[
This file is for use by Benchmarker (https://boatbomber.itch.io/benchmarker)

|WARNING| THIS RUNS IN YOUR REAL ENVIRONMENT. |WARNING|
--]]

local N = 5000

return {
	ParameterGenerator = function()
		return math.random(1000) / 10
	end,

	Functions = {
		["table.create()"] = function(Profiler, RandomNumber)
			Profiler.Begin("init")
			local t = table.create(N)
			Profiler.End()

			Profiler.Begin("fill")
			for i = 1, N do
				t[i] = RandomNumber
			end
			Profiler.End()
		end,

		["t = {}"] = function(Profiler, RandomNumber)
			Profiler.Begin("init")
			local t = {}
			Profiler.End()

			Profiler.Begin("fill")
			for i = 1, N do
				t[i] = RandomNumber
			end
			Profiler.End()
		end,
	},
}
