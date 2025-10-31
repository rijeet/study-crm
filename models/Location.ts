import { Schema, model, models, type Model, Types } from "mongoose";

export interface CountryDoc { name: string; code: string; phoneCode: string; status: string; }
const CountrySchema = new Schema<CountryDoc>({
	name: { type: String, required: true },
	code: { type: String, required: true, index: true },
	phoneCode: { type: String, required: true },
	status: { type: String, default: "active" },
});
CountrySchema.index({ code: 1 }, { unique: true });
export const Country: Model<CountryDoc> = models.Country || model<CountryDoc>("Country", CountrySchema);

export interface StateDoc { countryId: Types.ObjectId; name: string; code: string; status: string; }
const StateSchema = new Schema<StateDoc>({
	countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true },
	name: { type: String, required: true },
	code: { type: String, required: true },
	status: { type: String, default: "active" },
});
StateSchema.index({ countryId: 1, code: 1 }, { unique: true });
export const State: Model<StateDoc> = models.State || model<StateDoc>("State", StateSchema);

export interface CityDoc { countryId: Types.ObjectId; stateId: Types.ObjectId; name: string; zip?: string; status: string; }
const CitySchema = new Schema<CityDoc>({
	countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true },
	stateId: { type: Schema.Types.ObjectId, ref: "State", required: true, index: true },
	name: { type: String, required: true },
	zip: { type: String },
	status: { type: String, default: "active" },
});
CitySchema.index({ stateId: 1, name: 1 }, { unique: true });
export const City: Model<CityDoc> = models.City || model<CityDoc>("City", CitySchema);


