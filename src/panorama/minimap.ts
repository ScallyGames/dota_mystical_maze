$.Msg("Initializing tile minimap");

const tileSize = 2048;
const fullMapSize = 8192 * 2;

const allPanels : Panel[] = [];
const minimap = FindDotaHudElement("minimap")!;
const minimapContainer = FindDotaHudElement('minimap_block')!;
let width = Number(minimap.style.width?.replace("px", ""));
let height = Number(minimap.style.height?.replace("px", ""));
let padding = Number(minimapContainer.style.padding?.split(' ')[0].replace("px", ""));

const minimapTilesOverlay = $('#minimap-tiles-overlay');
minimapTilesOverlay.style.width = minimapContainer.style.width;
minimapTilesOverlay.style.height = minimapContainer.style.height;
minimapTilesOverlay.style.padding = minimapContainer.style.padding;

let minimapCenterPercent = 43.75;

function OnMinimapChanged(table_name : any, key : any, data : any) {
    let newPanel = $('#' + data.name + '_' + data.direction);
    (newPanel as any).data = data;
    allPanels.push(newPanel);


    const newMapBounds = data.mapBounds;

    if(newMapBounds)
    {
        $.Msg(data.mapBounds);
        allPanels.forEach(panel =>
        {
            let panelData = (panel as any).data;
            $.Msg(panel.id);
            const topWorld = panelData.worldY + tileSize / 2;
            const rightWorld = panelData.worldX + tileSize / 2;
            const bottomWorld = panelData.worldY - tileSize / 2;
            const leftWorld = panelData.worldX - tileSize / 2;
            const mapWidthWorld = newMapBounds.right - newMapBounds.left;
            const mapHeightWorld = newMapBounds.top - newMapBounds.bottom;
            let topPercent = (newMapBounds.top - topWorld)  / mapHeightWorld * 100;
            let rightPercent = (newMapBounds.right - rightWorld) / mapWidthWorld * 100;
            let bottomPercent = (bottomWorld - newMapBounds.bottom) / mapHeightWorld * 100;
            let leftPercent = (leftWorld - newMapBounds.left)  / mapWidthWorld * 100;
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
