import { parseArgs } from "node:util";

/**
 * Shared utilities for fal.ai generation tools
 */

const FAL_KEY = process.env.FAL_KEY || Bun.env.FAL_KEY;
const BASE_DIR = "/home/workspace/Generations";
const JOURNAL_DIR = "/home/workspace/Generations/.journal";
const EPOCH_OFFSET = new Date("2025-01-01T00:00:00Z").getTime();

export interface FalConfig {
  endpointId: string;
  category: string;
}

export interface GenerationResult {
  success: boolean;
  url?: string;
  localPath?: string;
  journalPath?: string;
  seed?: number;
  error?: string;
  durationMs?: number;
  width?: number;
  height?: number;
}

export interface RunFalRequestResult {
  response: FalResponse;
  error: string | null;
  durationMs: number;
}

export interface FinalizeOutputOptions {
  endpointId: string;
  toolName: string;
  prompt?: string;
  inputs: Record<string, unknown>;
  response: FalResponse;
  error: string | null;
  durationMs: number;
  jsonOnly?: boolean;
  notes?: string;
  output?: { url: string; contentType?: string; width?: number; height?: number } | null;
  fallbackError?: string;
  filePrompt?: string;
  seed?: number;
  extraResult?: Record<string, unknown>;
}

export interface FalResponse {
  images?: Array<{ url: string; file_name?: string; content_type?: string; width?: number; height?: number }>;
  audio?: Array<{ url: string; file_name?: string; content_type?: string }>;
  model_mesh?: { url: string; file_name?: string; content_type?: string };
  model_glb?: { url: string; file_name?: string; content_type?: string };
  gaussian_splat?: { url: string; file_name?: string; content_type?: string };
  thumbnail?: { url: string; file_name?: string; content_type?: string };
  [key: string]: unknown;
}

export interface JournalEntry {
  endpoint: string;
  tool: string;
  inputs: Record<string, unknown>;
  result: FalResponse | { error: string };
  durationMs: number;
  success: boolean;
  notes?: string;
}

/**
 * Generate a base26 UID from current timestamp (offset from 2025-01-01)
 */
export function generateUID(): string {
  const now = Date.now() - EPOCH_OFFSET;
  return toBase26(now);
}

/**
 * Upload a local file to fal.ai storage
 * Returns the URL to use in API calls
 */
export async function uploadFile(localPath: string, targetPath?: string): Promise<string> {
  if (!FAL_KEY) {
    throw new Error("FAL_KEY not found in environment variables");
  }

  // Generate target path if not provided
  const filename = localPath.split("/").pop() || "file";
  const uid = generateUID();
  const path = targetPath || `uploads/${uid}-${filename}`;

  // Read file
  const file = Bun.file(localPath);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${localPath}`);
  }

  // Upload via multipart/form-data
  const formData = new FormData();
  formData.append("file_upload", file);

  const response = await fetch(`https://api.fal.ai/v1/serverless/files/file/local/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${text}`);
  }

  // Return the URL that can be used in API calls
  return `https://fal.media/files/${path}`;
}

