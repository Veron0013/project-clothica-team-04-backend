import { model, Schema } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const notesSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: false,
			default: '',
			trim: true,
		},
		tag: {
			type: String,
			required: false,
			enum: TAGS,
			default: 'Todo',
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		}
	}, {
	timestamps: true,
	//versionKey: false,
},)

notesSchema.index({ title: "text", content: "text" });

export const Note = model('Note', notesSchema);
