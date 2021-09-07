import { BaseAbility } from "./dota_ts_adapter";

export interface BaseVectorAbility extends BaseAbility {
    vectorTargetPosition:Vector;
    vectorTargetPosition2:Vector;
    UpdateNettable(ability: BaseVectorAbility):void;
    GetVectorLength(): number;
	GetVectorTargetRange():number;
	GetVectorTargetStartRadius():number;
	GetVectorTargetEndRadius():number;
	GetVectorPosition():Vector;
	GetVector2Position():Vector;
	GetVectorDirection():Vector;
	UpdateVectorValues():void;
	OnVectorCastStart(vStartLocation: Vector, vDirection: Vector):void;
	IsDualVectorDirection():boolean;
	IgnoreVectorArrowWidth():boolean;
}

export class BaseVectorAbility {}
