type CardinalDirection = "north" | "south" | "east" | "west";

type Vector = { x?: number, y?: number, z?: number }

const TileToWorldMatrix = [
    [+1,     +1/4],
    [-1/4,   +1],
]

// Inverse TileToWorldMatrix
const WorldToTileMatrix = [
    [+(16/17),     -(4/17)],
    [+(4/17),      +(16/17)],
]



const TransformationMatrices = {
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

function MultiplyMatrixWithVectorLinear(vector : Vector, matrix : number[][])
{
    return {
        x: vector.x! * matrix[0][0] + vector.y! * matrix[0][1],
        y: vector.x! * matrix[1][0] + vector.y! * matrix[1][1],
        z: vector.z
    };
}

function MultiplyMatrixWithVectorAffine(vector : Vector, matrix : number[][])
{
    return {
        x: vector.x! * matrix[0][0] + vector.y! * matrix[0][1] + vector.z! * matrix[0][2],
        y: vector.x! * matrix[1][0] + vector.y! * matrix[1][1] + vector.z! * matrix[1][2],
        z: vector.x! * matrix[2][0] + vector.y! * matrix[2][1] + vector.z! * matrix[2][2],
    };
}
