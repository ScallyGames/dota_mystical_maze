import { TimerDuration } from "../constants";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { easeInCubic, easeInOutCubic, easeInQuad, easeInQuint } from "../utils";
import { UnitTargetGridAligned } from "./UnitTargetGridAligned";

@registerAbility()
export class refresh_timer extends UnitTargetGridAligned
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
        const targetUnit = this.GetCursorTarget();

        if(!targetUnit) return;

        const unitPosition = targetUnit.GetAbsOrigin();

        const hourGlass = Entities.FindByNameWithin(undefined, '*hourglass_model', unitPosition, 512);

        if (!hourGlass || (hourGlass as any).IsUsed) return;

        (hourGlass as any).IsUsed = true;


        const duration = 2;
        let remainingDuration = duration;
        const step = 1 / 60;
        let previousTime: number = GameRules.GetGameTime();
        let baseScale = hourGlass.GetAbsScale();


        for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
        {
            let player = PlayerResource.GetPlayer(i as PlayerID);
            if(player)
            {
                let hero = player.GetAssignedHero();
                hero.FindAbilityByName('teleport_to_portal')?.SetActivated(false);

                hero.FindAbilityByName('move_north')?.SetActivated(false);
                hero.FindAbilityByName('move_south')?.SetActivated(false);
                hero.FindAbilityByName('move_west')?.SetActivated(false);
                hero.FindAbilityByName('move_east')?.SetActivated(false);
                hero.FindAbilityByName('traverse_stairs')?.SetActivated(false);
                hero.FindAbilityByName('explore')?.SetActivated(false);
                hero.FindAbilityByName('refresh_timer')?.SetActivated(false);
            }
        }

        GameRules.Addon.EnableCommunication();

        Timers.CreateTimer(() =>
        {
            let currentTime = GameRules.GetGameTime();
            remainingDuration -= (currentTime - previousTime);

            let t = Math.min(1 - (remainingDuration / duration), 1);

            hourGlass.SetAbsAngles(easeInCubic(t) * 360 * 7, 0, easeInCubic(t) * 360 * 3);
            hourGlass.SetAbsScale((1 - easeInQuint(t)) * baseScale);

            previousTime = currentTime;

            if(remainingDuration >= 0)
            {
                return step;
            }
            else
            {
                hourGlass.Destroy();
                Entities.FindByNameWithin(undefined, '*hourglass_particle', unitPosition, 512)?.Destroy();
                GameRules.Addon.RemainingTime = TimerDuration;
                for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
                {
                    let player = PlayerResource.GetPlayer(i as PlayerID);
                    if(player)
                    {
                        let hero = player.GetAssignedHero();
                        hero.FindAbilityByName('teleport_to_portal')?.SetActivated(!GameRules.Addon.DidSteal);

                        hero.FindAbilityByName('move_north')?.SetActivated(true);
                        hero.FindAbilityByName('move_south')?.SetActivated(true);
                        hero.FindAbilityByName('move_west')?.SetActivated(true);
                        hero.FindAbilityByName('move_east')?.SetActivated(true);
                        hero.FindAbilityByName('traverse_stairs')?.SetActivated(true);
                        hero.FindAbilityByName('explore')?.SetActivated(true);
                        hero.FindAbilityByName('refresh_timer')?.SetActivated(true);
                    }
                }
                return;
            }
        });
    }
}
