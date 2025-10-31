import { Schema, model, models, type Model } from "mongoose";

export interface ProgramDoc { name: string; shortName: string; status: string; createdAt: Date; }
const ProgramSchema = new Schema<ProgramDoc>({
	name: { type: String, required: true },
	shortName: { type: String, required: true, unique: true },
	status: { type: String, default: "active" },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Program: Model<ProgramDoc> = models.Program || model<ProgramDoc>("Program", ProgramSchema);

export interface LanguageTestDoc { name: string; shortName: string; status: string; }
const LanguageTestSchema = new Schema<LanguageTestDoc>({
	name: { type: String, required: true },
	shortName: { type: String, required: true, unique: true },
	status: { type: String, default: "active" },
});
export const LanguageTest: Model<LanguageTestDoc> = models.LanguageTest || model<LanguageTestDoc>("LanguageTest", LanguageTestSchema);


