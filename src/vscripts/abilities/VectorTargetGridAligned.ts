import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { BaseVectorAbility } from "../lib/vector_targeting_interface";
import { AlignToGrid } from "../utils";

@registerAbility()
export class VectorTargetGridAligned extends BaseVectorAbility
{
    protected gridSize : number = 512;

    override GetVectorPosition() : Vector
    {
        return Vector(
            AlignToGrid(this.vectorTargetPosition.x, this.gridSize),
            AlignToGrid(this.vectorTargetPosition.y, this.gridSize),
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
            AlignToGrid(this.vectorTargetPosition2.x, this.gridSize),
            AlignToGrid(this.vectorTargetPosition2.y, this.gridSize),
            this.vectorTargetPosition2.z
        );
    }
}
