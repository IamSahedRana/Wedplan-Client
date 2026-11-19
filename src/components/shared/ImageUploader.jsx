"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB — keep in sync with /api/upload

function validateFile(file) {
  if (!file.type.startsWith("image/")) {
    toast.error(`${file.name} is not an image file`);
    return false;
  }
  if (file.size > MAX_SIZE) {
    toast.error(`${file.name} is larger than 5MB`);
    return false;
  }
  return true;
}

function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data.url);
        else reject(new Error(data?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const fd = new FormData();
    fd.append("image", file);
    xhr.send(fd);
  });
}

/**
 * Image uploader backed by /api/upload (ImgBB).
 * `value` is an array of image URLs; single mode keeps at most one.
 */
export function ImageUploader({ value = [], onChange, multiple = false, disabled = false }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]); // { id, name, previewUrl, progress }
  const [dragOver, setDragOver] = useState(false);

  const maxCount = multiple ? 6 : 1;

  function addUrls(urls) {
    const next = multiple ? [...value, ...urls].slice(0, maxCount) : urls.slice(0, 1);
    onChange?.(next);
  }

  function removeUrl(url) {
    onChange?.(value.filter((u) => u !== url));
  }

  async function handleFiles(fileList) {
    if (disabled) return;
    const files = Array.from(fileList || []);
    const remaining = maxCount - value.length - items.length;
    if (remaining <= 0) {
      toast.error(`You can upload up to ${maxCount} image${maxCount > 1 ? "s" : ""}`);
      return;
    }
    if (files.length > remaining) {
      toast.error(`You can upload up to ${maxCount} image${maxCount > 1 ? "s" : ""}`);
    }

    const selected = files.filter(validateFile).slice(0, Math.max(remaining, 0));
    if (!selected.length) return;

    const entries = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    }));
    setItems((prev) => [...prev, ...entries]);

    await Promise.all(
      selected.map(async (file, i) => {
        const entry = entries[i];
        try {
          const url = await uploadFile(file, (progress) =>
            setItems((prev) =>
              prev.map((it) => (it.id === entry.id ? { ...it, progress } : it))
            )
          );
          addUrls([url]);
          toast.success(`${file.name} uploaded`);
        } catch (err) {
          toast.error(err.message || `${file.name} failed to upload`);
        } finally {
          URL.revokeObjectURL(entry.previewUrl);
          setItems((prev) => prev.filter((it) => it.id !== entry.id));
        }
      })
    );
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="group relative size-24 overflow-hidden rounded-xl border border-border bg-muted shadow-card"
            >
              <img src={url} alt="Uploaded" className="size-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length < maxCount && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragOver ? "border-primary bg-accent/50" : "border-border hover:border-primary/50 hover:bg-muted/50"
          } ${disabled ? "pointer-events-none opacity-60" : ""}`}
        >
          {items.length > 0 ? (
            <>
              <LoaderCircle className="size-6 animate-spin text-primary" />
              <div className="w-full max-w-xs space-y-2">
                {items.map((it) => (
                  <div key={it.id}>
                    <div className="flex justify-between text-xs text-secondary-foreground">
                      <span className="truncate">{it.name}</span>
                      <span>{it.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${it.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <ImagePlus className="size-6 text-primary" />
              <p className="text-sm font-medium">
                Click or drag to upload {multiple ? "images" : "an image"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP or GIF · up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
