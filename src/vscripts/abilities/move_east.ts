import { registerAbility } from "../lib/dota_ts_adapter";
import { MoveInDirection } from "./MoveInDirection";

@registerAbility()
export class move_east extends MoveInDirection
{
    public constructor()
    {
        super(Vector(+1, 0, 0));
    }
}
