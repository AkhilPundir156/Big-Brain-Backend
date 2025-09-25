import { v2 } from "cloudinary";

export const uploadCloudinary = async (path: string) => {
    try {
        const response = await v2.uploader.upload(path);

        return {
            success: true,
            msg: "Upload Completed",
            data: response,
        };
    } catch (err) {
        return {
            success: false,
            msg: "error while uploading the file",
        };
    }
};
