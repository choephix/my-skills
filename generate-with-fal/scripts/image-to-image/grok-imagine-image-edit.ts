#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrls,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "xai/grok-imagine-image/edit";
const TOOL_NAME = "grok-imagine-image-edit";

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to edit the image" },
      image: { type: "images", short: "i", desc: "Image URL(s) to edit (comma-separated)" },
      "num-images": { type: "int", min: 1, max: 4, default: 1, desc: "Number of images to generate" },
      format: { type: "enum", values: ["jpeg", "png", "webp"], default: "jpeg", desc: "Output format" },
    },
    TOOL_NAME,
    "Grok Imagine Image Edit - Image-to-Image Editing"
  );

  const prompt = args.prompt as string;
  let imageUrls: string[] = [];
  if (args.image) {
    try {
      imageUrls = await processImageUrls(args.image as string);
    } catch (err) {
      console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
      process.exit(1);
    }
  }

  const input: Record<string, unknown> = {
    prompt,
    num_images: args["num-images"],
    output_format: args.format,
  };
  if (imageUrls.length > 0) input.image_urls = imageUrls;

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
