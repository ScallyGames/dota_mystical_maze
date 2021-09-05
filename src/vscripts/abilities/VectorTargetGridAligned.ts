import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { BaseVectorAbility } from "../lib/vector_targeting_interface";

@registerAbility()
export class VectorTargetGridAligned extends BaseVectorAbility
{
    protected gridSize : number = 512;

    override GetVectorPosition() : Vector
    {
        return Vector(
            Math.round(this.vectorTargetPosition.x / this.gridSize) * this.gridSize,
            Math.round(this.vectorTargetPosition.y / this.gridSize) * this.gridSize,
            this.vectorTargetPosition.z
        );
    }

    override GetCastRange()
    {
        return 800;
    }

    override GetVectorTargetRange()
    {
        return 9999999999999;
    }

    override GetVector2Position() : Vector
    {
        return Vector(
            Math.round(this.vectorTargetPosition2.x / this.gridSize) * this.gridSize,
            Math.round(this.vectorTargetPosition2.y / this.gridSize) * this.gridSize,
            this.vectorTargetPosition2.z
        );
    }
}
