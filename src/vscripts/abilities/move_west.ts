import { registerAbility } from "../lib/dota_ts_adapter";
import { VectorTargetGridAligned } from "./VectorTargetGridAligned";

@registerAbility()
export class move_west extends VectorTargetGridAligned
{
    Spawn()
    {
        if (IsServer())
        {
            this.SetLevel(1)
        }
    }

    OnVectorCastStart(start : Vector, direction : Vector)
	{
        print(this.GetVectorPosition())
        print(this.GetVector2Position())
    }
}
