export const TileSize = 2048;
export const GridSize = TileSize / 4;

export enum Hero
{
    BARBARIAN,
    WARRIOR,
    ALCHEMIST,
    ARCHER,
}

export const HeroStringToHeroEnum =
{
    'barbarian': Hero.BARBARIAN,
    'warrior': Hero.WARRIOR,
    'alchemist': Hero.ALCHEMIST,
    'archer': Hero.ARCHER,
}

export const HeroEnumToHeroString =
{
    [Hero.BARBARIAN]: 'barbarian',
    [Hero.WARRIOR]: 'warrior',
    [Hero.ALCHEMIST]: 'alchemist',
    [Hero.ARCHER]: 'archer',
}

export type HeroString = 'barbarian' | 'warrior' | 'alchemist' | 'archer';

export const HeroCharacters =
{
    [Hero.BARBARIAN]: 'npc_dota_hero_axe',
    [Hero.WARRIOR]: 'npc_dota_hero_juggernaut',
    [Hero.ALCHEMIST]: 'npc_dota_hero_crystal_maiden',
    [Hero.ARCHER]: 'npc_dota_hero_windrunner',
}
