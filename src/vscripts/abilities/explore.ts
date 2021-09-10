import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { AlignToGrid, TileCoordToWorldCoord, WorldCoordToTileIndex } from "../utils";
import { GridSize, HeroCharacters, TileSize } from "../constants";
import { CardinalDirection } from "../TileDefinition";

@registerAbility()
export class explore extends BaseAbility
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
        const gameMode = GameRules.Addon;

        const targetUnit = this.GetCursorTarget();

        if(!targetUnit) return;

        const unitPosition = targetUnit.GetAbsOrigin();
        const tileIndex = WorldCoordToTileIndex(unitPosition.x, unitPosition.y);

        const unitTile = gameMode.SpawnedTiles.get(tileIndex);

        if(!unitTile) return;

        const tileBottomLeft = TileCoordToWorldCoord(tileIndex.x, tileIndex.y) - Vector(TileSize / 2, TileSize / 2) as Vector;
        const offsetFromBottomLeft = unitPosition - tileBottomLeft as Vector;
        const gridCell = Vector(
            (AlignToGrid(offsetFromBottomLeft.x, GridSize) - GridSize / 2) / GridSize,
            (AlignToGrid(offsetFromBottomLeft.y, GridSize) - GridSize / 2) / GridSize,
        )

        let direction : CardinalDirection;

        if(gridCell.x == 2 && gridCell.y == 3)
        {
            direction = "north";
        }
        else if(gridCell.x == 1 && gridCell.y == 0)
        {
            direction = "south";
        }
        else if(gridCell.x == 0 && gridCell.y == 2)
        {
            direction = "west";
        }
        else if(gridCell.x == 3 && gridCell.y == 1)
        {
            direction = "east";
        }
        else
        {
            return;
        }

        if(!unitTile.exits[direction]) return;

        if(HeroCharacters[unitTile.exits[direction]!.type] !== targetUnit.GetClassname()) return;

        let spawnIndex : Vector;
        switch(direction)
        {
            case "north":
                spawnIndex = tileIndex + Vector(0, +1) as Vector;
                break;
            case "south":
                spawnIndex = tileIndex + Vector(0, -1) as Vector;
                break;
            case "west":
                spawnIndex = tileIndex + Vector(-1, 0) as Vector;
                break;
            case "east":
                spawnIndex = tileIndex + Vector(+1, 0) as Vector;
                break;
        }

        gameMode.SpawnNextTile(spawnIndex.x, spawnIndex.y, direction);
    }
}
