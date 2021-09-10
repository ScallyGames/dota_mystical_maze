import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_unlock_ms_cap extends BaseModifier {
    DeclareFunctions() {
        return [
            ModifierFunction.IGNORE_MOVESPEED_LIMIT,
        ];
    }

    GetModifierIgnoreMovespeedLimit() : (0 | 1)
    {
        return 1;
    }

    IsHidden() {
        return true;
    }

    IsDebuff() {
        return false;
    }

    IsPurgable() {
        return false;
    }
}
