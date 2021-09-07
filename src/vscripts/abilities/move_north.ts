import { registerAbility } from "../lib/dota_ts_adapter";
import { MoveInDirection } from "./MoveInDirection";

@registerAbility()
export class move_north extends MoveInDirection
{
    public constructor()
    {
        super(Vector(0, 1, 0));
    }
}
