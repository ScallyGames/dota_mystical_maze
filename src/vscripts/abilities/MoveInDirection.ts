import { registerAbility } from "../lib/dota_ts_adapter";
import { equal, isBetweenInclusive } from "../utils";
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

        if(math.abs(GetGroundHeight(from, undefined) - GetGroundHeight(to, undefined)) > 16)
        {
            return;
        }

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

        let directVector = to - from as Vector;
        let directLength = directVector.Length();
        let pathLength = GridNav.FindPathLength(from, to);
        let isDirectPath = Math.abs(pathLength - directLength) < 15

        if (!isDirectPath) return;

        let moveDescriptor = {
            start: from,
            end: to,
            unit: foundEntity,
        };

        let gridSteps = directLength / this.gridSize;

        for(let i = 0; i <= gridSteps; i++)
        {
            let location = from + directVector * i / gridSteps as Vector;
            if(GameRules.Addon.CharacterEntities.some(x =>
            {
                return moveDescriptor.unit != x && equal(x.GetAbsOrigin(), location);
            }))
            {
                return;
            }
            if(GameRules.Addon.CurrentMovements.some(x =>
            {
                if(Math.abs(x.start.x - x.end.x) < 128)
                {
                    const isCrossingVertical = Math.abs(x.start.x - location.x) < 128 && isBetweenInclusive(location.y, x.unit.GetAbsOrigin().y, x.end.y);
                    return isCrossingVertical;
                }
                else if(Math.abs(x.start.y - x.end.y) < 128)
                {
                    const isCrossingHorizontal = Math.abs(x.start.y - location.y) < 128 && isBetweenInclusive(location.x, x.unit.GetAbsOrigin().x, x.end.x);
                    return isCrossingHorizontal;
                }
                else
                {
                    const isCrossingStair = equal(x.end, location);
                    return isCrossingStair;
                }
            }))
            {
                return;
            }
        }

        (foundEntity as CDOTA_BaseNPC).SetInitialGoalPosition(to);
        (foundEntity as CDOTA_BaseNPC).MoveToPosition(to);
        GameRules.Addon.CurrentMovements.push(moveDescriptor);
        GameRules.Addon.IsTimerRunning = true;
        GameRules.Addon.DisableCommunication();
    }
}
