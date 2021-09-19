{

    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_TIMEOFDAY, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL, true );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_MINIMAP, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PANEL, true );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_ITEMS, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_QUICKBUY, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PROTECT, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_GOLD, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_MENU_BUTTONS, true );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, true );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_BAR, false );
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_QUICK_STATS, false );


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

    FindDotaHudElement("inventory_composition_layer_container")!.visible = false;
    FindDotaHudElement("AghsStatusContainer")!.visible = false;
    FindDotaHudElement("StatBranch")!.visible = false;
    FindDotaHudElement("MorphProgress")!.visible = false;
    FindDotaHudElement("health_mana")!.visible = false;
    FindDotaHudElement("PortraitGroup")!.visible = false;
    FindDotaHudElement("HUDSkinPortrait")!.visible = false;
    FindDotaHudElement("xp")!.visible = false;
    FindDotaHudElement("stats_container")!.visible = false;
    FindDotaHudElement("HUDSkinXPBackground")!.visible = false;
    FindDotaHudElement("unitname")!.visible = false;
    FindDotaHudElement("unitbadge")!.visible = false;
    FindDotaHudElement("level_stats_frame")!.visible = false;
    FindDotaHudElement("level_stats_frame")!.visible = false;
    FindDotaHudElement("GlyphScanContainer")!.visible = false;
    GetDotaHud().FindChildrenWithClassTraverse("AbilityInsetShadowRight").forEach(x => x.visible = false);
    GetDotaHud().FindChildrenWithClassTraverse("AbilityInsetShadowLeft").forEach(x => x.visible = false);

    let centerBg = FindDotaHudElement("center_bg")!;
    centerBg.style.margin = "0px 32px 0px 32px";
    centerBg.style.height = "112px";
    centerBg.style.backgroundImage = 'url("s2r://panorama/images/hud/reborn/inventory_bg_bg_psd.vtex")';
    centerBg.style.borderTopLeftRadius = '16px';
    centerBg.style.borderTopRightRadius = '16px';

    const flareLeft = FindDotaHudElement('left_flare')!;
    flareLeft.style.height = "92px";
    flareLeft.style.width = "34px";
    const flareRight = FindDotaHudElement('right_flare')!;
    flareRight.style.height = "92px";
    flareRight.style.width = "34px";
    flareRight.style.backgroundImage = 'url("s2r://panorama/images/hud/reborn/side_flare_tall_psd.vtex")';
    flareRight.style.transform = 'scaleX(-1)';
    FindDotaHudElement("AbilitiesAndStatBranch")!.style.margin = "0px 46px 0px 46px";
}
