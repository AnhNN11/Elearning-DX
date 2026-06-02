import { ApiError, requireApiAdmin } from "@/lib/api/auth";
import { uploadImageToCloudinary } from "@/lib/api/cloudinary";
import { isUploadFile } from "@/lib/api/course-storage";
import { apiError, apiOk, formText } from "@/lib/api/responses";

function sanitizeFolderPart(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "editor"
  );
}

export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const formData = await request.formData();
    const image = formData.get("image");

    if (!isUploadFile(image)) {
      throw new ApiError("Vui lòng chọn file ảnh hợp lệ.", 400);
    }

    const context = sanitizeFolderPart(formText(formData, "context") || "content");
    const folder = sanitizeFolderPart(formText(formData, "folder") || "content");
    const upload = await uploadImageToCloudinary(image, {
      courseSlug: context,
      folderName: folder,
    });

    return apiOk({ url: upload.secureUrl });
  } catch (error) {
    return apiError(error);
  }
}
