#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrl,
  downloadAndSave,
  saveJournalEntry,
  submitSync,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/birefnet/v2";
const TOOL_NAME = "birefnet-v2";
const MODELS = ["General Use (Light)", "General Use (Light 2K)", "General Use (Heavy)", "Matting", "Portrait", "General Use (Dynamic)"];
const RESOLUTIONS = ["1024x1024", "2048x2048", "2304x2304"];

async function main() {
  const args = parseToolArgs(
    {
      image: { type: "image", short: "i", required: true, desc: "URL or local path of the image to remove background from" },
      model: { type: "enum", values: MODELS, default: "General Use (Light)", desc: "Model to use" },
      resolution: { type: "enum", values: RESOLUTIONS, default: "1024x1024", desc: "Operating resolution" },
      "output-mask": { type: "boolean", default: false, desc: "Output the mask used to remove background" },
      refine: { type: "boolean", default: true, desc: "Refine foreground using estimated mask" },
      format: { type: "enum", values: ["png", "webp", "gif"], default: "png", desc: "Output format" },
    },
    TOOL_NAME,
    "BiRefNet V2 - Background Removal"
  );

  let imageUrl: string;
  try {
    imageUrl = await processImageUrl(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const input: Record<string, unknown> = {
    image_url: imageUrl,
    model: args.model,
    operating_resolution: args.resolution,
    output_mask: args["output-mask"],
    refine_foreground: args.refine,
    output_format: args.format,
  };

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

  if (args.json) {
    console.log(JSON.stringify({ ...response, durationMs }, null, 2));
    process.exit(error ? 1 : 0);
  }

  const image = response.image as { url: string; content_type?: string } | undefined;
  const mask = response.mask_image as { url: string; content_type?: string } | undefined;
  if (error || !image?.url) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(image.url, ENDPOINT_ID, "background-removal", image.content_type);
  let maskPath: string | undefined;
  if (mask?.url) maskPath = await downloadAndSave(mask.url, ENDPOINT_ID, "background-mask", mask.content_type);
  const filename = localPath.split("/").pop() ?? "unknown.png";
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: image.url, localPath, maskUrl: mask?.url, maskPath, journalPath, durationMs }));
}

main();
