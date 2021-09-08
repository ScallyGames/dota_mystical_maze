import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { AlignToGrid, TileCoordToWorldCoord, WorldCoordToTileIndex } from "../utils";
import { GridSize, TileSize } from "../constants";
import { GameMode } from "../GameMode";

@registerAbility()
export class traverse_stairs extends BaseAbility
{
    override Spawn()
    {
        if (IsServer())
        {
            this.SetLevel(1)
        }
    }

    OnSpellStart()
    {
        const spawnedTiles = GameRules.Addon.SpawnedTiles;
        const targetUnit = this.GetCursorTarget();

        if(!targetUnit) return;

        const unitPosition = targetUnit.GetAbsOrigin();
        const tileIndex = WorldCoordToTileIndex(unitPosition.x, unitPosition.y);

        const unitTile = GameRules.Addon.SpawnedTiles.get(tileIndex);

        if(!unitTile) return;

        const tileBottomLeft = TileCoordToWorldCoord(tileIndex.x, tileIndex.y) - Vector(TileSize / 2, TileSize / 2) as Vector;
        const offsetFromBottomLeft = unitPosition - tileBottomLeft as Vector;
        const gridCell = Vector(
            (AlignToGrid(offsetFromBottomLeft.x, GridSize) - GridSize / 2) / GridSize,
            (AlignToGrid(offsetFromBottomLeft.y, GridSize) - GridSize / 2) / GridSize,
        )

        if(!unitTile.stairs) return;

        let stairs = unitTile.stairs.find(
            s => s.connections.some(
                x => ((x - gridCell) as Vector).Length2D() < 0.1
            )
        );

        if(!stairs) return;

        let endGridCell : Vector;

        if(((stairs.connections[0] - gridCell) as Vector).Length2D() < 0.1)
        {
            endGridCell = stairs.connections[1];
        }
        else
        {
            endGridCell = stairs.connections[0];
        }

        let endWorldPosition = tileBottomLeft + Vector((0.5 + endGridCell.x) * GridSize, (0.5 + endGridCell.y) * GridSize) as Vector
        targetUnit.MoveToPosition(endWorldPosition);
    }
}