function toBase26(num: number): string {
  if (num === 0) return "a";
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  while (num > 0) {
    result = chars[num % 26] + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/**
 * Slugify an endpoint ID (fal-ai/flux-2/klein/9b -> flux-2-klein-9b)
 */
export function slugifyEndpoint(endpointId: string): string {
  const parts = endpointId.split("/");
  const relevant = parts.slice(-3).join("-");
  return relevant.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

/**
 * Extract first few words from prompt for filename
 */
export function extractPromptWords(prompt: string, maxWords: number = 5): string {
  if (!prompt) return "";
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, maxWords);
  return words.join("-");
}

/**
 * Get date folder name (YYMMDD)
 */
export function getDateFolder(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Build output filename: <uid>-<endpoint-slug>-<prompt-words>.<ext>
 */
export function buildFilename(
  endpointId: string,
  prompt: string | undefined,
  extension: string
): string {
  const uid = generateUID();
  const endpointSlug = slugifyEndpoint(endpointId);
  const promptWords = prompt ? extractPromptWords(prompt) : "";
  
  if (promptWords) {
    return `${uid}-${endpointSlug}-${promptWords}.${extension}`;
  }
  return `${uid}-${endpointSlug}.${extension}`;
}

/**
 * Save journal entry as markdown
 */
export async function saveJournalEntry(
  endpointId: string,
  filename: string,
  entry: JournalEntry
): Promise<string> {
  const dateFolder = getDateFolder();
  const journalDir = `${JOURNAL_DIR}/${dateFolder}`;
  const journalPath = `${journalDir}/${filename.replace(/\.[^.]+$/, ".md")}`;
  
  // Ensure directory exists
  await Bun.write(journalDir + "/.keep", "");
  
  // Build markdown content
  const lines = [
    `# Generation: ${filename}`,
    "",
    `**Status**: ${entry.success ? "✅ Success" : "❌ Failed"}`,
    `**Endpoint**: \`${entry.endpoint}\``,
    `**Tool**: \`${entry.tool}\``,
    `**Duration**: ${(entry.durationMs / 1000).toFixed(2)}s`,
    "",
    "## Inputs",
    "",
    "```json",
    JSON.stringify(entry.inputs, null, 2),
    "```",
    "",
    "## Result",
    "",
    "```json",
    JSON.stringify(entry.result, null, 2),
    "```",
  ];
  
  if (entry.notes) {
    lines.push("", "## Notes", "", entry.notes);
  }
  
  if (!entry.success) {
    lines.push("", "## Error", "", "See result above for error details.");
  }
  
  await Bun.write(journalPath, lines.join("\n"));
  return journalPath;
}

/**
 * Submit request to fal.ai (sync mode)
 */
export async function submitSync(
  endpointId: string,
  input: Record<string, unknown>
): Promise<FalResponse> {
  if (!FAL_KEY) {
    throw new Error("FAL_KEY not found in environment variables");
  }

  const url = `https://fal.run/${endpointId}`;
  
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`API error ${resp.status}: ${error}`);
  }

  return resp.json();
}

export async function runFalRequest(
  endpointId: string,
  input: Record<string, unknown>
): Promise<RunFalRequestResult> {
  const startTime = Date.now();
  let response: FalResponse;
  let error: string | null = null;

  try {
    response = await submitSync(endpointId, input);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    response = { error };
  }

  return {
    response,
    error,
    durationMs: Date.now() - startTime,
  };
}

export async function finalizeStandardOutput(
  options: FinalizeOutputOptions
): Promise<GenerationResult> {
  const {
    endpointId,
    toolName,
    prompt,
    inputs,
    response,
    error,
    durationMs,
    jsonOnly,
    notes,
    output = getOutputUrl(response),
    fallbackError = "No output URL in response",
    filePrompt,
    seed,
    extraResult,
  } = options;

  if (jsonOnly) {
    console.log(JSON.stringify({ ...response, durationMs }, null, 2));
    process.exit(error ? 1 : 0);
  }

  if (error || !output) {
    const filename = `error-${toolName}-${Date.now()}.md`;
    const journalEntry: JournalEntry = {
      endpoint: endpointId,
      tool: toolName,
      inputs,
      result: response,
      durationMs,
      success: false,
      notes,
    };
    await saveJournalEntry(endpointId, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? fallbackError }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, endpointId, filePrompt ?? prompt, output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.bin";
  const journalEntry: JournalEntry = {
    endpoint: endpointId,
    tool: toolName,
    inputs,
    result: response,
    durationMs,
    success: true,
    notes,
  };
  const journalPath = await saveJournalEntry(endpointId, filename, journalEntry);

  const result: GenerationResult = {
    success: true,
    url: output.url,
    localPath,
    journalPath,
    seed,
    durationMs,
    width: output.width,
    height: output.height,
    ...extraResult,
  };

  console.log(JSON.stringify(result));
  return result;
}

/**
 * Download a file from URL and save to generations directory
 */
export async function downloadAndSave(
  url: string,
  endpointId: string,
  prompt: string | undefined = undefined,
  contentType?: string
): Promise<string> {
  const extension = getExtension(url, contentType);
  const filename = buildFilename(endpointId, prompt, extension);
  const dateFolder = getDateFolder();
  
  const outputDir = `${BASE_DIR}/${dateFolder}`;
  const outputPath = `${outputDir}/${filename}`;
  
  // Ensure directory exists
  await Bun.write(outputDir + "/.keep", "");
  
  // Download file
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to download: ${resp.status}`);
  }
  
  const buffer = await resp.arrayBuffer();
  await Bun.write(outputPath, buffer);
  
  return outputPath;
}

/**
 * Get file extension from URL or content type
 */
export function getExtension(url: string, contentType?: string): string {
  // Try URL first
  const urlExt = url.split(".").pop()?.split("?")[0];
  if (urlExt && urlExt.length <= 5) {
    return urlExt;
  }
  
  // Fall back to content type
  if (contentType) {
    const map: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "model/gltf-binary": "glb",
      "model/obj": "obj",
    };
    return map[contentType] ?? "bin";
  }
  
  return "bin";
}

/**
 * Extract output URL from fal response
 */
export function getOutputUrl(response: FalResponse): { url: string; contentType?: string } | null {
  if (response.images?.[0]) {
    return {
      url: response.images[0].url,
      contentType: response.images[0].content_type,
      width: response.images[0].width,
      height: response.images[0].height,
    };
  }
  // Handle single image field (e.g., birefnet returns `image` not `images`)
  if (response.image && typeof response.image === "object" && "url" in response.image) {
    const img = response.image as { url: string; content_type?: string; width?: number; height?: number };
    return { url: img.url, contentType: img.content_type, width: img.width, height: img.height };
  }
  if (response.audio?.[0]) {
    return { url: response.audio[0].url, contentType: response.audio[0].content_type };
  }
  if (response.model_mesh) {
    return { url: response.model_mesh.url, contentType: response.model_mesh.content_type };
  }
  return null;
}

/**
 * ============ Argument Parsing Utilities ============
 */

export interface ArgSchema {
  type: "string" | "int" | "float" | "boolean" | "enum" | "size" | "image" | "images";
  short?: string;
  required?: boolean;
  default?: unknown;
  desc?: string;
  placeholder?: string;
  // For int type
  min?: number;
  max?: number;
  // For enum type
  values?: string[];
  // For size type
  presets?: Record<string, string>;
}

export interface ParsedArgs {
  [key: string]: unknown;
  help: boolean;
  json: boolean;
  notes?: string;
}

export interface ParseToolArgsOptions {
  scriptName: string;
  toolName?: string;
  description: string;
  examples?: string[];
}

/**
 * Parse command-line arguments from a schema
 * Auto-generates help, validates required fields, coerces types
 */
export function parseToolArgs(
  schema: Record<string, ArgSchema>,
  toolNameOrOptions: string | ParseToolArgsOptions,
  description?: string,
  args: string[] = Bun.argv.slice(2)
): ParsedArgs {
  const meta: ParseToolArgsOptions = typeof toolNameOrOptions === "string"
    ? {
        scriptName: `${toolNameOrOptions}.ts`,
        toolName: toolNameOrOptions,
        description: description ?? "",
      }
    : toolNameOrOptions;

  // Add built-in args
  const fullSchema: Record<string, ArgSchema> = {
    ...schema,
    notes: { type: "string", desc: "Additional notes for journal entry" },
    json: { type: "boolean", default: false, desc: "Output raw JSON response only" },
    help: { type: "boolean", short: "h", default: false, desc: "Show this help" },
  };

  // Build parseArgs config
  const options: Record<string, { type: "string" | "boolean"; short?: string; default?: string | boolean }> = {};
  for (const [key, def] of Object.entries(fullSchema)) {
    const opt: { type: "string" | "boolean"; short?: string; default?: string | boolean } = {
      type: def.type === "boolean" ? "boolean" : "string",
    };
    if (def.short !== undefined) opt.short = def.short;
    // Convert defaults to strings for non-boolean types (parseArgs requirement)
    if (def.default !== undefined) {
      opt.default = def.type === "boolean" ? def.default as boolean : String(def.default);
    }
    options[key] = opt;
  }

  const { values } = parseArgs({ options, strict: false, args });

  // Show help if requested
  if (values.help) {
    showHelpFromSchema(schema, meta);
    process.exit(0);
  }

  // Validate required fields
  for (const [key, def] of Object.entries(schema)) {
    if (def.required && values[key] === undefined) {
      console.error(JSON.stringify({ success: false, error: `Missing required --${key}` }));
      process.exit(1);
    }
  }

  // Parse and coerce values
  const result: ParsedArgs = { help: false, json: false };

  for (const [key, def] of Object.entries(fullSchema)) {
    const rawValue = values[key];
    
    if (rawValue === undefined || rawValue === false) {
      if (def.default !== undefined) {
        result[key] = def.default;
      }
      continue;
    }

    switch (def.type) {
      case "string":
        result[key] = rawValue as string;
        break;

      case "int": {
        const num = parseInt(rawValue as string, 10);
        if (isNaN(num)) {
          console.error(JSON.stringify({ success: false, error: `Invalid number for --${key}: ${rawValue}` }));
          process.exit(1);
        }
        result[key] = def.min !== undefined && def.max !== undefined
          ? Math.min(def.max, Math.max(def.min, num))
          : num;
        break;
      }

      case "float": {
        const num = parseFloat(rawValue as string);
        if (isNaN(num)) {
          console.error(JSON.stringify({ success: false, error: `Invalid number for --${key}: ${rawValue}` }));
          process.exit(1);
        }
        result[key] = def.min !== undefined && def.max !== undefined
          ? Math.min(def.max, Math.max(def.min, num))
          : num;
        break;
      }

      case "boolean":
        result[key] = rawValue as boolean;
        break;

      case "enum": {
        const val = rawValue as string;
        if (def.values && !def.values.includes(val)) {
          console.error(JSON.stringify({ success: false, error: `Invalid --${key}: ${val}. Valid values: ${def.values.join(", ")}` }));
          process.exit(1);
        }
        result[key] = val;
        break;
      }

      case "size": {
        result[key] = parseSize(rawValue as string, def.presets);
        break;
      }

      case "image":
      case "images":
        // Will be processed asynchronously later
        result[key] = rawValue;
        break;

      default:
        result[key] = rawValue;
    }
  }

  return result;
}

/**
 * Auto-generate help text from schema
 */
function showHelpFromSchema(
  schema: Record<string, ArgSchema>,
  meta: ParseToolArgsOptions
): void {
  const title = meta.toolName ?? meta.scriptName.replace(/\.ts$/, "");
  const lines: string[] = [
    "",
    title,
    "",
    meta.description,
    "",
    "Usage:",
  ];

  const requiredArgs = Object.entries(schema)
    .filter(([, def]) => def.required)
    .map(([key, def]) => `--${key} <${def.placeholder ?? (key === "prompt" ? "TEXT" : key === "image" ? "URL" : "VALUE")}>`);

  if (requiredArgs.length > 0) {
    lines.push(`  bun ${meta.scriptName} ${requiredArgs.join(" ")} [options]`);
  }
  lines.push(`  bun ${meta.scriptName} [options]`);
  lines.push("", "Options:");

  for (const [key, def] of Object.entries(schema)) {
    const required = def.required ? "(required) " : "";
    const defaultStr = def.default !== undefined ? ` (default: ${JSON.stringify(def.default)})` : "";
    const desc = def.desc ?? "";
    const lowerDesc = desc.toLowerCase();

    let hint = "";
    if ((def.type === "int" || def.type === "float") && def.min !== undefined && def.max !== undefined) {
      const rangeText = `${def.min}-${def.max}`;
      if (!lowerDesc.includes(rangeText.toLowerCase())) {
        hint = ` (${rangeText})`;
      }
    } else if (def.type === "enum" && def.values) {
      const enumText = def.values.join(", ");
      if (!lowerDesc.includes(enumText.toLowerCase())) {
        hint = `: ${enumText}`;
      }
    } else if (def.type === "size" && def.presets) {
      const presetList = Object.keys(def.presets).slice(0, 6).join(", ");
      if (!lowerDesc.includes("preset")) {
        hint = `. Presets: ${presetList}${Object.keys(def.presets).length > 6 ? ", ..." : ""}`;
      }
    }

    lines.push(`  --${key.padEnd(16)} ${required}${desc}${hint}${defaultStr}`.trimEnd());
  }

  lines.push(`  --notes            Additional notes for journal entry`);
  lines.push(`  --json             Output raw JSON response only`);
  lines.push(`  --help             Show this help`);

  if (meta.examples?.length) {
    lines.push("", "Examples:");
    for (const example of meta.examples) lines.push(`  ${example}`);
  }

  lines.push("");
  console.log(lines.join("\n"));
}

/**
 * Parse size argument (preset or WxH format)
 */
export function parseSize(
  value: string,
  presets?: Record<string, string>
): string | { width: number; height: number } {
  if (presets && presets[value]) {
    return presets[value];
  }
  
  if (value.includes("x")) {
    const [w, h] = value.split("x").map((n) => parseInt(n, 10));
    if (w && h && w > 0 && h > 0) {
      return { width: w, height: h };
    }
  }
  
  return value;
}

// Common size presets
export const FLUX_SIZES: Record<string, string> = {
  square_hd: "square_hd",
  square: "square",
  portrait_4_3: "portrait_4_3",
  portrait_16_9: "portrait_16_9",
  landscape_4_3: "landscape_4_3",
  landscape_16_9: "landscape_16_9",
};

export const FLUX_SIZES_WITH_AUTO: Record<string, string> = {
  auto: "auto",
  ...FLUX_SIZES,
};

export const SEEDREAM_SIZES: Record<string, string> = {
  ...FLUX_SIZES,
  auto_2K: "auto_2K",
  auto_4K: "auto_4K",
};

/**
 * ============ Image Utilities ============
 */

/**
 * Convert a local image file to a data URL
 */
export async function imageToDataUrl(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${path}`);
  }
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const ext = path.split(".").pop()?.toLowerCase() ?? "png";
  
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  
  const mime = mimeTypes[ext] ?? "image/png";
  return `data:${mime};base64,${base64}`;
}

/**
 * Process image argument - handle URLs, local paths, and comma-separated values
 * Returns array of URLs (local files converted to data URLs)
 */
export async function processImageUrls(input: string): Promise<string[]> {
  const urls: string[] = [];
  const parts = input.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.startsWith("/") || part.startsWith("./")) {
      urls.push(await imageToDataUrl(part));
    } else {
      urls.push(part);
    }
  }
  
  return urls;
}

/**
 * Process single image URL - returns URL or data URL for local files
 */
export async function processImageUrl(input: string): Promise<string> {
  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("data:")) {
    return input;
  }
  return imageToDataUrl(input);
}

export function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
