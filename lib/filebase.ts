
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
export const FILEBASE_CONFIG = {
  bucket: "fanft-assets",
  gateway: "https://fanft-assets.myfilebase.com/",
  s3Url: "https://fanft-assets.s3.filebase.com/",
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
};
export function getFilebaseClient() {
  return new S3Client({
    endpoint: FILEBASE_CONFIG.endpoint,
    region: FILEBASE_CONFIG.region,
    credentials: {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
      secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
    },
    forcePathStyle: false,
  });
}
export async function uploadToFilebase(file: Buffer, fileName: string, contentType: string, folder: string = "") {
  const client = getFilebaseClient();
  const key = folder ? `${folder}/${fileName}` : fileName;
  await client.send(new PutObjectCommand({
    Bucket: FILEBASE_CONFIG.bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));
  return {
    bucket: FILEBASE_CONFIG.bucket,
    key,
    s3Url: `https://${FILEBASE_CONFIG.bucket}.s3.filebase.com/${key}`,
    gatewayUrl: `${FILEBASE_CONFIG.gateway}${key}`,
    ipfsUrl: `ipfs://${key}`,
  };
}
export async function uploadJSONToFilebase(json: any, fileName: string, folder: string = "metadata") {
  const buffer = Buffer.from(JSON.stringify(json, null, 2));
  return await uploadToFilebase(buffer, fileName, "application/json", folder);
}
