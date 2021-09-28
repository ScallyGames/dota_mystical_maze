class HowToPlay
{
    panel: Panel;

    constructor(panel: Panel)
    {
        this.panel = panel;

        this.panel.FindChildTraverse('close-button')?.SetPanelEvent('onactivate', () =>
        {
            this.panel.FindChild('how-to-play-modal')!.style.visibility = "collapse";
        });
    }
}

new HowToPlay($.GetContextPanel());
