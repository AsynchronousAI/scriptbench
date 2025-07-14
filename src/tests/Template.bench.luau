--[[
-- Example Benchmarker.
--
-- This example demonstrates filling a table with a given value and compares
-- starting with a prefilled table, or an empty one.
]]

local SIZE = 25_000 -- not influenced by the benchmark, should be constant.

return {
    Name = "Table Fill",

    Parameter = function()
        --[[
        -- This defines a single argument to be fed to
        -- each of the benchmark functions.
        ]]
        return math.random(1,100)
    end,

    -- These optional functions also exist, and can be used to set up and tear down the environment without
    -- interfering with the benchmark results.
    BeforeAll = function() end,
    AfterAll = function() end,
    BeforeEach = function() end,
    AfterEach = function() end,

    Functions = {
        ["table.create"] = function(lib, value)
            lib.profilebegin("Create")
            local tb = table.create(SIZE)
            lib.profileend()


            lib.profilebegin("Fill")
            for i = 1, SIZE do
                tb[i] = value
            end
            lib.profileend()
        end,
        ["Empty Table"] = function(lib, value)
            lib.profilebegin("Create")
            local tb = {}
            lib.profileend()

            lib.profilebegin("Fill")
            for i = 1, SIZE do
                tb[i] = value
            end
            lib.profileend()
        end,
    }
}
