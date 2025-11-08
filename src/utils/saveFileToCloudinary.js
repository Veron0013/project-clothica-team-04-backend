import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	secure: true,
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFileToCloudinary(buffer) {
	return new Promise((res, rej) => {
		const uploadStream = cloudinary.uploader.upload_stream({
			folder: "clothica-app/avatar",
			resource_type: "image",
			overwrite: true,
			unique_filename: true,
			use_filename: false,

		},
			(err, result) => (err ? rej(err) : res(result)),
		)

		Readable.from(buffer).pipe(uploadStream)
	})
}