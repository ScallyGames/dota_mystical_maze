import { HeroCharacters, HeroString, HeroStringToHeroEnum } from "../constants";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { equal, isBetweenInclusive } from "../utils";

@registerAbility()
export class teleport_to_portal extends BaseAbility
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

        const target = this.GetCursorTarget();

        if(!target) return;

        const portalName = target.GetName();

        const figureName = string.match(portalName, '^.*_portal_target_(.*)$')[0] as HeroString;

        const figure = Entities.FindByClassname(undefined, HeroCharacters[HeroStringToHeroEnum[figureName]]);

        const targetPosition = target.GetAbsOrigin();

        if(!figure) return;

        if(GameRules.Addon.CharacterEntities.some(x =>
        {
            return equal(x.GetAbsOrigin(), targetPosition);
        }))
        {
            return;
        }
        if(GameRules.Addon.CurrentMovements.some(x =>
        {
            if(Math.abs(x.start.x - x.end.x) < 128)
            {
                const isCrossingVertical = Math.abs(x.start.x - targetPosition.x) < 128 && isBetweenInclusive(targetPosition.y, x.unit.GetAbsOrigin().y, x.end.y);
                return isCrossingVertical;
            }
            else if(Math.abs(x.start.y - x.end.y) < 128)
            {
                const isCrossingHorizontal = Math.abs(x.start.y - targetPosition.y) < 128 && isBetweenInclusive(targetPosition.x, x.unit.GetAbsOrigin().x, x.end.x);
                return isCrossingHorizontal;
            }
            else
            {
                const isCrossingStair = equal(x.end, targetPosition);
                return isCrossingStair;
            }
        }))
        {
            return;
        }

        figure.SetAbsOrigin(target.GetAbsOrigin() + Vector(0, 0, 92) as Vector);
        GameRules.Addon.DisableCommunication();
        GameRules.Addon.IsTimerRunning = true;
    }
}
