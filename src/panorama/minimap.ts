$.Msg("Initializing tile minimap");

type ArrayVector = [number, number, number];

const tileSize = 2048;
const fullMapSize = 8192 * 2;

const cameraIndicator = $('#camera_area_bottom_left');

const cameraIndicatorTopLeft = $('#camera_area_top_left');
const cameraIndicatorTopRight = $('#camera_area_top_right');
const cameraIndicatorBottomLeft = $('#camera_area_bottom_left');
const cameraIndicatorBottomRight = $('#camera_area_bottom_right');

let isMovingCamera = false;
let wasMouseDownBefore = false;

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


const minimapSize = 244 + 128 * 1.2;
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
    UpdateMinimapIcons();

    let isMouseDown = GameUI.IsMouseDown(0);

    if(isMouseDown && !wasMouseDownBefore)
    {
        let cursorPosition = GameUI.GetCursorPosition();

        if(IsWithinMinimapBounds(cursorPosition))
        {
            isMovingCamera = true;
        }
    }

    if(isMovingCamera)
    {
        UpdateCameraPosition();
    }

    if(!isMouseDown)
    {
        isMovingCamera = false;
    }

    UpdateCameraCornerIndicators();

    wasMouseDownBefore = isMouseDown;

    boundsChanged = false;
}

