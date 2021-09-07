import { registerAbility } from "../lib/dota_ts_adapter";
import { VectorTargetDirectionAligned } from "./VectorTargetDirectionAligned";

export class MoveInDirection extends VectorTargetDirectionAligned
{
    public constructor(direction: Vector)
    {
        super(direction);
    }

    override Spawn()
    {
        super.Spawn();

        if (IsServer())
        {
            this.SetLevel(1)
        }
    }

    override OnVectorCastStart(start : Vector, direction : Vector)
	{
        const from = this.GetVectorPosition();
        const to = this.GetVector2Position();

        let foundEntity = Entities.FindInSphere(undefined, this.GetVectorPosition(), 256)

        while(foundEntity)
        {
            if(foundEntity.GetClassname().indexOf("npc_dota_hero") >= 0 && foundEntity.GetTeamNumber() === DotaTeam.NOTEAM)
            {
                break;
            }
            foundEntity = Entities.FindInSphere(foundEntity, this.GetVectorPosition(), 256)
        }

        if(!foundEntity) return;

        let directVector = from - to as Vector;
        let directLength = directVector.Length();
        let pathLength = GridNav.FindPathLength(from, to);
        let isDirectPath = Math.abs(pathLength - directLength) < 15

        if (!isDirectPath)
        {
            print(pathLength);
            print(directLength);
            return;
        }

        (foundEntity as CDOTA_BaseNPC).SetInitialGoalPosition(to);
        (foundEntity as CDOTA_BaseNPC).MoveToPosition(to);

    }
}
