import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { messageFor } from "@/lib/format";
import { uploadMedia, useSignedUrl, type MediaBucket } from "@/lib/media";

export function ImageUpload({
  bucket,
  shopId,
  value,
  onChange,
  aspect = 1,
  label,
  className = "size-24",
}: {
  bucket: MediaBucket;
  shopId: string;
  value: string | null;
  onChange: (path: string | null) => void;
  aspect?: number;
  label: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { data: url } = useSignedUrl(bucket, value);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadMedia(bucket, shopId, file, aspect);
      onChange(path);
    } catch (e) {
      toast.error(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={label}
        className={`glass-card relative grid place-items-center overflow-hidden ${className} ${
          busy ? "animate-aurora" : ""
        }`}
        style={{ aspectRatio: String(aspect) }}
      >
        {url ? (
          <img src={url} alt={label} className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-5 text-ink-lo" />
        )}
      </button>
      <div className="text-sm">
        <p className="text-ink-mid">{label}</p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            className="text-xs text-accent-soft"
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Trocar" : "Carregar"}
          </button>
          {value && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-ink-mid"
              onClick={() => onChange(null)}
            >
              <X className="size-3" /> Remover
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
