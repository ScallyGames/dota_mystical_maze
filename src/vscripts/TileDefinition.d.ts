import { Hero } from "./constants";

export class TileDefinition
{
    name: string;
    exits: {
        north?: ExitDefinition,
        south?: ExitDefinition,
        west?: ExitDefinition,
        east?: ExitDefinition,
    };
    stairs?: StairDefinition[];
}

export class ExitDefinition
{
    type: Hero;
}

export class StairDefinition
{
    connections: Vector[];
}

export type CardinalDirection = "north" | "south" | "east" | "west";
