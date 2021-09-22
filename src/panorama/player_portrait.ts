class PlayerPortrait {
    panel: Panel;
    heroImage: ImagePanel;
    playerLabel: LabelPanel;
    abilitiesPanel: Panel;

    constructor(parent: Panel, heroName: string, playerName: string, abilityNames: string[])
    {
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;

        panel.BLoadLayoutSnippet("PlayerPortrait");

        this.heroImage = panel.FindChildTraverse("hero-image") as ImagePanel;
        this.playerLabel = panel.FindChildTraverse("player-name") as LabelPanel;
        this.abilitiesPanel = panel.FindChildTraverse("player-abilities") as Panel;

        this.playerLabel.text = playerName;

        this.heroImage.SetImage("s2r://panorama/images/heroes/" + heroName + "_png.vtex");
        this.heroImage.AddClass(heroName);

        abilityNames.forEach(x =>
        {
            $.CreatePanelWithProperties('DOTAAbilityImage', this.abilitiesPanel, x,
            {
                abilityname: x
            });
        });

    }
}
