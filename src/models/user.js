import { model, Schema } from "mongoose";

const userSchema = new Schema(
	{
		username: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		password: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			required: false,
			default: "https://ac.goit.global/fullstack/react/default-avatar.jpg",
		},
	},
	{
		timestamps: true,
		//versionKey: false
	}
)

userSchema.pre('save', function (next) {
	if (!this.username) {
		this.username = this.email
	}
	next()
})

userSchema.methods.toJSON = function () {
	const obj = this.toObject()
	delete obj.password
	return obj
}


export const User = model('User', userSchema)