import { Hero, HeroCharacters, HeroEnumToHeroString, HeroString } from "./constants";
import { registerEntityFunction } from "./lib/dota_ts_adapter";

function SetCharacterOnShop(hero: HeroString, val: boolean)
{
    if(GameRules.Addon.DidSteal) return;

    GameRules.Addon.CharactersOnShop![hero] = val;

    let allOnShop = Object.keys(GameRules.Addon.CharactersOnShop!).every(x => GameRules.Addon.CharactersOnShop![x as HeroString]);

    for(let i = 0; i < DOTA_MAX_PLAYERS; i++)
    {
        let player = PlayerResource.GetPlayer(i as PlayerID);
        if(player)
        {
            player.GetAssignedHero().FindAbilityByName('steal_weapons')?.SetActivated(allOnShop);
        }
    }
}


registerEntityFunction('OnStartTouch', (trigger: any) =>
{
    // Activator -> Who entered the trigger
    // Caller -> Trigger
    SetCharacterOnShop(
        HeroEnumToHeroString[
            Object
                .keys(HeroCharacters)
                .find(x =>
                    HeroCharacters[x as any as Hero] === trigger.activator.GetClassname()
                ) as any as Hero
        ] as HeroString
    , true)
});


registerEntityFunction('OnEndTouch', (trigger: any) =>
{
    // Activator -> Who entered the trigger
    // Caller -> Trigger
    SetCharacterOnShop(
        HeroEnumToHeroString[
            Object
                .keys(HeroCharacters)
                .find(x =>
                    HeroCharacters[x as any as Hero] === trigger.activator.GetClassname()
                ) as any as Hero
        ] as HeroString
    , false)
});
