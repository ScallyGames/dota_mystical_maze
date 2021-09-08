import { Hero } from "./constants";

export class RoomDefinition
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
