import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { AlignToGrid, TileCoordToWorldCoord, WorldCoordToTileIndex } from "../utils";
import { GridSize, HeroCharacters, TileSize } from "../constants";
import { CardinalDirection } from "../TileDefinition";

@registerAbility()
export class do_something extends BaseAbility
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
        CustomGameEventManager.Send_ServerToAllClients("player_bonked", {
            target_player_id: this.GetCursorTarget()?.GetPlayerOwnerID()!,
        });
    }
}
