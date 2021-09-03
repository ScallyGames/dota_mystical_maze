
---------------------------------------------------------------------------
-- ShuffleListInPlace
---------------------------------------------------------------------------
function ShuffleListInPlace( list, hRandomStream )
	local count = #list
	for i = 1, count do
		local j = 0
		if hRandomStream == nil then
			j = RandomInt( 1, #list )
		else
			j = hRandomStream:RandomInt( 1, #list )
		end
		list[i] , list[j] = list[j] , list[i]
	end
end


---------------------------------------------------------------------------
-- Table functions
---------------------------------------------------------------------------
function PrintTable( t, indent )
	--print( "PrintTable( t, indent ): " )
	if type(t) ~= "table" then return end
	if indent == nil then
		indent = "   "
	end

	for k,v in pairs( t ) do
		if type( v ) == "table" then
			if ( v ~= t ) then
				print( indent .. tostring( k ) .. ":\n" .. indent .. "{" )
				PrintTable( v, indent .. "  " )
				print( indent .. "}" )
			end
		else
		print( indent .. tostring( k ) .. ":" .. tostring(v) )
		end
	end
end

function table.ToStringShallow(t)
	if t == nil then return "nil" end
	
	local s = "{"
	for k,v in pairs(t) do
		s = string.format(" %s %s=%s, ", s, k, v)
	end
	s = s .. "}"
	return s
end

function TableFindKey( table, val )
	if table == nil then
		print( "nil" )
		return nil
	end

	for k, v in pairs( table ) do
		if v == val then
			return k
		end
	end
	return nil
end

function TableLength( t )
	local nCount = 0
	for _ in pairs( t ) do
		nCount = nCount + 1
	end
	return nCount
end

function tablefirstkey( t )
	for k, _ in pairs( t ) do
		return k
	end
	return nil
end

function tablehaselements( t )
	return tablefirstkey( t ) ~= nil
end

---------------------------------------------------------------------------
