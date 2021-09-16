import { registerEntityFunction } from "./lib/dota_ts_adapter";

registerEntityFunction('OnExitAreaEntered', (trigger: any) =>
{
    if(!GameRules.Addon.DidSteal) return;

    // Activator -> Who entered the trigger
    // Caller -> Trigger
    let portal = Entities.FindByNameNearest('*portal_exit_particle', trigger.caller.GetAbsOrigin(), 1024);

    if(!portal)
    {
        print('Error: no portal found');
        return;
    }

    const portalLocation = portal.GetAbsOrigin();
    (trigger.activator as CDOTA_BaseNPC).SetInitialGoalPosition(portalLocation);
    (trigger.activator as CDOTA_BaseNPC).MoveToPosition(portalLocation);
});


registerEntityFunction('OnExitAreaPortal', (trigger: any) =>
{
    if(!GameRules.Addon.DidSteal) return;

    // Activator -> Who entered the trigger
    // Caller -> Trigger
    for(let i = GameRules.Addon.CharacterEntities.length - 1; i >= 0; i--)
    {
        if(GameRules.Addon.CharacterEntities[i] == trigger.activator)
        {
            GameRules.Addon.CharacterEntities.splice(i, 1);
        }
    }
    for(let i = GameRules.Addon.CurrentMovements.length - 1; i >= 0; i--)
    {
        if(GameRules.Addon.CurrentMovements[i].unit == trigger.activator)
        {
            GameRules.Addon.CurrentMovements.splice(i, 1);
        }
    }
    (trigger.activator as CDOTA_BaseNPC).Destroy();

    if(GameRules.Addon.CharacterEntities.length == 0)
    {
        GameRules.SetGameWinner(DotaTeam.GOODGUYS);
    }
});
