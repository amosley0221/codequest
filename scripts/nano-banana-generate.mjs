#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [promptArg, outputArg = "assets/nano-banana-output.png"] = process.argv.slice(2);
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.NANO_BANANA_MODEL || "gemini-2.5-flash-image";

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY. Set it before running this script.");
  process.exit(1);
}

if (!promptArg) {
  console.error('Usage: GEMINI_API_KEY="..." node scripts/nano-banana-generate.mjs "pixel art hero sprite" assets/hero.png');
  process.exit(1);
}

const endpoint = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
endpoint.searchParams.set("key", apiKey);

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: promptArg }]
      }
    ],
    generationConfig: {
      responseModalities: ["IMAGE"]
    }
  })
});

if (!response.ok) {
  const detail = await response.text();
  console.error(`Nano Banana request failed: ${response.status} ${response.statusText}`);
  console.error(detail);
  process.exit(1);
}

const data = await response.json();
const parts = data?.candidates?.[0]?.content?.parts || [];
const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
const inlineData = imagePart?.inlineData || imagePart?.inline_data;

if (!inlineData?.data) {
  console.error("Nano Banana did not return image data.");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const outputPath = resolve(outputArg);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(inlineData.data, "base64"));

console.log(`Saved ${inlineData.mimeType || inlineData.mime_type || "image"} to ${outputPath}`);
