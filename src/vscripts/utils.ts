export function PrintTable( table: any, indent? : string )
{
	if (type(table) != "table") return;

	if (!indent)
    {
		indent = "   ";
    }

	for(let k in table)
    {
        let v = table[k];
		if (type( v ) == "table")
        {
            if ( v != table )
            {
                print( indent + tostring( k ) + ":\n" + indent + "{" )
                PrintTable( v, indent + "  " )
                print( indent + "}" )
            }
        }
        else
        {
            print( indent + tostring( k ) + ":" + tostring(v) )
        }
    }
}
