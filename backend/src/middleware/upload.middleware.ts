import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const originalName = file.originalname.toLowerCase();
  const hasValidExtension = originalName.endsWith(".pdf") || originalName.endsWith(".docx");

  if (hasValidExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF and DOCX files are allowed. Got file: ${file.originalname}`));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single("resume");