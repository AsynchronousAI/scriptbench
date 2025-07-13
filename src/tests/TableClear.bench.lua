--[[
This file is for use by Benchmarker (https://boatbomber.itch.io/benchmarker)

|WARNING| THIS RUNS IN YOUR REAL ENVIRONMENT. |WARNING|
--]]

local N = 5000

return {
	ParameterGenerator = function()
		return table.create(N, math.random(10))
	end,

	Functions = {
		["table.clear()"] = function(Profiler, t)
			table.clear(t)
		end,

		["t[key] = nil"] = function(Profiler, t)
			for key in t do
				t[key] = nil
			end
		end,

		["numeric nil"] = function(Profiler, t)
			-- Only works on arrays
			for i = #t, 1, -1 do
				t[i] = nil
			end
		end,
	},
}
