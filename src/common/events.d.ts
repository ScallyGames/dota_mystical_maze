/**
 * This file contains types for the events you want to send between the UI (Panorama)
 * and the server (VScripts).
 *
 * IMPORTANT:
 *
 * The dota engine will change the type of event data slightly when it is sent, so on the
 * Panorama side your event handlers will have to handle NetworkedData<EventType>, changes are:
 *   - Booleans are turned to 0 | 1
 *   - Arrays are automatically translated to objects when sending them as event. You have
 *     to change them back into arrays yourself! See 'toArray()' in src/panorama/hud.ts
 */

// To declare an event for use, add it to this table with the type of its data
interface CustomGameEventDeclarations {
    timer_tick: TimerTickEventData;
    timer_set_max_time: TimerMaxTimeEventData;
    player_added_event: PlayerAddedEventData;
    player_bonked: PlayerBonkedEventData;
    activate_player_bonk: ActivatePlayerBonkEventData;
    communication_activated: CommunicationActivatedEventData;
    communication_deactivated: CommunicationDeactivatedEventData;
}

interface TimerTickEventData {
    remaining_time: number;
}

interface TimerMaxTimeEventData {
    max_time: number;
}

interface PlayerAddedEventData
{
    player_id: PlayerID;
    player_name: string;
    hero_name: string;
    ability_names: string[];
}

interface PlayerBonkedEventData
{
    target_player_id: PlayerID;
}

interface ActivatePlayerBonkEventData
{
    target_player_id: PlayerID;
}

interface CommunicationActivatedEventData
{

}

interface CommunicationDeactivatedEventData
{

}

