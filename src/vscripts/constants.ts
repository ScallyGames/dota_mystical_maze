export const TileSize = 2048;
export const GridSize = TileSize / 4;

export const TimerDuration = 3 * 60 + 15;

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

export const HeroWeapons =
{
    [Hero.BARBARIAN]: 'models/heroes/axe/axe_weapon.vmdl',
    [Hero.WARRIOR]: 'models/heroes/juggernaut/jugg_sword.vmdl',
    [Hero.ALCHEMIST]: 'models/heroes/crystal_maiden/crystal_maiden_staff.vmdl',
    [Hero.ARCHER]: 'models/heroes/windrunner/windrunner_bow.vmdl',
}

export const HeroTargetWeapons =
{
    [Hero.BARBARIAN]: 'models/items/axe/redguard_weapon/redguard_weapon.vmdl',
    [Hero.WARRIOR]: 'models/items/juggernaut/dragon_sword.vmdl',
    [Hero.ALCHEMIST]: 'models/heroes/crystal_maiden/crystal_maiden_staff.vmdl',
    [Hero.ARCHER]: 'models/items/windrunner/iguanas_bow_quiver_v/iguanas_bow_quiver_v.vmdl',
}
