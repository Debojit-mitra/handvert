import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import type { Fields, Files } from "formidable";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import { exec } from "child_process";
import util from "util";
import os from "os";

const execPromise = util.promisify(exec);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { type } = req.query; // 'image', 'office-to-pdf', 'pdf-to-docx'

  const form = formidable({
    keepExtensions: true,
    maxFileSize: 200 * 1024 * 1024, // 200mb
  });

  try {
    const [fields, files] = await new Promise<[Fields, Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      },
    );

    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadedFile = fileArray[0];
    const inputPath = uploadedFile.filepath;
    const originalName =
      uploadedFile.originalFilename || `upload-${Date.now()}`;

    try {
      if (type === "image") {
        await handleImageConvert(res, fields, inputPath);
      } else if (type === "office-to-pdf") {
        await handleOfficeToPdf(res, inputPath, originalName);
      } else if (type === "pdf-to-docx") {
        await handlePdfToDocx(res, inputPath);
      } else {
        res.status(404).json({ error: "Conversion type not supported" });
      }
    } catch (error) {
      console.error(`Conversion error for ${type}:`, error);
      res.status(500).json({ error: "Conversion failed" });
    } finally {
      // Cleanup input file automatically
      fs.unlink(inputPath, () => {});
    }
  } catch (err) {
    console.error("Form parse error:", err);
    return res.status(500).json({ error: "Failed to process form file" });
  }
}

async function handleImageConvert(
  res: NextApiResponse,
  fields: Fields,
  inputPath: string,
) {
  const format = (fields.format?.[0] || "webp") as keyof sharp.FormatEnum;
  const quality = fields.quality?.[0] ? parseInt(fields.quality[0]) : 80;
  let width = fields.width?.[0] ? parseFloat(fields.width[0]) : undefined;
  let height = fields.height?.[0] ? parseFloat(fields.height[0]) : undefined;

  const dimensionType = fields.dimensionType?.[0] || "px";
  const maintainAspectRatio = fields.maintainAspectRatio?.[0] !== "false";

  if (dimensionType === "%" && (width || height)) {
    const metadata = await sharp(inputPath).metadata();
    if (width && metadata.width)
      width = Math.round((width / 100) * metadata.width);
    if (height && metadata.height)
      height = Math.round((height / 100) * metadata.height);
  }

  let processor = sharp(inputPath).toFormat(format, { quality });

  if (width || height) {
    processor = processor.resize({
      width: width ? Math.round(width) : undefined,
      height: height ? Math.round(height) : undefined,
      fit: maintainAspectRatio ? "inside" : "fill",
      withoutEnlargement: false,
    });
  }

  const buffer = await processor.toBuffer();
  const outputFilename = `converted-${Date.now()}.${format}`;

  res.setHeader("Content-Type", `image/${format}`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${outputFilename}"`,
  );
  res.send(buffer);
}

async function handleOfficeToPdf(
  res: NextApiResponse,
  inputPath: string,
  originalName: string,
) {
  const form = new FormData();
  form.append("files", fs.createReadStream(inputPath), originalName);

  // Default Gotenberg port mapped in docker compose
  const gotenbergUrl =
    process.env.GOTENBERG_URL ||
    "http://localhost:3001/forms/libreoffice/convert";

  const response = await axios.post(gotenbergUrl, form, {
    headers: form.getHeaders(),
    responseType: "stream",
  });

  const outputFilename = `converted-${Date.now()}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${outputFilename}"`,
  );

  response.data.pipe(res);

  return new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
}

async function handlePdfToDocx(res: NextApiResponse, inputPath: string) {
  const outputFilename = `converted-${Date.now()}.docx`;
  const outputPath = path.join(os.tmpdir(), outputFilename);

  // Call Python script via child process
  const pyScriptPath = [process.cwd(), "src", "utils", "convert_pdf.py"].join(
    "/",
  );
  const venvPythonPath = [process.cwd(), "venv", "bin", "python"].join("/");

  // Check if venv is inside client or using system python
  const pythonExec = fs.existsSync(venvPythonPath) ? venvPythonPath : "python3";

  const command = `"${pythonExec}" "${pyScriptPath}" "${inputPath}" "${outputPath}"`;

  await execPromise(command);

  const fileBuffer = fs.readFileSync(outputPath);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${outputFilename}"`,
  );
  res.send(fileBuffer);

  // Cleanup output
  fs.unlink(outputPath, () => {});
}
