import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaBucket = "shop-logos" | "shop-photos" | "barbers" | "haircuts";

/** Recorta ao centro para o formato pedido e reduz o ficheiro antes do envio. */
export async function cropImage(
  file: File,
  aspect = 1,
  maxWidth = 1200,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const srcAspect = bitmap.width / bitmap.height;

  let sw = bitmap.width;
  let sh = bitmap.height;
  if (srcAspect > aspect) sw = bitmap.height * aspect;
  else sh = bitmap.width / aspect;

  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;

  const width = Math.min(maxWidth, Math.round(sw));
  const height = Math.round(width / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Não foi possível preparar a imagem.")),
      "image/jpeg",
      0.88,
    );
  });
}

export async function uploadMedia(
  bucket: MediaBucket,
  shopId: string,
  file: File,
  aspect = 1,
): Promise<string> {
  const blob = await cropImage(file, aspect);
  const path = `${shopId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

export async function signedUrl(
  bucket: MediaBucket,
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export function useSignedUrl(bucket: MediaBucket, path: string | null) {
  return useQuery({
    queryKey: ["media", bucket, path],
    queryFn: () => (path ? signedUrl(bucket, path) : null),
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
  });
}
