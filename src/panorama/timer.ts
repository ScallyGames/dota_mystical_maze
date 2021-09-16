$.Msg("Hud panorama loaded");

let maxTime = 3 * 60 + 15;
let remainingTime = maxTime;

GameEvents.Subscribe("timer_tick", (data: NetworkedData<TimerTickEventData>) => {
    remainingTime = data.remaining_time;
    UpdateTimerBars();
});

GameEvents.Subscribe("timer_set_max_time", (data: NetworkedData<TimerMaxTimeEventData>) => {
    maxTime = data.max_time;
    remainingTime = maxTime;
    UpdateTimerBars();
});

function UpdateTimerBars()
{
    const timerBarElement = $.GetContextPanel().FindChildTraverse("timer-bar")

    if(!timerBarElement) return;

    timerBarElement.style.width = (remainingTime / maxTime * 100) + "%";
}
