local Plugin = script.Parent.Parent.Parent
local TS = require(Plugin.include.RuntimeLib)

local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

type Callback<Args..., Rets...> = (Args...) -> Rets...

local function useFreshCallback<Args..., Rets...>(
	-- stylua: ignore
	callback: Callback<Args..., Rets...>,
	deps: { any }?
): Callback<Args..., Rets...>
	local ref = React.useRef(callback) :: { current: Callback<Args..., Rets...> }

	React.useEffect(function()
		ref.current = callback
	end, deps)

	return function(...)
		return ref.current(...)
	end
end

return useFreshCallback
