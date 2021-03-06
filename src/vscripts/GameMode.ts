import { reloadable } from "./lib/tstl-utils";
import { CardinalDirection, TileDefinition } from "./TileDefinition";
import { RoomDefinitions } from './room_tables';
import { equal, MultiplyMatrixWithVectorLinear, RotateByCardinalDirection, TileCoordToWorldCoord, TransformationMatrices } from "./utils";
import { MapVectorKey } from "./data-structures/MapVectorKey";
import { TileInstance } from "./TileInstance";
import { modifier_unlock_ms_cap } from "./modifiers/modifier_unlock_ms_cap";
import { Hero, HeroCharacters, HeroEnumToHeroString, HeroTargetWeapons, HeroWeapons, TileSize, TimerDuration } from "./constants";
import { modifier_hero_selection_transformation } from "./modifiers/modifier_hero_selection_transformation";

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public IsAllowingCommunication = true;
    public DidSteal = false;
    public RemainingTime = TimerDuration;
    public IsTimerRunning = false;
    public CharactersOnShop = {
        'warrior': false,
        'barbarian': false,
        'archer': false,
        'alchemist': false,
    };
    private TileStack: TileDefinition[] = [];
    public SpawnedTiles: MapVectorKey<TileInstance> = new MapVectorKey<TileInstance>()
    public MapBounds =
    {
        left: -1024,
        bottom: -1024,
        top: 1024,
        right: 1024,
    }

    public CurrentMovements: { start: Vector, end: Vector, unit: CBaseEntity }[] = [];

    public CharacterEntities: CBaseEntity[] = [];
    public PreviousTime: number = -1;

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheModel(HeroTargetWeapons[Hero.ALCHEMIST], context);
        PrecacheModel(HeroTargetWeapons[Hero.ARCHER], context);
        PrecacheModel(HeroTargetWeapons[Hero.BARBARIAN], context);
        PrecacheModel(HeroTargetWeapons[Hero.WARRIOR], context);
        PrecacheResource("soundfile", "soundevents/custom_sounds.vsndevts", context);
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
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 0);


        GameRules.SetCustomGameSetupRemainingTime(1);
        GameRules.SetHeroSelectionTime(1);
        GameRules.SetHeroSelectPenaltyTime(0);
        GameRules.SetStrategyTime(0);
        GameRules.SetPreGameTime(5);
        GameRules.SetShowcaseTime(0);
        GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        GameRules.GetGameModeEntity().SetUnseenFogOfWarEnabled(false);
        GameRules.GetGameModeEntity().SetDaynightCycleAdvanceRate(0);
        GameRules.GetGameModeEntity().SetDaynightCycleDisabled(true);

        GameRules.GetGameModeEntity().SetCameraDistanceOverride(2048 * 1.5);
        GameRules.GetGameModeEntity().SetCameraZRange(1024, 8192 * 4);

        ListenToGameEvent('npc_spawned', event =>
        {
            let spawnedUnit = event.entindex && EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;

            if(spawnedUnit && spawnedUnit.IsRealHero())
            {
                let controllingPlayer = spawnedUnit.GetPlayerOwner();

                if(controllingPlayer)
                {
                    const abilities = [];
                    let ability0 = spawnedUnit.GetAbilityByIndex(0)?.GetAbilityName()
                    let ability1 = spawnedUnit.GetAbilityByIndex(1)?.GetAbilityName()
                    ability0 && abilities.push(ability0);
                    ability1 && abilities.push(ability1);

                    CustomGameEventManager.Send_ServerToAllClients('player_added_event', {
                        player_id: controllingPlayer.GetPlayerID(),
                        hero_name: spawnedUnit.GetUnitName(),
                        player_name: PlayerResource.GetPlayerName(controllingPlayer.GetPlayerID()),
                        ability_names: abilities,
                    });
                }
            }
        }, undefined);

        CustomGameEventManager.RegisterListener("activate_player_bonk", (player, event) =>
        {
            let hero = PlayerResource.GetSelectedHeroEntity((EntIndexToHScript(player) as CDOTAPlayer).GetPlayerID());
            hero?.SetCursorCastTarget(PlayerResource.GetSelectedHeroEntity(event.target_player_id));
            hero?.FindAbilityByName('do_something')?.OnSpellStart();
        });

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

    public SpawnNextTile(x : number, y : number, direction : CardinalDirection, callback = () => {}) : void
    {
        const tileDefinition = this.TileStack.pop();

        if(!tileDefinition) return;

        let tileInstance = new TileInstance();

        tileInstance.name = tileDefinition.name;
        tileInstance.exits = tileDefinition.exits;
        tileInstance.stairs = tileDefinition.stairs;
        tileInstance.escapeExit = tileDefinition.escapeExit;
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
        if(tileInstance.escapeExit)
        {
            tileInstance.escapeExit.position = RotateByCardinalDirection(tileInstance.escapeExit.position, direction);
            tileInstance.escapeExit.direction = MultiplyMatrixWithVectorLinear(tileInstance.escapeExit.direction, TransformationMatrices[direction]);
        }

        const worldCoordinates = TileCoordToWorldCoord(x, y);
        tileInstance.spawnGroupHandle = DOTA_SpawnMapAtPosition(
            tileDefinition.name + "_" + direction,
            worldCoordinates,
            false,
            () => {},
            () =>
            {
                this.MapBounds.top = math.max(this.MapBounds.top, worldCoordinates.y + TileSize / 2);
                this.MapBounds.right = math.max(this.MapBounds.right, worldCoordinates.x + TileSize / 2);
                this.MapBounds.bottom = math.min(this.MapBounds.bottom, worldCoordinates.y - TileSize / 2);
                this.MapBounds.left = math.min(this.MapBounds.left, worldCoordinates.x - TileSize / 2);

                const mapWidth = this.MapBounds.right - this.MapBounds.left;
                const mapHeight = this.MapBounds.top - this.MapBounds.bottom;
                const mapCenter = {
                    x: (this.MapBounds.right + this.MapBounds.left) / 2,
                    y: (this.MapBounds.top + this.MapBounds.bottom) / 2,
                };
                const squareSize = math.max(mapWidth, mapHeight);

                let netTable =
                {
                    x : x,
                    y : y,
                    worldX : worldCoordinates.x,
                    worldY : worldCoordinates.y,
                    name: tileDefinition.name,
                    direction: direction,
                    occupied: true,
                    mapBounds: {
                        top: mapCenter.y + squareSize / 2,
                        right: mapCenter.x + squareSize / 2,
                        bottom: mapCenter.y - squareSize / 2,
                        left: mapCenter.x - squareSize / 2,
                    },
                }

                CustomNetTables.SetTableValue("minimap_info" as never, "tile_" + x + "_" + y, netTable as never);

                callback();
            },
            this
        )
        this.SpawnedTiles.set(Vector(x, y), tileInstance);
    }

    private StartGame(): void
    {
        print("Game starting!");

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

    private StartGameAfterFirstTile() : void
    {
        CustomGameEventManager.Send_ServerToAllClients<TimerMaxTimeEventData>("timer_set_max_time", {
            max_time: TimerDuration
        });

        const spawnPositions = [
            Vector(0 + 256, 0 + 256, 128),
            Vector(0 + 256, 0 - 256, 128),
            Vector(0 - 256, 0 + 256, 128),
            Vector(0 - 256, 0 - 256, 128),
        ];

        this.ShuffleListInPlace(spawnPositions);

        for(let hero in Hero)
        {
            let heroIndex = Number(hero) as Hero;
            if(!isNaN(heroIndex))
            {
                CreateUnitByNameAsync(HeroCharacters[heroIndex], spawnPositions.pop()!, false, undefined, undefined, DotaTeam.NOTEAM, (x) => {
                    x.SetEntityName(HeroEnumToHeroString[heroIndex]);
                    x.SetAbsAngles(0, 270, 0);
                    x.SetUnitName(HeroEnumToHeroString[heroIndex]);
                    x.AddNewModifier(x, undefined, modifier_unlock_ms_cap.name, {});
                    x.AddNewModifier(x, undefined, modifier_hero_selection_transformation.name, {});

                    this.CharacterEntities.push(x);
                    let weaponModel = Entities.FindByModel(undefined, HeroWeapons[heroIndex]) as CBaseModelEntity;

                    weaponModel?.Destroy();
                });
            }
        }

        let cameraTarget = Entities.FindByName(undefined, "camera_position_inital");
        for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
        {
            PlayerResource.SetCameraTarget(i as PlayerID, cameraTarget);
        }
        cameraTarget?.Destroy();


        Timers.CreateTimer(() =>
        {
            for(let i = this.CurrentMovements.length - 1; i >= 0; i--)
            {
                let x = this.CurrentMovements[i];
                if(equal(x.unit.GetAbsOrigin(), x.end, 64))
                {
                    this.CurrentMovements.splice(i, 1);
                }
            }

            if(this.IsTimerRunning)
            {

            let currentTime = GameRules.GetGameTime();
            if(this.PreviousTime > 0)
            {
                this.RemainingTime -= (currentTime - this.PreviousTime);
                CustomGameEventManager.Send_ServerToAllClients<TimerTickEventData>("timer_tick", {
                    remaining_time: this.RemainingTime
                });
                if(this.RemainingTime <= 0)
                {
                    this.RemainingTime = 0;
                    GameRules.SetCustomVictoryMessage("\nYour time ran out. \nTry again!");
                    GameRules.SetGameWinner(DotaTeam.BADGUYS);
                }
            }
            this.PreviousTime = currentTime;

                let props = Entities.FindAllByName('*_weapon_anchor');
                for(let i = 0; i < props.length; i++)
                {
                    props[i].SetAbsAngles(0, currentTime * 90, 0);
                }
            }

            return 0.1;
        });
    }

    public DisableCommunication()
    {
        if(!this.IsAllowingCommunication) return;

        for (let i = 0 as PlayerID; i < 4; i++)
        {
            PlayerResource.GetPlayer(i)?.SetTeam(DOTA_TEAM_CUSTOM_MIN + i);
        }
        this.IsAllowingCommunication = false;
        CustomGameEventManager.Send_ServerToAllClients('communication_deactivated', {} as never);
    }

    public EnableCommunication()
    {
        for (let i = 0 as PlayerID; i < 4; i++)
        {
            PlayerResource.GetPlayer(i)?.SetTeam(DotaTeam.GOODGUYS);
        }
        this.IsAllowingCommunication = true;

        CustomGameEventManager.Send_ServerToAllClients('communication_activated', {} as never);
    }

    // Called on script_reload
    public Reload()
    {
        print("Script reloaded!");
    }

}
