import type { Request, Response } from "express";
import { Router } from "express";
import { supabase } from "./supabase";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, negativePrompt, style, aspectRatio, verticalId } = req.body as {
      prompt?: string;
      negativePrompt?: string;
      style?: string;
      aspectRatio?: string;
      verticalId?: string;
    };

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const dimensions = getDimensions(aspectRatio || "1:1");

    const { data: record, error: insertError } = await supabase
      .from("generated_images")
      .insert({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt?.trim() || null,
        style: style || "auto",
        aspect_ratio: aspectRatio || "1:1",
        width: dimensions.width,
        height: dimensions.height,
        status: "pending",
        vertical_id: verticalId || null,
      })
      .select("*")
      .single();

    if (insertError || !record) {
      return res.status(500).json({ error: "Failed to create image record" });
    }

    generateImageAsync(record.id, prompt.trim(), negativePrompt, style, aspectRatio);

    return res.json(record);
  } catch {
    return res.status(500).json({ error: "Failed to initiate image generation" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch images" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ error: "Image not found" });
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Image not found" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to fetch image" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete image" });
  }
});

router.get("/:id/download", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("id, prompt, image_data, image_url")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Image not found" });

    if (data.image_data) {
      const base64Match = (data.image_data as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) return res.status(500).json({ error: "Invalid image data" });

      const buffer = Buffer.from(base64Match[2], "base64");
      const slug = (data.prompt as string).slice(0, 40).replace(/[^a-zA-Z0-9]/g, "_");
      res.setHeader("Content-Type", base64Match[1]);
      res.setHeader("Content-Disposition", `attachment; filename="generated_${slug}.png"`);
      res.setHeader("Content-Length", buffer.length.toString());
      return res.send(buffer);
    }

    if (data.image_url) {
      return res.redirect(data.image_url as string);
    }

    return res.status(404).json({ error: "No image data available" });
  } catch {
    return res.status(500).json({ error: "Failed to download image" });
  }
});

function getDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9": return { width: 1024, height: 576 };
    case "9:16": return { width: 576, height: 1024 };
    case "4:3": return { width: 1024, height: 768 };
    case "3:4": return { width: 768, height: 1024 };
    case "1:1":
    default: return { width: 1024, height: 1024 };
  }
}

function getOpenAISize(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9": return "1792x1024";
    case "9:16": return "1024x1792";
    case "4:3":
    case "3:4":
    case "1:1":
    default: return "1024x1024";
  }
}

async function generateImageAsync(
  recordId: string,
  prompt: string,
  negativePrompt?: string,
  _style?: string,
  aspectRatio?: string,
) {
  try {
    const apiKey = process.env.IMAGE_GEN_API_KEY
      ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY
      ?? process.env.OPENAI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
      ?? process.env.OPENAI_BASE_URL
      ?? "https://api.openai.com/v1";

    if (!apiKey) {
      await supabase
        .from("generated_images")
        .update({
          status: "failed",
          error_message: "Image generation API key not configured. Please add IMAGE_GEN_API_KEY.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);
      return;
    }

    const body: Record<string, unknown> = {
      model: "dall-e-3",
      prompt: negativePrompt ? `${prompt}. Avoid: ${negativePrompt}` : prompt,
      n: 1,
      size: getOpenAISize(aspectRatio || "1:1"),
      response_format: "b64_json",
    };

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      await supabase
        .from("generated_images")
        .update({
          status: "failed",
          error_message: `API error ${response.status}: ${errText.slice(0, 500)}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);
      return;
    }

    const result = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const imageResult = result.data?.[0];

    if (imageResult?.b64_json) {
      const imageData = `data:image/png;base64,${imageResult.b64_json}`;
      await supabase
        .from("generated_images")
        .update({
          status: "completed",
          image_data: imageData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);
    } else if (imageResult?.url) {
      await supabase
        .from("generated_images")
        .update({
          status: "completed",
          image_url: imageResult.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);
    } else {
      await supabase
        .from("generated_images")
        .update({
          status: "failed",
          error_message: "No image returned from API",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown generation error";
    await supabase
      .from("generated_images")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recordId);
  }
}

export { router as imageGenRouter };
