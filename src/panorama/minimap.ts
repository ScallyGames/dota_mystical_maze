$.Msg("Initializing tile minimap");

const tileSize = 2048;
const fullMapSize = 8192 * 2;

const allPanels : Panel[] = [];


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



let mapBounds = { left: 0, top: 0, bottom: 0, right: 0 }


const minimapTilesOverlayPadding = $('#minimap-tiles-overlay-padding');

let minimapCenterPercent = 43.75;

function OnMinimapChanged(table_name : any, key : any, data : any) {
    let newPanel = $('#' + data.name + '_' + data.direction);
    (newPanel as any).data = data;
    allPanels.push(newPanel);


    mapBounds = data.mapBounds;

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
