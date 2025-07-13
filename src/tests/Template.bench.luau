--[[
-- Example Benchmarker.
]]

local SIZE = 1000
return {
    Parameters = function()
        --[[
        -- This defines a single argument to be fed to
        -- each of the benchmark functions.
        ]]
        return math.random(1,100)
    end,

    Functions = {
        ["table.create"] = function(value)
            local tb = table.create(SIZE)
            for i = 1, SIZE do
                tb[i] = value
            end
        end,
        ["Empty Table"] = function(value)
            local tb = {}
            for i = 1, SIZE do
                tb[i] = value
            end
        end,
    }
}
