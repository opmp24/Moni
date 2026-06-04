import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, "..", "public")

const sizes = [192, 512]

async function main() {
  const svgContent = readFileSync(join(publicDir, "pwa-192x192.svg"), "utf-8")

  for (const size of sizes) {
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toBuffer()

    writeFileSync(join(publicDir, `pwa-${size}x${size}.png`), pngBuffer)
    console.log(`✓ Generated pwa-${size}x${size}.png`)
  }
}

main().catch(console.error)
