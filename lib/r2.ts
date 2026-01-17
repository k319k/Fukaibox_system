import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.warn("R2 environment variables are not fully set.");
}

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

/**
 * 画像アップロード用の署名付きURLを生成する
 * @param key ファイルパス（キー）
 * @param contentType コンテンツタイプ
 * @param expiresIn 有効期限（秒）
 */
export async function generateUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not set");

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(r2, command, { expiresIn });
}

/**
 * 画像を削除する
 * @param key ファイルパス（キー）
 */
export async function deleteImage(key: string) {
    if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not set");

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    await r2.send(command);
}

/**
 * 画像の公開URLを取得する
 * @param key ファイルパス（キー）
 */
export function getPublicUrl(key: string) {
    if (!R2_PUBLIC_URL) return key; // フォールバック

    // R2_PUBLIC_URLにプロトコルがない場合はhttps://を付与
    let baseUrl = R2_PUBLIC_URL;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `https://${baseUrl}`;
    }

    // 末尾のスラッシュ処理
    baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    // keyの先頭スラッシュを削除
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    return `${baseUrl}${cleanKey}`;
}
