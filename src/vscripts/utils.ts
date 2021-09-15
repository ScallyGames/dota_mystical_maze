import { TileSize } from './constants';
import { CardinalDirection } from './TileDefinition';

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

export function RotateByCardinalDirection(position : Vector, direction : CardinalDirection)
{
    const coordinateSystemTranslationMatrix =
    [
        [1, 0, 1.5],
        [0, 1, 1.5],
        [0, 0, 1],
    ];

    const inverseCoordinateSystemTranslationMatrix =
    [
        [1, 0, -1.5],
        [0, 1, -1.5],
        [0, 0, 1],
    ];

    const transformationMatrices = {
        north: [
            [1, 0],
            [0, 1],
        ],
        south: [
            [-1, 0],
            [0, -1],
        ],
        west: [
            [0, -1],
            [+1, 0],
        ],
        east: [
            [0, +1],
            [-1, 0],
        ],
    };

    position.z = 1;
    let inOrigin = MultiplyMatrixWithVectorAffine(position, inverseCoordinateSystemTranslationMatrix);
    let rotatedInOrigin = MultiplyMatrixWithVectorLinear(inOrigin, transformationMatrices[direction]);
    let rotatedInOriginalSystem = MultiplyMatrixWithVectorAffine(rotatedInOrigin, coordinateSystemTranslationMatrix);
    return rotatedInOriginalSystem;
}

export function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function isBetweenInclusive(x : number, min: number, max: number)
{
    if(min > max)
    {
        [min, max] = [max, min];
    }

    return x >= min && x <= max;
}

export function equal(a : Vector, b : Vector, epsilon : number = 128)
{
    return (a - b as Vector).Length2D() < epsilon;
}

export function MultiplyMatrixWithVectorLinear(vector : Vector, matrix : number[][])
{
    return Vector(
        vector.x * matrix[0][0] + vector.y * matrix[0][1],
        vector.x * matrix[1][0] + vector.y * matrix[1][1],
        vector.z
    );
}

export function MultiplyMatrixWithVectorAffine(vector : Vector, matrix : number[][])
{
    return Vector(
        vector.x * matrix[0][0] + vector.y * matrix[0][1] + vector.z * matrix[0][2],
        vector.x * matrix[1][0] + vector.y * matrix[1][1] + vector.z * matrix[1][2],
        vector.x * matrix[2][0] + vector.y * matrix[2][1] + vector.z * matrix[2][2],
    );
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
