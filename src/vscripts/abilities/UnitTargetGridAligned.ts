import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { AlignToGrid } from "../utils";

@registerAbility()
export class UnitTargetGridAligned extends BaseAbility
{
    protected gridSize : number = 512;

    override GetCursorPosition() : Vector
    {
        let actualClickPosition = super.GetCursorPosition();
        return Vector(
            AlignToGrid(actualClickPosition.x, this.gridSize),
            AlignToGrid(actualClickPosition.y, this.gridSize),
            actualClickPosition.z
        );
    }

    override GetCursorTarget() : CDOTA_BaseNPC | undefined
    {
        return Entities.FindByClassnameWithin(undefined, "npc_dota_hero_*", this.GetCursorPosition(), this.gridSize / 2) as CDOTA_BaseNPC;
    }
}
