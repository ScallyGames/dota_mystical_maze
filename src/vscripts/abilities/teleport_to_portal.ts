import { HeroCharacters, HeroString, HeroStringToHeroEnum } from "../constants";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";

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

        if(!figure) return;

        figure.SetAbsOrigin(target.GetAbsOrigin() + Vector(0, 0, 92) as Vector);
        GameRules.Addon.IsTimerRunning = true;
    }
}
