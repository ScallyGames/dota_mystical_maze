import { TileSize } from './constants';

const TileToWorldMatrix = [
    [+1 * TileSize,         +1/4 * TileSize],
    [-1/4 * TileSize,   +1 * TileSize],
]

// Inverse TileToWorldMatrix
const WorldToTileMatrix = [
    [+(16/17) / TileSize,     -(4/17) / TileSize],
    [+(4/17) / TileSize,      +(16/17) / TileSize],
]



export function IsValidTileCoord(x : number, y : number)
{

    const size = 3;
    const absX = math.abs(x);
    const absY = math.abs(y);
    const isCorner = (absX + absY) == (size * 2);
    return absX <= 3 && absY <= 3 && !isCorner;
}

export function TileCoordToWorldCoord(x : number, y : number)
{
    return Vector(
        x * TileToWorldMatrix[0][0] + y * TileToWorldMatrix[0][1],
        x * TileToWorldMatrix[1][0] + y * TileToWorldMatrix[1][1]
    );
}
export function WorldCoordToTileIndex(x : number, y : number)
{
    x += 1/8 * TileSize;
    x += TileSize / 2;
    y -= 1/8 * TileSize;
    y += TileSize / 2;
    return Vector(
        Math.floor(x * WorldToTileMatrix[0][0] + y * WorldToTileMatrix[0][1]),
        Math.floor(x * WorldToTileMatrix[1][0] + y * WorldToTileMatrix[1][1])
    );
}

export function AlignToGrid(x : number, gridSize : number)
{
    return Math.round((x + gridSize / 2) / gridSize) * gridSize - gridSize / 2;
}


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
