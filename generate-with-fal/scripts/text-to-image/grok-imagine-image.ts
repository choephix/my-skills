#!/usr/bin/env bun
import {
  parseToolArgs,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "xai/grok-imagine-image";
const TOOL_NAME = "grok-imagine-image";
const ASPECT_RATIOS = ["2:1", "20:9", "19.5:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:19.5", "9:20", "1:2"];

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to generate from" },
      "aspect-ratio": { type: "enum", values: ASPECT_RATIOS, default: "1:1", desc: "Aspect ratio" },
      "num-images": { type: "int", min: 1, max: 4, default: 1, desc: "Number of images to generate" },
      format: { type: "enum", values: ["jpeg", "png", "webp"], default: "jpeg", desc: "Output format" },
    },
    TOOL_NAME,
    "Grok Imagine Image - Text-to-Image Generation"
  );

  const prompt = args.prompt as string;
  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: args["aspect-ratio"],
    num_images: args["num-images"],
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
  const filename = localPath.split("/").pop() ?? "unknown.jpg";
  const revisedPrompt = response.revised_prompt as string | undefined;
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, revisedPrompt, durationMs }));
}

main();
