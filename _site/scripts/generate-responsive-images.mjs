/**
 * Builds WebP + JPEG variants for movie posters, film stills, and About/Contact photos.
 * Run: npm install && npm run generate:images
 * Outputs under images/movie_posters/generated/, images/stills/<movieID>/generated/, images/photos/generated/
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const POSTER_WIDTHS = [400, 800, 1200];
const PHOTO_WIDTHS = [320, 640, 960];
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Movie posters: max width, preserve aspect ratio */
async function writeVariants(srcPath, outDir, stem, widths) {
  await fs.mkdir(outDir, { recursive: true });
  for (const w of widths) {
    const resized = await sharp(srcPath)
      .rotate() // apply EXIF orientation before measuring / resizing
      .resize(w, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
    const webpPath = path.join(outDir, `${stem}-${w}w.webp`);
    const jpgPath = path.join(outDir, `${stem}-${w}w.jpg`);
    await sharp(resized).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
    await sharp(resized).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(jpgPath);
    console.log("Wrote", webpPath, jpgPath);
  }
}

/**
 * About/Contact portraits: square output (matches CSS square frame + bottom crop).
 * EXIF is applied once: normalize to upright pixels, then resize (avoids double-rotate).
 * Output JPEG/WebP have no orientation tag so the browser won't rotate again.
 */
async function writeSquarePhotoVariants(srcPath, outDir, stem, sidePx) {
  await fs.mkdir(outDir, { recursive: true });
  const upright = await sharp(srcPath).rotate().toBuffer();
  for (const w of sidePx) {
    const resized = await sharp(upright)
      .resize(w, w, {
        fit: "cover",
        position: "bottom",
      })
      .toBuffer();
    const webpPath = path.join(outDir, `${stem}-${w}w.webp`);
    const jpgPath = path.join(outDir, `${stem}-${w}w.jpg`);
    await sharp(resized).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
    await sharp(resized)
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(jpgPath);
    console.log("Wrote", webpPath, jpgPath);
  }
}

const STILL_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".PNG", ".JPG", ".JPEG", ".WEBP"]);

/** Film stills: images/stills/<movieID>/* -> images/stills/<movieID>/generated/<stem>-{400|800|1200}w.{webp,jpg} */
async function processStills() {
  const stillsRoot = path.join(ROOT, "images", "stills");
  if (!(await exists(stillsRoot))) {
    console.warn("Skip stills: missing", stillsRoot);
    return;
  }
  const movieDirs = await fs.readdir(stillsRoot, { withFileTypes: true });
  for (const dirEnt of movieDirs) {
    if (!dirEnt.isDirectory()) continue;
    if (dirEnt.name.startsWith(".")) continue;
    const movieDir = path.join(stillsRoot, dirEnt.name);
    const outDir = path.join(movieDir, "generated");
    const files = await fs.readdir(movieDir, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile()) continue;
      if (f.name.startsWith(".")) continue;
      const ext = path.extname(f.name);
      if (!STILL_EXTS.has(ext)) continue;
      const stem = path.basename(f.name, ext);
      const srcPath = path.join(movieDir, f.name);
      console.log("Still source:", srcPath);
      await writeVariants(srcPath, outDir, stem, POSTER_WIDTHS);
    }
  }
}

async function processPosters() {
  const dir = path.join(ROOT, "images", "movie_posters");
  const outDir = path.join(dir, "generated");
  if (!(await exists(dir))) {
    console.warn("Skip posters: missing", dir);
    return;
  }
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".PNG", ".JPG", ".JPEG", ".WEBP"]);
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name);
    if (!exts.has(ext)) continue;
    if (ent.name.startsWith(".")) continue;
    const stem = path.basename(ent.name, ext);
    if (stem === "generated") continue;
    const srcPath = path.join(dir, ent.name);
    console.log("Poster source:", srcPath);
    await writeVariants(srcPath, outDir, stem, POSTER_WIDTHS);
  }
}

async function processPhoto(relPath, stem, outDir, widths) {
  const srcPath = path.join(ROOT, relPath);
  if (!(await exists(srcPath))) {
    console.warn("Skip (missing):", relPath);
    return;
  }
  console.log("Photo source:", srcPath);
  await writeSquarePhotoVariants(srcPath, outDir, stem, widths);
}

async function main() {
  await processPosters();
  await processStills();
  const photosDir = path.join(ROOT, "images", "photos", "generated");
  await processPhoto("images/about_photo.jpeg", "about_photo", photosDir, PHOTO_WIDTHS);
  await processPhoto("images/contact_photo.jpeg", "contact_photo", photosDir, PHOTO_WIDTHS);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
