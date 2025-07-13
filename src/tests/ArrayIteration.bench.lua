--[[
This file is for use by Benchmarker (https://boatbomber.itch.io/benchmarker)

|WARNING| THIS RUNS IN YOUR REAL ENVIRONMENT. |WARNING|
--]]

local ARRAY_SIZE = 3000

local __ipairs = ipairs
local __pairs = pairs
local __next = next

return {
	ParameterGenerator = function()
		local len = math.random(ARRAY_SIZE * 0.7, ARRAY_SIZE * 1.3)
		return table.create(len, math.random(10))
	end,

	Functions = {
		["gen-iter"] = function(Profiler, arr)
			for Index, Value in arr do
				local _ = Index + Value
			end
		end,

		["ipairs"] = function(Profiler, arr)
			for Index, Value in ipairs(arr) do
				local _ = Index + Value
			end
		end,

		["local ipairs"] = function(Profiler, arr)
			for Index, Value in __ipairs(arr) do
				local _ = Index + Value
			end
		end,

		["pairs"] = function(Profiler, arr)
			for Index, Value in pairs(arr) do
				local _ = Index + Value
			end
		end,

		["local pairs"] = function(Profiler, arr)
			for Index, Value in __pairs(arr) do
				local _ = Index + Value
			end
		end,

		["next"] = function(Profiler, arr)
			for Index, Value in next, arr do
				local _ = Index + Value
			end
		end,

		["local next"] = function(Profiler, arr)
			for Index, Value in __next, arr do
				local _ = Index + Value
			end
		end,

		["numeric #length"] = function(Profiler, arr)
			for Index = 1, #arr do
				local Value = arr[Index]
				local _ = Index + Value
			end
		end
	},
}
