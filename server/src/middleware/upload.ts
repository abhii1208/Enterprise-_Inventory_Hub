import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import createHttpError from "http-errors";

const tempDir = path.resolve(process.cwd(), "temp");
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".xlsx")) {
      cb(createHttpError(400, "Only .xlsx files are allowed"));
      return;
    }

    cb(null, true);
  }
});
