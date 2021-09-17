import { TimerDuration } from "../constants";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { easeInCubic, easeInOutCubic, easeInQuad, easeInQuint } from "../utils";

@registerAbility()
export class refresh_timer extends BaseAbility
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

        print(hourGlass);

        if (!hourGlass || (hourGlass as any).IsUsed) return;

        (hourGlass as any).IsUsed = true;


        const duration = 2;
        let remainingDuration = duration;
        const step = 1 / 60;
        let previousTime: number = GameRules.GetGameTime();
        let baseScale = hourGlass.GetAbsScale();

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
                return;
            }
        });
    }
}
