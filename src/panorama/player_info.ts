class PlayerInfo
{
    panel: Panel;
    playerPanel: Panel;
    bonkStick: Panel;
    currentBonkPlayerId = -1;
    transitionDuration = 0.4;

    playerPanels: { [index: number]: Panel } = {};
    transitionTimer?: ScheduleID;
    bonkTimer?: ScheduleID;

    constructor(panel: Panel)
    {
        this.panel = panel;
        this.playerPanel = this.panel.FindChild("player-panel") as Panel;

        const containers = [
            this.playerPanel.FindChild("player-info-group-left")!,
            this.playerPanel.FindChild("player-info-group-right")!,
        ];

        this.bonkStick = this.panel.FindChild("bonk-stick") as Panel;
        this.bonkStick.style.transition = `position ${this.transitionDuration / 2}s ease-in-out 0.0s, transform ${this.transitionDuration / 2}s ease-in-out 0.0s`;

        GameEvents.Subscribe('player_added_event', (event) =>
        {
            let parent = containers[Math.floor(event.player_id / 2)];

            this.playerPanels[event.player_id] = new PlayerPortrait(parent, event.player_id, event.hero_name, event.player_name, Object.values(event.ability_names)).panel;
        });

        GameEvents.Subscribe('player_bonked', (event) =>
        {
            if(this.currentBonkPlayerId !== -1)
            {
                this.playerPanels[this.currentBonkPlayerId].RemoveClass('bonked');
            }
            if(this.bonkTimer)
            {
                $.CancelScheduled(this.bonkTimer);
            }
            this.bonkTimer = $.Schedule(this.transitionDuration, () =>
            {
                this.playerPanels[event.target_player_id].AddClass('bonked');
                Game.EmitSound('BonkSoundEffect');
                this.bonkTimer = undefined;
            });
            this.currentBonkPlayerId = event.target_player_id;
            this.bonkStick.SetHasClass('player0', this.currentBonkPlayerId == 0);
            this.bonkStick.SetHasClass('player1', this.currentBonkPlayerId == 1);
            this.bonkStick.SetHasClass('player2', this.currentBonkPlayerId == 2);
            this.bonkStick.SetHasClass('player3', this.currentBonkPlayerId == 3);
            this.bonkStick.SetHasClass('right', this.currentBonkPlayerId >= 2);
            this.bonkStick.AddClass("in-transition");
            if(this.transitionTimer)
            {
                $.CancelScheduled(this.transitionTimer);
            }
            this.transitionTimer = $.Schedule(this.transitionDuration / 2, () =>
            {
                this.bonkStick.RemoveClass("in-transition");
                this.transitionTimer = undefined;
            });
        });
    }
}

let ui = new PlayerInfo($.GetContextPanel());
