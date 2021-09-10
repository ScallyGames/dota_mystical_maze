import { reloadable } from "./lib/tstl-utils";
import { CardinalDirection, TileDefinition } from "./TileDefinition";
import { RoomDefinitions } from './room_tables';
import { IsValidTileCoord, RotateByCardinalDirection, TileCoordToWorldCoord } from "./utils";
import { MapVectorKey } from "./data-structures/MapVectorKey";
import { TileInstance } from "./TileInstance";
import { modifier_unlock_ms_cap } from "./modifiers/modifier_unlock_ms_cap";

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {

    private TileStack: TileDefinition[] = [];
    public SpawnedTiles: MapVectorKey<TileInstance> = new MapVectorKey<TileInstance>()

    public static Precache(this: void, context: CScriptPrecacheContext)
    {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void)
    {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor()
    {
        this.configure();

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);

        // Register event listeners for events from the UI
        CustomGameEventManager.RegisterListener("ui_panel_closed", (_, data) => {
            print(`Player ${data.PlayerID} has closed their UI panel.`);

            // Respond by sending back an example event
            const player = PlayerResource.GetPlayer(data.PlayerID)!;
            CustomGameEventManager.Send_ServerToPlayer(player, "example_event", {
                myNumber: 42,
                myBoolean: true,
                myString: "Hello!",
                myArrayOfNumbers: [1.414, 2.718, 3.142]
            });

        });
    }

    private GetValidTeamPlayers()
    {
        let out: (CDOTAPlayer | undefined)[] = [];
        for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
        {
            if (PlayerResource.IsValidTeamPlayer(i))
            {
                out[i] = PlayerResource.GetPlayer(i);
            }
            else {
                out[i] = undefined;
            }
        }

        return out;
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 4);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 1);


        GameRules.SetCustomGameSetupRemainingTime(1);
        GameRules.SetHeroSelectionTime(1);
        GameRules.SetHeroSelectPenaltyTime(0);
        GameRules.SetStrategyTime(0);
        GameRules.SetPreGameTime(5);
        GameRules.SetShowcaseTime(0);
        GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        GameRules.GetGameModeEntity().SetUnseenFogOfWarEnabled(false);

        GameRules.GetGameModeEntity().SetCameraDistanceOverride(2048);
        GameRules.GetGameModeEntity().SetCameraZRange(10, 8192);

        this.initilaizeRooms();
    }

    private initilaizeRooms()
    {
        this.TileStack = RoomDefinitions;

        let startingRoom = this.TileStack.shift();


        this.ShuffleListInPlace(this.TileStack);

        if (startingRoom)
        {
            this.TileStack.push(startingRoom);

        }

    }

    public GetNextTile()
    {
        return this.TileStack.pop();
    }

    public ShuffleListInPlace<T>( list : T[], hRandomStream? : { RandomInt(from: number, to: number) : number })
    {
        let count = list.length
        for (let i = 0; i < count; i++)
        {
            let j = 0
            if (!hRandomStream)
            {
                j = RandomInt(0, list.length - 1)
            }
            else {
                j = hRandomStream.RandomInt(0, list.length - 1)
            }

            [list[i], list[j]] = [list[j], list[i]];
        }
    }


    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // // Add 4 bots to lobby in tools
        // if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP)
        // {
        //     for (let i = 0; i < 4; i++)
        //     {
        //         Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
        //     }
        // }

        // if (state === GameState.CUSTOM_GAME_SETUP)
        // {
        //     // Automatically skip setup in tools
        //     if (IsInToolsMode())
        //     {
        //         Timers.CreateTimer(3, () => {
        //             GameRules.FinishCustomGameSetup();
        //         });
        //     }
        // }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME)
        {
            Timers.CreateTimer(0.2, () => this.StartGame());
        }

        if (state === GameState.HERO_SELECTION)
        {
            for (let player of this.GetValidTeamPlayers())
            {
                if (player)
                {
                    player.MakeRandomHeroSelection()
                }
            }
        }
    }

    private StartGame(): void
    {
        if (IsServer())
        {
            if(this.TileStack.length > 0)
            {
                this.SpawnNextTile(0, 0, "north", () =>
                {
                    this.StartGameAfterFirstTile();
                });
            }
        }
    }

    public SpawnNextTile(x : number, y : number, direction : CardinalDirection, callback = () => {}) : void
    {
        const tileDefinition = this.TileStack.pop();

        if(!tileDefinition) return;

        let tileInstance = new TileInstance();

        tileInstance.name = tileDefinition.name;
        tileInstance.exits = tileDefinition.exits;
        tileInstance.stairs = tileDefinition.stairs;
        tileInstance.direction = direction;
        switch(direction)
        {
            case "east":
                {
                    let prevNorth = tileInstance.exits.north;
                    tileInstance.exits.north = tileInstance.exits.west;
                    tileInstance.exits.west = tileInstance.exits.south;
                    tileInstance.exits.south = tileInstance.exits.east;
                    tileInstance.exits.east = prevNorth;
                }
                break;
            case "south":
                {
                    let prevNorth = tileInstance.exits.north;
                    tileInstance.exits.north = tileInstance.exits.south;
                    tileInstance.exits.south = prevNorth;
                    let prevWest = tileInstance.exits.west;
                    tileInstance.exits.west = tileInstance.exits.east;
                    tileInstance.exits.east = prevWest;
                }
                break;
            case "west":
                {
                    let prevNorth = tileInstance.exits.north;
                    tileInstance.exits.north = tileInstance.exits.east;
                    tileInstance.exits.east = tileInstance.exits.south;
                    tileInstance.exits.south = tileInstance.exits.west;
                    tileInstance.exits.west = prevNorth;
                }
                break;
        }
        if(tileInstance.stairs)
        {
            tileInstance.stairs = tileInstance.stairs.map(x =>
            {
                return {
                    connections: x.connections.map(p => RotateByCardinalDirection(p, direction))
                }
            });
        }

        tileInstance.spawnGroupHandle = DOTA_SpawnMapAtPosition(
            tileDefinition.name + "_" + direction,
            TileCoordToWorldCoord(x, y),
            false,
            () => {},
            () => {
                callback();
            },
            this
        )
        this.SpawnedTiles.set(Vector(x, y), tileInstance);
    }

    private StartGameAfterFirstTile(): void
    {
        print("Game starting!");
        const spawnPositions = [
            Vector(0 + 256, 0 + 256, 128),
            Vector(0 + 256, 0 - 256, 128),
            Vector(0 - 256, 0 + 256, 128),
            Vector(0 - 256, 0 - 256, 128),
        ];

        this.ShuffleListInPlace(spawnPositions);

        const warriorHero = CreateUnitByNameAsync("npc_dota_hero_juggernaut", spawnPositions.pop()!, false, undefined, undefined, DotaTeam.NOTEAM, (x) => {
            x.AddNewModifier(x, undefined, modifier_unlock_ms_cap.name, {})
        })
        const barbarianHero = CreateUnitByNameAsync("npc_dota_hero_axe", spawnPositions.pop()!, false, undefined, undefined, DotaTeam.NOTEAM, (x) => {
            x.AddNewModifier(x, undefined, modifier_unlock_ms_cap.name, {})
        })
        const archerHero = CreateUnitByNameAsync("npc_dota_hero_windrunner", spawnPositions.pop()!, false, undefined, undefined, DotaTeam.NOTEAM, (x) => {
            x.AddNewModifier(x, undefined, modifier_unlock_ms_cap.name, {})
        })
        const alchemistHero = CreateUnitByNameAsync("npc_dota_hero_storm_spirit", spawnPositions.pop()!, false, undefined, undefined, DotaTeam.NOTEAM, (x) => {
            x.AddNewModifier(x, undefined, modifier_unlock_ms_cap.name, {})
        })
    }

    // Called on script_reload
    public Reload()
    {
        print("Script reloaded!");
    }

}
