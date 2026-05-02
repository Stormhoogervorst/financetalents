"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // used only for image storage upload
import BlogEditor from "@/components/portal/BlogEditor";
import { ChevronLeft, Upload, X, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "carriere", label: "Carrière" },
  { value: "juridisch", label: "Juridisch" },
  { value: "kantoorleven", label: "Werkgeversleven" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewBlogPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("carriere");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Ongeldig bestandstype. Upload een JPG, PNG, WebP of AVIF.");
      setUploading(false);
      return;
    }

    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("[blog-upload] Supabase storage error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      console.error("[blog-upload] Full error:", err);
      setError("Afbeelding uploaden mislukt. Probeer opnieuw.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent, status: "draft" | "published") {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vul een titel in.");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Schrijf eerst de inhoud van je blog.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const slug = slugify(title) + "-" + Date.now().toString(36);

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          category,
          content,
          image_url: imageUrl,
          status,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error ?? "Opslaan mislukt.");
      }

      router.push("/portal/blogs");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Opslaan mislukt. Probeer opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/portal/blogs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar blogs
      </Link>

      <h1 className="text-2xl font-bold text-black mb-8">Nieuwe blog</h1>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bijv. Werken bij een juridische werkgever op de Zuidas"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Omslagfoto
          </label>
          {imagePreview ? (
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-gray-50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">
                {uploading ? "Uploaden…" : "Klik om een afbeelding te uploaden"}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP of AVIF</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>

        {/* Rich text editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inhoud <span className="text-red-500">*</span>
          </label>
          <BlogEditor content={content} onChange={setContent} />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "published")}
            disabled={saving}
            className="btn-primary"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publiceren
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "draft")}
            disabled={saving}
            className="btn-secondary"
          >
            Opslaan als concept
          </button>
        </div>
      </form>
    </div>
  );
}
