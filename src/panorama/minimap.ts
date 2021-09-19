$.Msg("Initializing tile minimap");

const tileSize = 2048;
const fullMapSize = 8192 * 2;

const allPanels : Panel[] = [];

const iconEntities = [
    "barbarian",
    "warrior",
    "alchemist",
    "archer",
    "barbarian_weapon_area",
    "warrior_weapon_area",
    "alchemist_weapon_area",
    "archer_weapon_area",
];

const iconReferences = new Map([
    ["barbarian", { panel: $('#hero_barbarian'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["warrior", { panel: $('#hero_warrior'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["alchemist", { panel: $('#hero_alchemist'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["archer", { panel: $('#hero_archer'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["7_18_barbarian_weapon_anchor", { panel: $('#weapon_barbarian'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["7_17_warrior_weapon_anchor", { panel: $('#weapon_warrior'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["6_22_alchemist_weapon_anchor", { panel: $('#weapon_alchemist'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["8_21_archer_weapon_anchor", { panel: $('#weapon_archer'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
    ["6_21_portal_exit_anchor", { panel: $('#exit'), lastPosition: { x: 0, y: 0 }, iconSize: 32 }],
]);


const minimapSize = 244 + 128 * 1.5;
const padding = 8;
const minimapContainer = $('#minimap-tiles-overlay')!;
minimapContainer.style.height = `${minimapSize + 2 * padding}px`;
minimapContainer.style.width = `${minimapSize + 2 * padding}px`;
minimapContainer.style.padding = `${padding}px`;
minimapContainer.style.backgroundImage = 'url("s2r://panorama/images/hud/reborn/inventory_bg_bg_psd.vtex")';
minimapContainer.style.backgroundSize = 'cover';

const hudSkinMinimap = FindDotaHudElement("HUDSkinMinimap")!;
hudSkinMinimap.visible = true;
hudSkinMinimap.style.height = `${2 * 92}px`;
hudSkinMinimap.style.width = `${2 * 34}px`;
hudSkinMinimap.style.backgroundImage = 'url("s2r://panorama/images/hud/reborn/side_flare_tall_psd.vtex")';
hudSkinMinimap.style.backgroundSize = 'cover';
hudSkinMinimap.style.marginLeft = `${minimapSize + 2 * padding}px`;
hudSkinMinimap.style.transform = 'scaleX(-1)';



let mapBounds = { left: -1024, top: 1024, bottom: -1024, right: 1024 }
let boundsChanged = true;


const minimapTilesOverlayPadding = $('#minimap-tiles-overlay-padding');

let minimapCenterPercent = 43.75;

function OnMinimapChanged(table_name : any, key : any, data : any) {
    let newPanel = $('#' + data.name + '_' + data.direction);
    (newPanel as any).data = data;
    allPanels.push(newPanel);


    mapBounds = data.mapBounds;
    boundsChanged = true;

    if(mapBounds)
    {
        allPanels.forEach(panel =>
        {
            let panelData = (panel as any).data;
            const topWorld = panelData.worldY + tileSize / 2;
            const rightWorld = panelData.worldX + tileSize / 2;
            const bottomWorld = panelData.worldY - tileSize / 2;
            const leftWorld = panelData.worldX - tileSize / 2;
            const mapWidthWorld = mapBounds.right - mapBounds.left;
            const mapHeightWorld = mapBounds.top - mapBounds.bottom;
            let topPercent = (mapBounds.top - topWorld)  / mapHeightWorld * 100;
            let rightPercent = (mapBounds.right - rightWorld) / mapWidthWorld * 100;
            let bottomPercent = (bottomWorld - mapBounds.bottom) / mapHeightWorld * 100;
            let leftPercent = (leftWorld - mapBounds.left)  / mapWidthWorld * 100;
            panel.style.visibility = "visible";
            panel.style.margin = `${topPercent}% ${rightPercent}% ${bottomPercent}% ${leftPercent}%`;
        });
    }
}

function GetDotaHud() {
    let panel : Panel | null = $.GetContextPanel();
    while (panel && panel.id !== 'Hud') {
        panel = panel.GetParent();
    }

    if (!panel) {
        throw new Error('Could not find Hud root from panel with id: ' + $.GetContextPanel().id);
    }

    return panel;
}

function FindDotaHudElement(id : string) {
    return GetDotaHud().FindChildTraverse(id);
}

CustomNetTables.SubscribeNetTableListener("minimap_info" as any as never, OnMinimapChanged);

function OnTick()
{
    iconReferences.forEach(( _, iconName ) =>
    {
        const heroEntityIds = Entities.GetAllEntitiesByName(iconName);

        if(heroEntityIds.length === 0) return;

        const heroPosition = Entities.GetAbsOrigin(heroEntityIds[0]);

        let iconReference = iconReferences.get(iconName)!;

        if( !boundsChanged &&
            heroPosition[0] == iconReference.lastPosition.x &&
            heroPosition[1] == iconReference.lastPosition.y
        ) return;

        iconReference.lastPosition =
        {
            x: heroPosition[0],
            y: heroPosition[1],
        };

        const heroPositionMinimapSpace = {
            x: (heroPosition[0] - mapBounds.left) / (mapBounds.right - mapBounds.left) * minimapSize,
            y: (heroPosition[1] - mapBounds.bottom) / (mapBounds.top - mapBounds.bottom) * minimapSize,
        }

        let newMargin =  `
            ${minimapSize - heroPositionMinimapSpace.y - iconReference.iconSize / 2}px
            ${minimapSize - heroPositionMinimapSpace.x - iconReference.iconSize / 2}px
            ${heroPositionMinimapSpace.y - iconReference.iconSize / 2}px
            ${heroPositionMinimapSpace.x - iconReference.iconSize / 2}px
        `;
        newMargin = newMargin.replace(/[\r\n\s]+/g, ' ');
        iconReference.panel.style.margin = newMargin;
        iconReference.panel.style.visibility = "visible";


        iconReferences.set(iconName, iconReference)!;
    });



    if(GameUI.IsMouseDown(0))
    {
        let cursorPosition = GameUI.GetCursorPosition();

        let minimapPosition = minimapTilesOverlayPadding.GetPositionWithinWindow();
        let minimapWidth = minimapTilesOverlayPadding.actuallayoutwidth;
        let minimapHeight = minimapTilesOverlayPadding.actuallayoutheight;

        if(
            isWithin(cursorPosition[0], minimapPosition.x, minimapPosition.x + minimapWidth) &&
            isWithin(cursorPosition[1], minimapPosition.y, minimapPosition.y + minimapHeight)
        )
        {
            let minimapCursorPosition = {
                x: cursorPosition[0] - minimapPosition.x,
                y: minimapHeight - (cursorPosition[1] - minimapPosition.y),
            }

            let xPercent = minimapCursorPosition.x / minimapWidth;
            let yPercent = minimapCursorPosition.y / minimapHeight;

            let worldX = mapBounds.left + (mapBounds.right - mapBounds.left) * xPercent;
            let worldY = mapBounds.bottom + (mapBounds.top - mapBounds.bottom) * yPercent;

            GameUI.SetCameraTargetPosition([worldX, worldY, 0], 0.1);
        }

    }
    boundsChanged = false;
}

function isWithin(x: number, min: number, max: number): boolean
{
    return min <= x && x <= max;
}



function Tick ()
{
    OnTick();
    $.Schedule(0, Tick);
}

$.Schedule(0, Tick);
