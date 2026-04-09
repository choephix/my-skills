# How to Add a New Endpoint

Step-by-step guide for adding a new fal.ai model to the skill.

## Output Structure

All outputs follow this pattern:
- **Files**: `/home/workspace/Generations/<YYMMDD>/<uid>-<endpoint-slug>-<prompt-words>.<ext>`
- **Journal**: `/home/workspace/Generations/.journal/<YYMMDD>/<same-filename>.md`

The `scripts/common/lib.ts` handles:
- UID generation (base26 from offset timestamp)
- Filename building
- Journal entry saving
- Downloading and saving files

## Step 1: Gather Information

You need:
- **Endpoint ID** (e.g., `fal-ai/flux-2/klein/9b`)
- **OpenAPI Schema** — parameter names, types, defaults
- **LLMS.txt** — usage examples and descriptions

### Fetch the schema:

```
https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2/klein/9b
```

### Fetch the docs:

```
https://fal.ai/models/fal-ai/flux-2/klein/9b/llms.txt
```

The schema gives you exact parameter names and types. The llms.txt gives you descriptions and examples.

## Step 2: Create the Tool Script

Create `scripts/<category>/<endpoint-slug>.ts` (use `flux-2-klein-9b.ts` as template).

Key elements:
1. **Import from lib.ts**: `submitSync`, `downloadAndSave`, `saveJournalEntry`, `getOutputUrl`, `type JournalEntry`
2. **Define constants**: `ENDPOINT_ID`, `TOOL_NAME`, defaults
3. **Parse args**: Use `node:util` parseArgs
4. **Build input object**: Map CLI args to API params (always set `num_images: 1`)
5. **Track timing**: `Date.now()` before and after
6. **Handle errors**: Catch exceptions, still save journal with error info
7. **Download & journal**: Use lib functions

### Template:

```typescript
#!/usr/bin/env bun
import { parseArgs } from "node:util";
import {
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/your-endpoint/id";
const TOOL_NAME = "your-tool-name";

// ... options parsing ...

async function main() {
  // Parse args
  // Build input object
  // Track timing
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

  // Get output, download, save journal
  // ...
}

main();
```

## Step 3: Create the Tool Docs

Create `scripts/<category>/<endpoint-slug>.md` with:
- Quick usage examples
- All options table
- API reference link

## Step 4: Update the Index

Add entry to `assets/endpoints-index.yaml`:

```yaml
- id: "fal-ai/your-endpoint/id"
  display_name: "Human Readable Name"
  short_names:
    - "short"
    - "names"
  category: "text-to-image"  # or text-to-3d, text-to-audio, image-to-image, etc.
  description: "Brief description"
  tool_script: "scripts/<category>/your-tool.ts"
  tool_docs: "scripts/<category>/your-tool.md"
  notes: "Any caveats or preferences"
```

## Step 5: Test

```bash
bun scripts/<category>/your-tool.ts --prompt "test prompt"
```

Verify:
- Output file in correct directory
- Journal entry created
- Correct filename format

## Common Adjustments

### Different output fields

If the model returns different field names than `images`, `audio`, etc., update `scripts/common/lib.ts` `getOutputUrl()`.

### Slow models

For models that timeout with sync API, you may need to use the queue API instead. Add `submitAndWait` function to `scripts/common/lib.ts` if needed.

### Input files

For models that accept input files (image-to-image, etc.):

1. **URL input**: Pass directly to the API
   ```typescript
   input.image_url = "https://example.com/image.png";
   ```

2. **Local file**: Upload first, then use the returned URL
   ```typescript
   import { uploadFile } from "../common/lib.ts";
   
   const falUrl = await uploadFile(localPath);
   input.image_url = falUrl;
   ```

3. **Journal entry**: Note the source in the journal
   - For URLs: note the URL
   - For local files: note the local path

The `uploadFile()` function handles:
- Multipart form-data upload
- Generating unique target paths
- Returning a usable fal.media URL
