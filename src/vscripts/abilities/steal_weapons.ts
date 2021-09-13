import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";

@registerAbility()
export class steal_weapons extends BaseAbility
{
    override Spawn()
    {
        if (IsServer())
        {
            this.SetLevel(1)
            this.SetActivated(false);
        }
    }

    OnSpellStart()
    {
        print('Stealing');
    }
}