function UpdateMinimapIcons()
{
    iconReferences.forEach((_, iconName) =>
    {
        let iconReference = iconReferences.get(iconName)!;

        const heroEntityIds = Entities.GetAllEntitiesByName(iconName);

        if (heroEntityIds.length === 0)
        {
            iconReference.panel.style.visibility = "collapse";
            return;
        }

        const heroPosition = Entities.GetAbsOrigin(heroEntityIds[0]);


        if (
            !boundsChanged &&
            heroPosition[0] == iconReference.lastPosition.x &&
            heroPosition[1] == iconReference.lastPosition.y
        ) return;

        iconReference.lastPosition =
        {
            x: heroPosition[0],
            y: heroPosition[1],
        };

        const heroPositionMinimapSpace =
        {
            x: (heroPosition[0] - mapBounds.left) / (mapBounds.right - mapBounds.left) * minimapSize,
            y: (heroPosition[1] - mapBounds.bottom) / (mapBounds.top - mapBounds.bottom) * minimapSize,
        };

        let newMargin = `
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
}

function UpdateCameraPosition()
{
    let cursorPosition = GameUI.GetCursorPosition();

    if (IsWithinMinimapBounds(cursorPosition))
    {
        let minimapPosition = minimapTilesOverlayPadding.GetPositionWithinWindow();
        let minimapWidth = minimapTilesOverlayPadding.actuallayoutwidth;
        let minimapHeight = minimapTilesOverlayPadding.actuallayoutheight;

        let minimapCursorPosition =
        {
            x: cursorPosition[0] - minimapPosition.x,
            y: minimapHeight - (cursorPosition[1] - minimapPosition.y),
        };

        let xPercent = minimapCursorPosition.x / minimapWidth;
        let yPercent = minimapCursorPosition.y / minimapHeight;

        let worldX = mapBounds.left + (mapBounds.right - mapBounds.left) * xPercent;
        let worldY = mapBounds.bottom + (mapBounds.top - mapBounds.bottom) * yPercent;

        GameUI.SetCameraTargetPosition([worldX, worldY, 0], 0.1);
    }
}

function UpdateCameraCornerIndicators()
{
    let screenWidth = Game.GetScreenWidth();
    let screenHeight = Game.GetScreenHeight()
    // Magic multipliers are just there because of how the player percives it
    const screenTopLeft = ScreenToWorld(-screenWidth / 2 * 0.7, +screenHeight / 2 * 0.6);
    const screenTopRight = ScreenToWorld(+screenWidth / 2 * 0.7, +screenHeight / 2 * 0.6);
    const screenBottomLeft = ScreenToWorld(-screenWidth / 2 * 0.8, -screenHeight / 2 * 0.8);
    const screenBottomRight = ScreenToWorld(+screenWidth / 2 * 0.8, -screenHeight / 2 * 0.8);

    UpdateCameraCorner(screenTopLeft, cameraIndicatorTopLeft);
    UpdateCameraCorner(screenTopRight, cameraIndicatorTopRight);
    UpdateCameraCorner(screenBottomLeft, cameraIndicatorBottomLeft);
    UpdateCameraCorner(screenBottomRight, cameraIndicatorBottomRight);
}

function IsWithinMinimapBounds(cursorPosition: [number, number])
{
    let minimapPosition = minimapTilesOverlayPadding.GetPositionWithinWindow();
    let minimapWidth = minimapTilesOverlayPadding.actuallayoutwidth;
    let minimapHeight = minimapTilesOverlayPadding.actuallayoutheight;
    return  IsWithin(cursorPosition[0], minimapPosition.x, minimapPosition.x + minimapWidth) &&
            IsWithin(cursorPosition[1], minimapPosition.y, minimapPosition.y + minimapHeight);
}

function ScreenToWorld(x: number, y: number)
{
    let cameraPosition = GameUI.GetCameraPosition();
    let cameraForward = Vector_normalize(Vector_sub(GameUI.GetCameraLookAtPosition(), cameraPosition));
    let cameraRight = Vector_cross(cameraForward, [0, 0, 1]);
    let cameraUp = Vector_cross(cameraRight, cameraForward);

    let cubePosition =
    [
        [+1024, -1024 * 0.5, +1024],
    ];

    let cubeDistanceOffset = 1024;


    let cubeWorldPosition = cubePosition.map(x =>
    {
        return Vector_add(
            cameraPosition,
            Vector_mult(cameraForward, cubeDistanceOffset),
            Vector_mult(cameraRight, x[0]),
            Vector_mult(cameraForward, x[1]),
            Vector_mult(cameraUp, x[2]),
        );
    });

    let cubeScreenPosition = cubeWorldPosition.map(x =>
    {
        return [Game.WorldToScreenX(...x), Game.WorldToScreenY(...x), 0];
    });

    let screenWidth = Game.GetScreenWidth();
    let nearPlaneDistance = cubeScreenPosition.map((x, i) =>
    {
        return (cubeDistanceOffset + cubePosition[i][1]) / cubePosition[i][0] * (x[0] - screenWidth / 2);
    })[0];

    let rayDirection = Vector_normalize(Vector_add(
        Vector_mult(cameraRight, x),
        Vector_mult(cameraUp, y),
        Vector_mult(cameraForward, nearPlaneDistance)
    ));

    let zeroPlaneIntersection = GetRayPlaneIntersection(cameraPosition, rayDirection, [0, 0, 1], 0);
    return zeroPlaneIntersection;
}

function UpdateCameraCorner(screenPosition: ArrayVector, panel: Panel)
{
    const screenPositionMinimapSpace = WorldSpaceToMinimapSpace(screenPosition);
    if (screenPositionMinimapSpace.x <= minimapSize || screenPositionMinimapSpace.y <= minimapSize)
    {
        panel.style.visibility = "visible";
        panel.style.margin = `${minimapSize - screenPositionMinimapSpace.y}px ${minimapSize - screenPositionMinimapSpace.x - 32}px ${screenPositionMinimapSpace.y - 32}px ${screenPositionMinimapSpace.x}px`;
    }
    else
    {
        panel.style.visibility = "collapse";
    }
}

function WorldSpaceToMinimapSpace(pos: ArrayVector)
{
    return {
        x: (pos[0] - mapBounds.left) / (mapBounds.right - mapBounds.left) * minimapSize,
        y: (pos[1] - mapBounds.bottom) / (mapBounds.top - mapBounds.bottom) * minimapSize,
    }
}

function GetRayPlaneIntersection(
    rayOrigin: ArrayVector,
    rayDirection: ArrayVector,
    planeNormal: ArrayVector,
    planeDistance: number
)
{
    let t = (-planeDistance - Vector_dot(rayOrigin, planeNormal)) / Vector_dot(rayDirection, planeNormal);
    return Vector_add(rayOrigin, Vector_mult(rayDirection, t));
}

function IsWithin(x: number, min: number, max: number): boolean
{
    return min <= x && x <= max;
}



function Tick ()
{
    OnTick();
    $.Schedule(0, Tick);
}

$.Schedule(0, Tick);






// Vector maths from vector_targeting.js
function Vector_normalize(vec: ArrayVector): ArrayVector
{
	const val = 1 / Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
	return [vec[0] * val, vec[1] * val, vec[2] * val];
}

function Vector_mult(vec: ArrayVector, mult: number): ArrayVector
{
	return [vec[0] * mult, vec[1] * mult, vec[2] * mult];
}

function Vector_add(operand1: ArrayVector, ... operands : ArrayVector[]): ArrayVector
{
	return [
        operands.reduce<number>((a, b) => a + b[0], operand1[0]),
        operands.reduce<number>((a, b) => a + b[1], operand1[1]),
        operands.reduce<number>((a, b) => a + b[2], operand1[2]),
    ];
}

function Vector_sub(operand1: ArrayVector, ... operands : ArrayVector[]): ArrayVector
{
	return [
        operands.reduce<number>((a, b) => a - b[0], operand1[0]),
        operands.reduce<number>((a, b) => a - b[1], operand1[1]),
        operands.reduce<number>((a, b) => a - b[2], operand1[2]),
    ];
}

function Vector_negate(vec: ArrayVector): ArrayVector
{
	return [-vec[0], -vec[1], -vec[2]];
}

function Vector_flatten(vec: ArrayVector): ArrayVector
{
	return [vec[0], vec[1], 0];
}

function Vector_raiseZ(vec: ArrayVector, inc: number): ArrayVector
{
	return [vec[0], vec[1], vec[2] + inc];
}

function Vector_dot(vec1: ArrayVector, vec2: ArrayVector): number
{
    return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
}


function Vector_cross(vec1: ArrayVector, vec2: ArrayVector): ArrayVector
{
    return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
    ]
}
