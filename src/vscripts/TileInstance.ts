import { CardinalDirection, ExitDefinition, StairDefinition } from "./TileDefinition";

export class TileInstance
{
    name: string = "";
    direction: CardinalDirection = "north";
    exits: {
        north?: ExitDefinition,
        south?: ExitDefinition,
        west?: ExitDefinition,
        east?: ExitDefinition,
    } = {};
    stairs?: StairDefinition[];
    spawnGroupHandle: number = -1;
}
