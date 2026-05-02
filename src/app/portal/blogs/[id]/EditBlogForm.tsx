"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import BlogEditor from "@/components/portal/BlogEditor";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { type BlogActionState } from "./actions";

type Props = {
  blogId: string;
  initialTitle: string;
  initialCategory: string;
  initialContent: string;
  initialImageUrl: string | null;
  updateAction: (state: BlogActionState, formData: FormData) => Promise<BlogActionState>;
  deleteAction: () => Promise<never>;
};

const CATEGORIES = [
  { value: "carriere", label: "Carrière" },
  { value: "juridisch", label: "Juridisch" },
  { value: "kantoorleven", label: "Werkgeversleven" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Wijzigingen opslaan
    </button>
  );
}

function DeleteButton({ confirmDelete }: { confirmDelete: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={confirmDelete}
      disabled={pending}
      className="btn-danger"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Blog verwijderen
    </button>
  );
}

export default function EditBlogForm({
  blogId,
  initialTitle,
  initialCategory,
  initialContent,
  initialImageUrl,
  updateAction,
  deleteAction,
}: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [state, formAction] = useActionState(updateAction, {});

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setLocalError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Ongeldig bestandstype. Upload een JPG, PNG, WebP of AVIF.");
      setUploading(false);
      return;
    }

    try {
      const ext = file.name.split(".").pop();
      const path = `${blogId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error(error);
      setLocalError("Afbeelding uploaden mislukt. Probeer opnieuw.");
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete() {
    const shouldDelete = window.confirm(
      "Weet je zeker dat je deze blog wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
    );
    if (!shouldDelete) return;
    deleteFormRef.current?.requestSubmit();
  }

  return (
    <>
      <form className="space-y-6" action={formAction}>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="image_url" value={imageUrl ?? ""} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Bijv. Werken bij een juridische werkgever op de Zuidas"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Omslagfoto</label>
          {imagePreview ? (
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                {uploading ? "Uploaden..." : "Klik om een afbeelding te uploaden"}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP of AVIF</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImageUpload(file);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inhoud <span className="text-red-500">*</span>
          </label>
          <BlogEditor content={content} onChange={setContent} />
        </div>

        {(localError || state?.error) && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            {localError ?? state?.error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <SaveButton />
        </div>
      </form>

      <form ref={deleteFormRef} action={deleteAction} className="pt-8">
        <DeleteButton confirmDelete={confirmDelete} />
      </form>
    </>
  );
}
