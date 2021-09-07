import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { BaseVectorAbility } from "../lib/vector_targeting_interface";
import { VectorTargetGridAligned } from "./VectorTargetGridAligned";

export class VectorTargetDirectionAligned extends VectorTargetGridAligned
{
    protected gridSize : number = 512;
    protected direction : Vector;

    public constructor(direction: Vector)
    {
        super();
        this.direction = direction;
    }

    override Spawn()
    {
        if(super.Spawn) super.Spawn();

        this.UpdateNettable(this);
    }

    GetDirection() : Vector
    {
        return this.direction;
    }

    override UpdateNettable(ability : BaseVectorAbility)
    {
        let vectorData = {
            startWidth: ability.GetVectorTargetStartRadius && ability.GetVectorTargetStartRadius(),
            endWidth: ability.GetVectorTargetEndRadius && ability.GetVectorTargetEndRadius(),
            castLength: ability.GetVectorLength && ability.GetVectorLength(),
            castDistance: ability.GetVectorTargetRange && ability.GetVectorTargetRange(),
            dual: ability.IsDualVectorDirection && ability.IsDualVectorDirection(),
            ignoreArrow: ability.IgnoreVectorArrowWidth && ability.IgnoreVectorArrowWidth(),
        };

        if(ability instanceof VectorTargetDirectionAligned)
        {
            const direction = ability.GetDirection();
            (vectorData as any).direction = {
                x: direction.x,
                y: direction.y,
                z: direction.z,
            };
            (vectorData as any).dynamicLength = true;
        }
        CustomNetTables.SetTableValue && CustomNetTables.SetTableValue("vector_targeting" as never, tostring(ability.entindex()), vectorData as never);
    }

    override GetVector2Position() : Vector
    {
        let pos1 = this.GetVectorPosition();
        let pos2 = super.GetVector2Position();
        let projectedLength = Math.max(this.gridSize, ((pos2 - pos1) as Vector).Dot(this.direction))
        return pos1 + this.direction * projectedLength as any;
    }

}
