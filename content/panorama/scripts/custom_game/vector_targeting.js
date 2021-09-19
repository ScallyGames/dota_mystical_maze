// ----------------------------------------------------------
// Vector Targeting Library
// ========================
// Version: 1.0
// Github: https://github.com/Nibuja05/dota_vector_targeting
// ----------------------------------------------------------

/// Vector Targeting
const CONSUME_EVENT = true;
const CONTINUE_PROCESSING_EVENT = false;

//main variables
var vectorTargetParticle;
var vectorTargetUnit;
var vectorStartPosition;
var vectorDistance = 800;
var vectorLength = 800;
let vectorDirectionLock;
let dynamicLength = false;
let gridSize = 512;
var currentlyActiveVectorTargetAbility;

const defaultAbilities = ["pangolier_swashbuckle", "clinkz_burning_army", "dark_seer_wall_of_replica", "void_spirit_aether_remnant"];

//Mouse Callback to check whever this ability was quick casted or not
GameUI.SetMouseCallback(function(eventName, arg, arg2, arg3)
{
	if(GameUI.GetClickBehaviors() == 3 && currentlyActiveVectorTargetAbility != undefined){
		const netTable = CustomNetTables.GetTableValue( "vector_targeting", currentlyActiveVectorTargetAbility )
		OnVectorTargetingStart(netTable.startWidth, netTable.endWidth, netTable.castLength, netTable.castDistance, netTable.ignoreArrow, netTable.direction, netTable.dynamicLength);
		currentlyActiveVectorTargetAbility = undefined;
	}
	return CONTINUE_PROCESSING_EVENT;
});

//Listen for class changes
$.RegisterForUnhandledEvent("StyleClassesChanged", CheckAbilityVectorTargeting );
function CheckAbilityVectorTargeting(panel){
	if(panel == null){return;}

	//Check if the panel is an ability or item panel
	const abilityIndex = GetAbilityFromPanel(panel)
	if (abilityIndex >= 0) {

		//Check if the ability/item is vector targeted
		const netTable = CustomNetTables.GetTableValue("vector_targeting", abilityIndex);
		if (netTable == undefined) {
			let behavior = Abilities.GetBehavior(abilityIndex);
			if ((behavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_VECTOR_TARGETING) !== 0) {
				GameEvents.SendCustomGameEventToServer("check_ability", {"abilityIndex" : abilityIndex} );
			}
			return;
		}

		//Check if the ability/item gets activated or is finished
		if (panel.BHasClass("is_active")) {
			currentlyActiveVectorTargetAbility = abilityIndex;
			if(GameUI.GetClickBehaviors() == 9 ){
				OnVectorTargetingStart(netTable.startWidth, netTable.endWidth, netTable.castLength, netTable.castDistance, netTable.ignoreArrow, netTable.direction, netTable.dynamicLength);
			}
		} else {
			OnVectorTargetingEnd();
		}
	}
}

//Find the ability/item entindex from the panorama panel
function GetAbilityFromPanel(panel) {
	if (panel.paneltype == "DOTAAbilityPanel") {

		// Be sure that it is a default ability Button
		const parent = panel.GetParent();
		if (parent != undefined && (parent.id == "abilities" || parent.id == "inventory_list")) {
			const abilityImage = panel.FindChildTraverse("AbilityImage")
			let abilityIndex = abilityImage.contextEntityIndex;
			let abilityName = abilityImage.abilityname

			//Will be undefined for items
			if (abilityName) {
				return abilityIndex;
			}

			//Return item entindex instead
			const itemImage = panel.FindChildTraverse("ItemImage")
			abilityIndex = itemImage.contextEntityIndex;
			return abilityIndex;
		}
	}
	return -1;
}

