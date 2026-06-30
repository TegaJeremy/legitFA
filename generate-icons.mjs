import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

await sharp("src/assets/logo.png").resize(192, 192).toFile("public/icons/icon-192.png");
await sharp("src/assets/logo.png").resize(512, 512).toFile("public/icons/icon-512.png");

console.log("Icons generated!");