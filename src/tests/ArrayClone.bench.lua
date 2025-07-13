--[[
This file is for use by Benchmarker (https://boatbomber.itch.io/benchmarker)

|WARNING| THIS RUNS IN YOUR REAL ENVIRONMENT. |WARNING|
--]]

local ARRAY_SIZE = 3000

return {
	ParameterGenerator = function()
		local arr = table.create(ARRAY_SIZE)
		for i = 1, ARRAY_SIZE do
			arr[i] = math.random(10000)
		end
		return table.freeze(arr)
	end,

	Functions = {
		["table.clone"] = function(Profiler, arr)
			local copy = table.clone(arr)
		end,

		["table.move"] = function(Profiler, arr)
			Profiler.Begin("length")
			local len = #arr
			Profiler.End()

			Profiler.Begin("create")
			local copy = table.create(len)
			Profiler.End()

			Profiler.Begin("move")
			table.move(arr, 1, len, 1, copy)
			Profiler.End()
		end,

		["gen-iter"] = function(Profiler, arr)
			Profiler.Begin("create")
			local copy = table.create(#arr)
			Profiler.End()
			Profiler.Begin("iter")
			for k, v in arr do
				copy[k] = v
			end
			Profiler.End()
		end,

		["numeric-iter"] = function(Profiler, arr)
			Profiler.Begin("create")
			local copy = table.create(#arr)
			Profiler.End()
			Profiler.Begin("iter")
			for i = 1, #arr do
				copy[i] = arr[i]
			end
			Profiler.End()
		end,

		["table.unpack"] = function(Profiler, arr)
			local copy = { table.unpack(arr) }
		end,
	},
}
