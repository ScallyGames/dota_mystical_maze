-- Generated from template

if MysticalMazeMode == nil then
	MysticalMazeMode = class({})
end

require( "constants" )
require( "utility_functions" ) -- require utility_functions early (other required files may use its functions)
require( "room_tables" )
require( "map_room" )


function MysticalMazeMode:ComputeHasNewPlayers()

	if self.bHasSetNewPlayers == true then
		return
	end

	if PlayerResource:HasSetEventGameCustomActionClaimCount() == false then
		return
	end

	self.bHasSetNewPlayers = true

	-- Determine whether there are any new players
	local vecPlayerIDs = self:GetNewPlayerList( )
	self.bHasAnyNewPlayers = ( #vecPlayerIDs > 0 )

	-- Show new player popup for new players
	CustomNetTables:SetTableValue( "game_global", "new_players", vecPlayerIDs )

	if self.bHasAnyNewPlayers == true and self:GetAscensionLevel() == 0 then
		self:ReassignTrapRoomToNormalEncounter( 1 )
	end

	print( "New players " .. tostring( self.bHasAnyNewPlayers ) )

	-- Can't do this until we know whether we have new players
	self:GetAnnouncer():OnHeroSelectionStarted()
	
end


function MysticalMazeMode:InitializeRooms()
	self.rooms = {}

    for _, roomDef in pairs(MAP_ATLAS) do
		table.insert(self.rooms, CMapRoom( roomDef.name ))
	end

	ShuffleListInPlace( self.rooms )
	-- table.insert(self.rooms, CMapRoom( MAP_ATLAS.tile_01a.name ))
end

function Precache( context )
	--[[
		Precache things we know we'll use.  Possible file types include (but not limited to):
		PrecacheResource( "soundfile", "*.vsndevts", context )
		PrecacheResource( "particle", "*.vpcf", context )
		PrecacheResource( "particle_folder", "particles/folder", context )
		]]
	-- PrecacheResource( "model", "npc_dota_hero_axe.vmdl", context )
end

-- Create the game mode when we activate
function Activate()
	GameRules.AddonTemplate = MysticalMazeMode()
	GameRules.AddonTemplate:InitGameMode()
end

function MysticalMazeMode:InitGameMode()
	print( "Template addon is loaded." )

	GameRules:SetCustomGameSetupRemainingTime(1);
	GameRules:SetHeroSelectionTime(1);
	GameRules:SetHeroSelectPenaltyTime(0);
	GameRules:SetStrategyTime(0);
	GameRules:SetPreGameTime(5);
	GameRules:SetShowcaseTime(0);
	GameRules:GetGameModeEntity():SetFogOfWarDisabled(true);
	GameRules:GetGameModeEntity():SetUnseenFogOfWarEnabled(false);

	self:InitializeRooms()

	GameRules:GetGameModeEntity():SetThink( "OnThink", self, "GlobalThink", 0.5 )
end

function MysticalMazeMode:IsValidTileCoord(x, y)
	local size = 3;
	local absX = math.abs(x);
	local absY = math.abs(y);
	local isCorner = (absX + absY) == (size * 2);
	return absX <= 3 and absY <= 3 and not isCorner;
end

function MysticalMazeMode:TileCoordToWorldCoord(x, y)
	return Vector(x * 2048 + y * 512, y * 2048 - x * 512)
end

function MysticalMazeMode:GetValidTeamPlayers()
	local out = {}
	for p=0,DOTA_MAX_PLAYERS do
		print('setting random hero')
		if (PlayerResource:IsValidTeamPlayer(p)) then
			out[p] = PlayerResource:GetPlayer(p)
		else
			out[p] = nil
		end
	end
	return out
end

function MysticalMazeMode:OnThink()
	local nGameState = GameRules:State_Get()
	if nGameState == DOTA_GAMERULES_STATE_HERO_SELECTION then
		for p,player in pairs(self:GetValidTeamPlayers()) do
			player:MakeRandomHeroSelection()
		end
		
		if not self.mapSpawned then
			self.mapSpawned = true;
			if IsServer() then
				local room;
				local mapName;
				room = table.remove(self.rooms);
				mapName = room:GetName()

				for x=-3, 3 do
					for y=-3, 3 do
						if (x ~= 0 or y ~= 0) and self:IsValidTileCoord(x, y) then
							room.spawnHandle = DOTA_SpawnMapAtPosition(
								'tile_small_01a', -- mapName,
								self:TileCoordToWorldCoord(x, y),
								false,
								nil,
								nil,
								self
							)
						end
					end
				end
			end
		end
	elseif nGameState == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS or nGameState == DOTA_GAMERULES_STATE_PRE_GAME then
		if not self.hasSetPlayerPosition then
			print('should spawn')

			self.hasSetPlayerPosition = true;
			
			local spawnPositions = {
				Vector(0+256, 0+256, 128),
				Vector(0+256, 0-256, 128),
				Vector(0-256, 0+256, 128),
				Vector(0-256, 0-256, 128),
			}
			
			ShuffleListInPlace( spawnPositions )

			local warriorHero = CreateUnitByNameAsync("npc_dota_hero_juggernaut", spawnPositions[1], false, nil, nil, DOTA_TEAM_NOTEAM, nil)
			local barbarianHero = CreateUnitByNameAsync("npc_dota_hero_axe", spawnPositions[2], false, nil, nil, DOTA_TEAM_NOTEAM, nil)
			local archerHero = CreateUnitByNameAsync("npc_dota_hero_windrunner", spawnPositions[3], false, nil, nil, DOTA_TEAM_NOTEAM, nil)
			local alchemistHero = CreateUnitByNameAsync("npc_dota_hero_storm_spirit", spawnPositions[4], false, nil, nil, DOTA_TEAM_NOTEAM, nil)
			
		end
	elseif nGameState >= DOTA_GAMERULES_STATE_POST_GAME then
		return nil
	end
	return 0.5
end