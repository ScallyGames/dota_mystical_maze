class CommunicationInfo
{
    panel: Panel;
    textPanel: Panel;

    constructor(panel: Panel)
    {
        this.panel = panel;
        this.textPanel = panel.FindChild('communication-info-text-panel') as Panel;

        GameEvents.Subscribe('communication_activated', (event) =>
        {
            this.textPanel.RemoveClass('hidden');
        });

        GameEvents.Subscribe('communication_deactivated', (event) =>
        {
            this.textPanel.AddClass('hidden');
        });
    }
}

new CommunicationInfo($.GetContextPanel());
