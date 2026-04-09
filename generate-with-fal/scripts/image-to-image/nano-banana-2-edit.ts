#!/usr/bin/env bun
import {
  parseToolArgs,
  parseCsv,
  processImageUrls,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/nano-banana-2/edit";
const TOOL_NAME = "nano-banana-2-edit";
const ASPECT_RATIOS = ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"];
const RESOLUTIONS = ["0.5K", "1K", "2K", "4K"];
const FORMATS = ["png", "jpeg", "webp"];
const SAFETY_LEVELS = ["1", "2", "3", "4", "5", "6"];

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to edit the image" },
      image: { type: "images", short: "i", required: true, desc: "Image URL(s) to edit (comma-separated)", placeholder: "URLS" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      aspect: { type: "enum", values: ASPECT_RATIOS, default: "auto", desc: "Aspect ratio" },
      resolution: { type: "enum", values: RESOLUTIONS, default: "1K", desc: "Resolution" },
      format: { type: "enum", values: FORMATS, default: "png", desc: "Output format" },
      safety: { type: "enum", values: SAFETY_LEVELS, default: "4", desc: "Safety tolerance" },
      "web-search": { type: "boolean", default: false, desc: "Enable web search for up-to-date info" },
    },
    {
      scriptName: "nano-banana-2-edit.ts",
      toolName: TOOL_NAME,
      description: "Nano Banana 2 Edit - Image-to-Image Editing (Google)",
      examples: [
        'bun nano-banana-2-edit.ts --prompt "Make it rainy" --image "https://example.com/photo.png"',
        'bun nano-banana-2-edit.ts --prompt "Add mountains" --image "photo.png" --resolution 2K',
        'bun nano-banana-2-edit.ts --prompt "Latest fashion style" --image "person.png" --web-search',
      ],
    }
  );

  const prompt = args.prompt as string;
  const imagePaths = parseCsv(args.image as string);
  if (imagePaths.length === 0) {
    console.error(JSON.stringify({ success: false, error: "No valid image paths provided" }));
    process.exit(1);
  }

  let imageUrls: string[];
  try {
    imageUrls = await processImageUrls(imagePaths);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const input: Record<string, unknown> = {
    prompt,
    image_urls: imageUrls,
    num_images: 1,
    aspect_ratio: args.aspect,
    output_format: args.format,
    safety_tolerance: args.safety,
    resolution: args.resolution,
    limit_generations: true,
    enable_web_search: args["web-search"],
  };
  if (args.seed !== undefined) input.seed = args.seed;

  const startTime = Date.now();
  let response: FalResponse;
  let error: string | null = null;
  try {
    response = await submitSync(ENDPOINT_ID, input);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    response = { error };
  }
  const durationMs = Date.now() - startTime;
  const output = getOutputUrl(response);

  if (args.json) {
    console.log(JSON.stringify({ ...response, durationMs }, null, 2));
    process.exit(error ? 1 : 0);
  }

  if (error || !output) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output URL in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, ENDPOINT_ID, prompt, output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.png";
  const actualSeed = response.seed as number | undefined;
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, seed: actualSeed, durationMs }));
}

main();
