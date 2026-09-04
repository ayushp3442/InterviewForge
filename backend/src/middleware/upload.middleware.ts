import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".pdf", ".docx"];
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.originalname.toLowerCase().endsWith(ext)
  );

  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (hasValidMimeType || hasValidExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF and DOCX files are allowed. Got: ${file.mimetype}`));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single("resume");