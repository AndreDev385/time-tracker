import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { net } from "electron";

const BUCKET_NAME = "time-tracker"
const REGION = "us-east-005"

const s3Client = new S3Client({
	region: REGION,
	endpoint: `https://s3.${REGION}.backblazeb2.com`,
	credentials: {
		accessKeyId: process.env.BACK_BLAZE_KEY!,
		secretAccessKey: process.env.BACK_BLAZE_SECRET!,
	},
	forcePathStyle: true,
});

// 3. Updated URL generator with error propagation
async function generateUploadUrl(file: File) {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: file.name,
		ContentType: file.type,
	});

	try {
		return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	} catch (error) {
		console.error("Signing Error Details:", error);
	}
}

export async function testCredentials() {
	try {
		await s3Client.send(new ListBucketsCommand({}));
		console.log("Credentials are valid!");
	} catch (error) {
		console.error("Credential Test Failed:", error);
	}
}

function dataURLtoFile(dataurl: string, filename: string) {
	const arr = dataurl.split(",")
	const mime = arr[0].match(/:(.*?);/)![1]
	const bstr = atob(arr[arr.length - 1]);
	let n = bstr.length
	const u8arr = new Uint8Array(n)
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}

export async function uploadFile(dataURL: string) {
	try {
		const file = dataURLtoFile(dataURL, `capure-${new Date().getTime()}.png`)
		console.log({ file })
		// 1. Get pre-signed URL from your server
		const uploadUrl = await generateUploadUrl(file)
		console.log({ uploadUrl })

		if (!uploadUrl) {
			return;
		}

		// 2. Upload directly to Backblaze B2
		const arrayBuffer = await file.arrayBuffer();
		const byteArray = new Uint8Array(arrayBuffer);

		// Verify conversion
		if (byteArray.length !== file.size) {
			throw new Error(`Buffer size mismatch (${byteArray.length} vs ${file.size})`);
		}

		const uploadResponse = await net.fetch(uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": file.type,
			},
			body: byteArray
		});

		if (uploadResponse.ok) {
			return `https://f005.backblazeb2.com/file/${BUCKET_NAME}/${file.name}`;
		}
	} catch (e) {
		console.log("upload-file", { e })
	}
}
