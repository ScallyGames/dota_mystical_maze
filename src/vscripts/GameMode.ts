import { reloadable } from "./lib/tstl-utils";
import { CardinalDirection, TileDefinition } from "./TileDefinition";
import { RoomDefinitions } from './room_tables';
import { equal, MultiplyMatrixWithVectorLinear, RotateByCardinalDirection, TileCoordToWorldCoord, TransformationMatrices } from "./utils";
import { MapVectorKey } from "./data-structures/MapVectorKey";
import { TileInstance } from "./TileInstance";
import { modifier_unlock_ms_cap } from "./modifiers/modifier_unlock_ms_cap";
import { Hero, HeroCharacters, HeroEnumToHeroString, HeroTargetWeapons, HeroWeapons, TimerDuration } from "./constants";

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
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

    public CurrentMovements: { start: Vector, end: Vector, unit: CBaseEntity }[] = [];

    public CharacterEntities: CBaseEntity[] = [];
    public PreviousTime: number = -1;

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheModel(HeroTargetWeapons[Hero.ALCHEMIST], context);
        PrecacheModel(HeroTargetWeapons[Hero.ARCHER], context);
        PrecacheModel(HeroTargetWeapons[Hero.BARBARIAN], context);
        PrecacheModel(HeroTargetWeapons[Hero.WARRIOR], context);
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
            }

            return 0.1;
        });
    }

    // Called on script_reload
    public Reload()
    {
        print("Script reloaded!");
    }

}
