import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { BaseVectorAbility } from "../lib/vector_targeting_interface";

@registerAbility()
export class VectorTargetGridAligned extends BaseVectorAbility
{
    protected gridSize : number = 512;

    override GetVectorPosition() : Vector
    {
        return Vector(
            Math.round((this.vectorTargetPosition.x + this.gridSize / 2) / this.gridSize) * this.gridSize - this.gridSize / 2,
            Math.round((this.vectorTargetPosition.y + this.gridSize / 2) / this.gridSize) * this.gridSize - this.gridSize / 2,
            this.vectorTargetPosition.z
        );
    }

    override GetVectorLength()
    {
        return this.gridSize;
    }

    override GetVectorTargetRange()
    {
        return 9999999999999;
    }

    override GetVector2Position() : Vector
    {
        return Vector(
            Math.round((this.vectorTargetPosition2.x + this.gridSize / 2)  / this.gridSize) * this.gridSize - this.gridSize / 2,
            Math.round((this.vectorTargetPosition2.y + this.gridSize / 2)  / this.gridSize) * this.gridSize - this.gridSize / 2,
            this.vectorTargetPosition2.z
        );
    }
}
