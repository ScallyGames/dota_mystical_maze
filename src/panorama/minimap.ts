$.Msg("Initializing tile minimap");

function OnShufflePlayersPressed()
{
    $.Msg("Pressed");
    OnMinimapChanged("minimap_info", "tile_0_-1", {
        x : -1,
        y : 0,
        worldX : -1,
        worldY : 0,
        name: "tile_small_02",
        direction: "west",
        occupied: true,
    })
}

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
    let panel = $('#' + data.name + '_' + data.direction);
    let offsetVector = MultiplyMatrixWithVectorLinear(data, TileToWorldMatrix);
    let left = minimapCenterPercent + offsetVector.x * 12.5;
    let bottom = minimapCenterPercent + offsetVector.y * 12.5;
    panel.style.visibility = "visible";
    panel.style.margin = `0px 0px ${bottom}% ${left}%`;
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
