export const TileSize = 2048;
export const GridSize = TileSize / 4;

export enum Hero
{
    BARBARIAN,
    WARRIOR,
    ALCHEMIST,
    ARCHER,
}

export const HeroCharacters =
{
    [Hero.BARBARIAN]: 'npc_dota_hero_axe',
    [Hero.WARRIOR]: 'npc_dota_hero_juggernaut',
    [Hero.ALCHEMIST]: 'npc_dota_hero_storm_spirit',
    [Hero.ARCHER]: 'npc_dota_hero_windrunner',
}
