import multer, { diskStorage } from "multer";

export const upload = multer({ dest: "./public/data/uploads/" });
