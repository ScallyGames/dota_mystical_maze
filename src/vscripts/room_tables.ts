import { Hero } from './constants'
import { TileDefinition } from './TileDefinition'

export const RoomDefinitions : TileDefinition[] =
[
	{
		name:"tile_small_01a",
	    exits : {
            north : {
                type : Hero.BARBARIAN,
            },
            south : {
                type : Hero.WARRIOR,
            },
            west : {
                type : Hero.ALCHEMIST,
            },
            east : {
                type : Hero.ARCHER,
            },
        },
        stairs : [
            {
                connections : [
                    Vector(2, 0),
                    Vector(3, 1),
                ],
            },
        ],
	},
	{
		name:"tile_small_02",
        exits : {
            west : {
                type : Hero.BARBARIAN,
            },
        },
        stairs : [
            {
                connections : [
                    Vector(0, 2),
                    Vector(2, 3),
                ],
            },
        ],
        escapeExit : {
            position: Vector(3, 3),
            direction: Vector(1, 0),
        }
	},
	{
		name:"tile_small_03",
        exits : {
            west : {
                type : Hero.ALCHEMIST,
            },
            east : {
                type : Hero.WARRIOR,
            },
        },
	},
	{
		name:"tile_small_04",
        exits : {
            north : {
                type : Hero.ALCHEMIST,
            },
            east : {
                type : Hero.ARCHER,
            },
        },
	},
	{
		name:"tile_small_05",
        exits : {
            north : {
                type : Hero.BARBARIAN,
            },
            west : {
                type : Hero.WARRIOR,
            },
            east : {
                type : Hero.ARCHER,
            },
        },
	},
	{
		name:"tile_small_06",
        exits : {
            north : {
                type : Hero.ARCHER,
            },
            west : {
                type : Hero.BARBARIAN,
            },
        },
	},
	{
		name:"tile_small_07",
        exits : {
            east : {
                type : Hero.ALCHEMIST,
            },
        },
        stairs : [
            {
                connections : [
                    Vector(1, 0),
                    Vector(2, 2),
                ],
            },
        ],
	},
	{
		name:"tile_small_08",
        exits : {
            west : {
                type : Hero.BARBARIAN,
            },
            east : {
                type : Hero.ALCHEMIST,
            },
        },
	},
	{
		name:"tile_small_09",
        exits : {
            east : {
                type : Hero.WARRIOR,
            },
        },
	},
	// tile_10 :
	// {
	// 	name:"tile_10",
    //     exits : {
    //         west : {
    //             type : Heroes.ALCHEMIST,
    //         },
    //         east : {
    //             type : Heroes.WARRIOR,
    //         },
    //     },
	// },
	// tile_11 :
	// {
	// 	name:"tile_11",
    //     exits : {
    //         west : {
    //             type : Heroes.ARCHER,
    //         },
    //         east : {
    //             type : Heroes.WARRIOR,
    //         },
    //     },
	// },
	// tile_12 :
	// {
	// 	name:"tile_12",
    //     exits : {
    //         north : {
    //             type : Heroes.WARRIOR,
    //         },
    //     },
	// },
]
