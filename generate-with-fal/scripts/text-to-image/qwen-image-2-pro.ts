#!/usr/bin/env bun
import {
  parseToolArgs,
  FLUX_SIZES,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/qwen-image-2/pro/text-to-image";
const TOOL_NAME = "qwen-image-2-pro";

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to generate from (supports Chinese and English)" },
      seed: { type: "int", min: 0, max: 2147483647, desc: "Random seed for reproducibility (0-2147483647)" },
      size: { type: "size", presets: FLUX_SIZES, default: "square_hd", desc: "Image size preset or custom WxH" },
      format: { type: "enum", values: ["jpeg", "png", "webp"], default: "png", desc: "Output format: jpeg, png, webp" },
      negative: { type: "string", desc: "Negative prompt (max 500 chars)" },
      expand: { type: "boolean", default: true, desc: "Enable prompt expansion for better results" },
      safety: { type: "boolean", default: true, desc: "Enable safety checker" },
      notes: { type: "string", desc: "Additional notes for journal entry" },
      json: { type: "boolean", default: false, desc: "Output raw JSON response only (no download)" },
    },
    {
      scriptName: "qwen-image-2-pro.ts",
      toolName: TOOL_NAME,
      description: "Qwen Image 2 Pro - Text-to-Image Generation",
      examples: [
        'bun qwen-image-2-pro.ts --prompt "A cyberpunk city at night"',
        'bun qwen-image-2-pro.ts --prompt "可爱的熊猫在吃竹子" --size square --seed 12345',
      ],
    }
  );

  const prompt = args.prompt as string;
  const negative = ((args.negative as string | undefined) ?? "").slice(0, 500);

  const input: Record<string, unknown> = {
    prompt,
    num_images: 1,
    image_size: args.size,
    output_format: args.format,
    negative_prompt: negative,
    enable_prompt_expansion: args.expand,
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
  const filename = localPath.split("/").pop() ?? "unknown.png";
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