// Start the vector targeting
function OnVectorTargetingStart(fStartWidth, fEndWidth, fCastLength, fCastDistance, bIgnoreArrow, vObjectDirectionLock, bDynamicLength)
{
	if (vectorTargetParticle) {
		Particles.DestroyParticleEffect(vectorTargetParticle, true)
		vectorTargetParticle = undefined;
		vectorTargetUnit = undefined;
	}



	const iPlayerID = Players.GetLocalPlayer();
	const selectedEntities = Players.GetSelectedEntities( iPlayerID );
	const mainSelected = Players.GetLocalPlayerPortraitUnit();
	const mainSelectedName = Entities.GetUnitName(mainSelected);
	vectorTargetUnit = mainSelected;
	const cursor = GameUI.GetCursorPosition();

    const cursorWorldPosition = GameUI.GetScreenWorldPosition(cursor);

    if(!cursorWorldPosition) return;

	const worldPosition = Vector_alignToGrid(cursorWorldPosition, gridSize);


	// particle variables
	let startWidth = fStartWidth || 125;
	let endWidth = fEndWidth || startWidth;
	vectorDistance = fCastDistance || 800;
    vectorLength = fCastLength || 800;
    vectorDirectionLock = vObjectDirectionLock && Vector_fromObject(vObjectDirectionLock);
	let ignoreArrowWidth = bIgnoreArrow;
    dynamicLength = !!bDynamicLength;

	// redo dota's default particles
	const abilityName = Abilities.GetAbilityName(currentlyActiveVectorTargetAbility);
	if (defaultAbilities.includes(abilityName)) {
		if (abilityName == "void_spirit_aether_remnant") {
			startWidth = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "start_radius");
			endWidth = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "end_radius");
			vectorDistance = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "remnant_watch_distance");
			ignoreArrowWidth = 1;
		} else if (abilityName == "dark_seer_wall_of_replica") {
            vectorDistance = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "width");
			let multiplier = 1
			if (Entities.HasScepter(mainSelected)) {
                multiplier = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "scepter_length_multiplier");
			}
			vectorDistance = vectorDistance * multiplier
		} else {
            vectorDistance = Abilities.GetSpecialValueFor(currentlyActiveVectorTargetAbility, "range");
		}
        vectorLength = vectorDistance;
	}


	let particleName = "particles/ui_mouseactions/custom_range_finder_cone.vpcf";

    vectorStartPosition = worldPosition;

	//Initialize the particle
	vectorTargetParticle = Particles.CreateParticle(particleName, ParticleAttachment_t.PATTACH_MAIN_VIEW , mainSelected);
	vectorTargetUnit = mainSelected
	Particles.SetParticleControl(vectorTargetParticle, 1, Vector_raiseZ(worldPosition, 100));
	Particles.SetParticleControl(vectorTargetParticle, 3, [endWidth, startWidth, ignoreArrowWidth]);
	Particles.SetParticleControl(vectorTargetParticle, 4, [0, 255, 0]);
    Particles.SetParticleAlwaysSimulate( vectorTargetParticle )

	//Calculate initial particle CPs
	const unitPosition = Entities.GetAbsOrigin(mainSelected);
	let direction;
    if(vectorDirectionLock)
    {
        direction = vectorDirectionLock;
    }
    else
    {
        direction = Vector_normalize(Vector_flatten(Vector_sub(vectorStartPosition, unitPosition)));
    }
	const newPosition = Vector_add(vectorStartPosition, Vector_mult(direction, vectorLength));


    Particles.SetParticleControl(vectorTargetParticle, 2, newPosition);

	//Start position updates
	ShowVectorTargetingParticle();
	return CONTINUE_PROCESSING_EVENT;
}

//End the particle effect
function OnVectorTargetingEnd()
{
	if (vectorTargetParticle) {
		Particles.DestroyParticleEffect(vectorTargetParticle, true)
		vectorTargetParticle = undefined;
		vectorTargetUnit = undefined;
	}
}

//Updates the particle effect and detects when the ability is actually casted
function ShowVectorTargetingParticle()
{
	if (vectorTargetParticle !== undefined)
	{
		const mainSelected = Players.GetLocalPlayerPortraitUnit();
		const cursor = GameUI.GetCursorPosition();
		let worldPosition = GameUI.GetScreenWorldPosition(cursor);

		if (worldPosition == null)
		{
			$.Schedule(1 / 144, ShowVectorTargetingParticle);
			return;
		}

        worldPosition = Vector_alignToGrid(worldPosition, gridSize);

		const testVec = Vector_flatten(Vector_sub(worldPosition, vectorStartPosition));
		if (!(testVec[0] == 0 && testVec[1] == 0 && testVec[2] == 0))
		{
            if(vectorDirectionLock)
            {
                direction = vectorDirectionLock;
            }
            else
            {
                direction = Vector_normalize(Vector_flatten(Vector_sub(worldPosition, vectorStartPosition)));
            }

            let newPosition;
            if(dynamicLength)
            {
                const projectedLength = Math.max(gridSize, Vector_dot(Vector_sub(worldPosition, vectorStartPosition), direction));
                newPosition = Vector_add(Vector_flatten(vectorStartPosition), Vector_mult(direction, projectedLength));
            }
            else
            {
                newPosition = Vector_add(vectorStartPosition, Vector_mult(direction, vectorLength));
            }

            Particles.SetParticleControl(vectorTargetParticle, 2, newPosition);
		}
		if( mainSelected != vectorTargetUnit ){
			GameUI.SelectUnit(vectorTargetUnit, false )
		}
		$.Schedule(1 / 144, ShowVectorTargetingParticle);
	}
}

//Some Vector Functions here:
function Vector_fromObject(vecObject)
{
    return [
        vecObject.x || 0,
        vecObject.y || 0,
        vecObject.z || 0,
    ];
}
function Vector_alignToGrid(vec, gridSize)
{
    vec[0] = Math.round((vec[0] + gridSize / 2) / gridSize) * gridSize - gridSize / 2;
    vec[1] = Math.round((vec[1] + gridSize / 2) / gridSize) * gridSize - gridSize / 2;
    return vec;
}

function Vector_normalize(vec)
{
	const val = 1 / Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
	return [vec[0] * val, vec[1] * val, vec[2] * val];
}

function Vector_mult(vec, mult)
{
	return [vec[0] * mult, vec[1] * mult, vec[2] * mult];
}

function Vector_add(vec1, vec2)
{
	return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
}

function Vector_sub(vec1, vec2)
{
	return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]];
}

function Vector_negate(vec)
{
	return [-vec[0], -vec[1], -vec[2]];
}

function Vector_flatten(vec)
{
	return [vec[0], vec[1], 0];
}

function Vector_raiseZ(vec, inc)
{
	return [vec[0], vec[1], vec[2] + inc];
}

function Vector_dot(vec1, vec2)
{
    return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
}
