import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_hero_selection_transformation extends BaseModifier {
    DeclareFunctions() {
        return [
        ];
    }

    CheckState()
    {
        return {
            [ModifierState.STUNNED] : false,
            [ModifierState.UNSELECTABLE] : true,
            [ModifierState.INVULNERABLE] : true,
            [ModifierState.NOT_ON_MINIMAP] : true,
            [ModifierState.NO_HEALTH_BAR] : true,
            [ModifierState.ATTACK_IMMUNE] : true,
            [ModifierState.MAGIC_IMMUNE] : true,
            [ModifierState.NO_UNIT_COLLISION] : true,
            [ModifierState.NO_TEAM_MOVE_TO] : true,
            [ModifierState.NO_TEAM_SELECT] : true,
            [ModifierState.COMMAND_RESTRICTED] : true,
        }
    }


    IsHidden()
    {
        return false;
    }

    IsPurgable()
    {
        return false;
    }
}
