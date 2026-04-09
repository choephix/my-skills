#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrl,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/flux-pro/kontext";
const TOOL_NAME = "flux-pro-kontext";
const ASPECT_RATIOS = ["21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21"];

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to edit the image" },
      image: { type: "string", short: "i", required: true, desc: "Image URL or local path to edit" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      guidance: { type: "float", min: 1, max: 20, default: 3.5, desc: "CFG scale (1-20)" },
      aspect: { type: "enum", values: ASPECT_RATIOS, desc: "Aspect ratio" },
      format: { type: "enum", values: ["jpeg", "png"], default: "jpeg", desc: "Output format: jpeg, png" },
      safety: { type: "int", default: 2, desc: "Safety tolerance level 1-6" },
      enhance: { type: "boolean", default: false, desc: "Enhance prompt for better results" },
      notes: { type: "string", desc: "Additional notes for journal entry" },
      json: { type: "boolean", default: false, desc: "Output raw JSON response only (no download)" },
    },
    {
      scriptName: "flux-pro-kontext.ts",
      toolName: TOOL_NAME,
      description: "FLUX Pro Kontext - Image-to-Image Editing",
      examples: [
        'bun flux-pro-kontext.ts --prompt "Put a donut next to the flour" --image "https://example.com/photo.png"',
        'bun flux-pro-kontext.ts --prompt "Add a sunset" --image "photo.jpg" --aspect 16:9',
      ],
    }
  );

  let imageUrl: string;
  try {
    imageUrl = await processImageUrl(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const prompt = args.prompt as string;
  const input: Record<string, unknown> = {
    prompt,
    image_url: imageUrl,
    num_images: 1,
    output_format: args.format,
    guidance_scale: args.guidance,
    safety_tolerance: String(args.safety),
    enhance_prompt: args.enhance,
  };
  if (args.seed !== undefined) input.seed = args.seed;
  if (args.aspect) input.aspect_ratio = args.aspect;

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
    const journalEntry: JournalEntry = {
      endpoint: ENDPOINT_ID,
      tool: TOOL_NAME,
      inputs: input,
      result: response,
      durationMs,
      success: false,
      notes: args.notes as string | undefined,
    };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output URL in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, ENDPOINT_ID, prompt, output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.jpg";
  const actualSeed = response.seed as number | undefined;

  const journalEntry: JournalEntry = {
    endpoint: ENDPOINT_ID,
    tool: TOOL_NAME,
    inputs: input,
    result: response,
    durationMs,
    success: true,
    notes: args.notes as string | undefined,
  };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, seed: actualSeed, durationMs }));
}

main();
