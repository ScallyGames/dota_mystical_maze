import { Hero } from './constants'
import { RoomDefinition } from './TileDefinition'

export const RoomDefinitions : RoomDefinition[] =
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
	},
	{
		name:"tile_03",
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
		name:"tile_04",
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
		name:"tile_05",
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
		name:"tile_06",
        exits : {
            north : {
                type : Hero.ARCHER,
            },
            west : {
                type : Hero.BARBARIAN,
            },
        },
	},
	// tile_07 :
	// {
	// 	name:"tile_07",
    //     exits : {
    //         east : {
    //             type : Heroes.ALCHEMIST,
    //         },
    //     },
	// },
	// tile_08 :
	// {
	// 	name:"tile_08",
    //     exits : {
    //         west : {
    //             type : Heroes.BARBARIAN,
    //         },
    //         east : {
    //             type : Heroes.ALCHEMIST,
    //         },
    //     },
	// },
	// tile_09 :
	// {
	// 	name:"tile_09",
    //     exits : {
    //         east : {
    //             type : Heroes.WARRIOR,
    //         },
    //     },
	// },
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
