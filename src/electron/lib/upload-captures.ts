import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
	region: "us-east-005",
	endpoint: "https://s3.us-east-005.backblazeb2.com",
	credentials: {
		accessKeyId: "",
		secretAccessKey: "",
	}
})

// Generate a pre-signed URL for client-side upload
export async function generateUploadUrl(filename: string, contentType: string) {
	const command = new PutObjectCommand({
		Bucket: "your-bucket-name",
		Key: filename,
		ContentType: contentType,
	});

	const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	return url;
}

// client/UploadForm.jsx
export async function uploadFile(file: File) {
	// 1. Get pre-signed URL from your server
	const uploadUrl = await generateUploadUrl(file.name, file.type)

	// 2. Upload directly to Backblaze B2
	const uploadResponse = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});

	if (uploadResponse.ok) {
		const publicUrl = `https://f005.backblazeb2.com/file/time-tracker/${file.name}`;
		console.log("File uploaded:", publicUrl);
	}
}
