import { CardinalDirection, EscapeExitDefinition, ExitDefinition, StairDefinition } from "./TileDefinition";

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
    escapeExit?: EscapeExitDefinition;
    spawnGroupHandle: number = -1;
}
