import { Hero, HeroEnumToHeroString, HeroString, HeroStringToHeroEnum, HeroTargetWeapons, HeroWeapons } from "../constants";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { easeInOutCubic } from "../utils";

@registerAbility()
export class steal_weapons extends BaseAbility
{
    override Spawn()
    {
        if (IsServer())
        {
            this.SetLevel(1);
            this.SetActivated(false);
        }
        (this as any).nextIndex = 0;
    }

    OnSpellStart()
    {
        GameRules.Addon.DidSteal = true;
        GameRules.Addon.DisableCommunication();
        for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
        {
            let player = PlayerResource.GetPlayer(i as PlayerID);
            if(player)
            {
                let hero = player.GetAssignedHero();
                hero.FindAbilityByName('teleport_to_portal')?.SetActivated(false);
                hero.FindAbilityByName('steal_weapons')?.SetActivated(false);

                hero.FindAbilityByName('move_north')?.SetActivated(false);
                hero.FindAbilityByName('move_south')?.SetActivated(false);
                hero.FindAbilityByName('move_west')?.SetActivated(false);
                hero.FindAbilityByName('move_east')?.SetActivated(false);
                hero.FindAbilityByName('traverse_stairs')?.SetActivated(false);
                hero.FindAbilityByName('explore')?.SetActivated(false);
            }
        }

        for(let weaponKey in HeroTargetWeapons)
        {
            let hero = Entities.FindByName(undefined, HeroEnumToHeroString[weaponKey as any as Hero]) as CBaseModelEntity;
            let weapon = Entities.FindByModel(undefined, HeroTargetWeapons[weaponKey as any as Hero]) as CBaseModelEntity;

            if(!weapon || !hero) continue;

            let startPosition = weapon.GetAbsOrigin();
            let targetPosition = hero.GetAttachmentOrigin(6);
            let startingForward = weapon.GetForwardVector();
            let targetForward = hero.GetAttachmentForward(6);
            let transitionTime = 1;
            let currentTransitionTime = 0;
            let stepRate = 1 / 60;

            Timers.CreateTimer(() =>
            {
                let t = easeInOutCubic(currentTransitionTime / transitionTime);
                weapon.SetAbsOrigin(startPosition + (targetPosition - startPosition) * t as Vector);
                let rotationT = t * 0.6;
                let stepForward = startingForward * (1 - rotationT) + targetForward * rotationT as Vector;
                weapon.SetForwardVector(stepForward.Normalized());

                currentTransitionTime += stepRate;
                if(currentTransitionTime >= transitionTime)
                {
                    weapon.FollowEntity(hero, true);

                    for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
                    {
                        let player = PlayerResource.GetPlayer(i as PlayerID);
                        if(player)
                        {
                            let hero = player.GetAssignedHero();
                            hero.FindAbilityByName('move_north')?.SetActivated(true);
                            hero.FindAbilityByName('move_south')?.SetActivated(true);
                            hero.FindAbilityByName('move_west')?.SetActivated(true);
                            hero.FindAbilityByName('move_east')?.SetActivated(true);
                            hero.FindAbilityByName('traverse_stairs')?.SetActivated(true);
                            hero.FindAbilityByName('explore')?.SetActivated(true);
                        }
                    }

                    return;
                }
                else
                {
                    return stepRate;
                }
            })
        }
    }
}
