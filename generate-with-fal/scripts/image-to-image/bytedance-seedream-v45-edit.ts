#!/usr/bin/env bun
import {
  parseToolArgs,
  SEEDREAM_SIZES,
  processImageUrls,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/bytedance/seedream/v4.5/edit";
const TOOL_NAME = "bytedance-seedream-v45-edit";

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "Text prompt to edit the image" },
      image: { type: "images", short: "i", required: true, desc: "Image URL(s) to edit (comma-separated, max 10)" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      size: { type: "size", presets: SEEDREAM_SIZES, default: "2048x2048", desc: "Image size preset or custom WxH" },
      "num-images": { type: "int", min: 1, max: 6, default: 1, desc: "Number of images to generate" },
      "max-images": { type: "int", min: 1, max: 6, default: 1, desc: "Max images per generation" },
      safety: { type: "boolean", default: true, desc: "Enable safety checker" },
    },
    TOOL_NAME,
    "ByteDance Seedream V4.5 Edit - Image Editing"
  );

  const prompt = args.prompt as string;
  let imageUrls: string[];
  try {
    imageUrls = await processImageUrls(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const input: Record<string, unknown> = {
    prompt,
    image_urls: imageUrls,
    image_size: args.size,
    num_images: args["num-images"],
    max_images: args["max-images"],
    enable_safety_checker: args.safety,
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
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, durationMs }));
}

main();
