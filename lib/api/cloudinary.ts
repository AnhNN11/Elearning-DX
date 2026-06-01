import { createHash } from "node:crypto";

type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  folder: string;
};

type CloudinaryUploadResponse = {
  bytes?: number;
  format?: string;
  public_id?: string;
  resource_type?: string;
  secure_url?: string;
};

function sanitizePublicId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[a-zA-Z0-9]+$/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "image";
}

function parseCloudinaryUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") {
      return null;
    }

    return {
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
      cloudName: parsed.hostname,
    };
  } catch {
    return null;
  }
}

function getCloudinaryConfig(): CloudinaryConfig {
  const parsedUrl = process.env.CLOUDINARY_URL ? parseCloudinaryUrl(process.env.CLOUDINARY_URL) : null;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? parsedUrl?.cloudName ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? parsedUrl?.apiKey ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? parsedUrl?.apiSecret ?? "";
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "dolphinx";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Thiếu cấu hình Cloudinary. Cần CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET.");
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
    folder,
  };
}

function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function uploadImageToCloudinary(
  file: File,
  {
    courseSlug,
  }: {
    courseSlug: string;
  },
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Cloudinary chỉ nhận file ảnh cho banner/thumbnail.");
  }

  const config = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${config.folder}/courses/${courseSlug}`;
  const publicId = `${sanitizePublicId(file.name)}-${crypto.randomUUID()}`;
  const params = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const signature = signUploadParams(params, config.apiSecret);
  const formData = new FormData();

  formData.set("file", file, file.name);
  formData.set("api_key", config.apiKey);
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    body: formData,
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as CloudinaryUploadResponse & {
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message ?? "Upload ảnh lên Cloudinary thất bại.");
  }

  return {
    bytes: payload.bytes,
    format: payload.format,
    publicId: payload.public_id,
    resourceType: payload.resource_type,
    secureUrl: payload.secure_url,
  };
}
