class PlayerInfo
{
    panel: Panel;

    constructor(panel: Panel)
    {
        this.panel = panel;

        const containers = [
            this.panel.FindChild("player-info-group-left")!,
            this.panel.FindChild("player-info-group-right")!,
        ];


        GameEvents.Subscribe('player_added_event', (event) =>
        {
            let parent = containers[Math.floor(event.player_id / 2)];

            const portrait = new PlayerPortrait(parent, event.hero_name, event.player_name, Object.values(event.ability_names));
        });
    }
}

let ui = new PlayerInfo($.GetContextPanel());
