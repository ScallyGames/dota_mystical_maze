import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { AlignToGrid, equal, isBetweenInclusive, TileCoordToWorldCoord, WorldCoordToTileIndex } from "../utils";
import { GridSize, TileSize } from "../constants";
import { GameMode } from "../GameMode";
import { UnitTargetGridAligned } from "./UnitTargetGridAligned";

@registerAbility()
export class traverse_stairs extends UnitTargetGridAligned
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
                x => equal(x, gridCell, 0.1)
            )
        );

        if(!stairs) return;

        let endGridCell : Vector;

        if(equal(stairs.connections[0], gridCell, 0.1))
        {
            endGridCell = stairs.connections[1];
        }
        else
        {
            endGridCell = stairs.connections[0];
        }

        let endWorldPosition = tileBottomLeft + Vector((0.5 + endGridCell.x) * GridSize, (0.5 + endGridCell.y) * GridSize) as Vector

        let moveDescriptor = {
            start: unitPosition,
            end: endWorldPosition,
            unit: targetUnit,
        };

        if(GameRules.Addon.CharacterEntities.some(x =>
        {
            return moveDescriptor.unit != x && equal(x.GetAbsOrigin(), moveDescriptor.end);
        }))
        {
            return;
        }
        if(GameRules.Addon.CurrentMovements.some(x =>
        {
            if(Math.abs(x.start.x - x.end.x) < 128)
            {
                const isCrossingVertical = Math.abs(x.start.x - moveDescriptor.end.x) < 128 && isBetweenInclusive(moveDescriptor.end.y, x.unit.GetAbsOrigin().y, x.end.y);
                return isCrossingVertical;
            }
            else if(Math.abs(x.start.y - x.end.y) < 128)
            {
                const isCrossingHorizontal = Math.abs(x.start.y - moveDescriptor.end.y) < 128 && isBetweenInclusive(moveDescriptor.end.x, x.unit.GetAbsOrigin().x, x.end.x);
                return isCrossingHorizontal;
            }
            else
            {
                const isCrossingStair = equal(x.start, moveDescriptor.end) || equal(x.end, moveDescriptor.end);
                return isCrossingStair;
            }
        }))
        {
            return;
        }

        targetUnit.MoveToPosition(endWorldPosition);

        GameRules.Addon.CurrentMovements.push(moveDescriptor);
        GameRules.Addon.DisableCommunication();
    }
}
