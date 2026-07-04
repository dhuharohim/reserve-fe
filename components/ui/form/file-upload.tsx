"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";

type Status = "uploading" | "success" | "error";

interface Item {
  id: number;
  file: File;
  preview: string | null;
  progress: number;
  status: Status;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Drag & drop uploader matched to the app card style. Simulates progress when
 * no `onUpload` is provided; pass one returning a Promise for real uploads.
 */
export function FileUpload({
  accept = "image/*",
  multiple = true,
  maxSizeMb = 8,
  label = "Upload files",
  hint = "Drag & drop, or browse. Images up to",
  onUpload,
}: {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  label?: string;
  hint?: string;
  onUpload?: (file: File) => Promise<void>;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  function validate(file: File): string | null {
    if (file.size > maxSizeMb * 1024 * 1024) return `Over ${maxSizeMb} MB`;
    if (accept === "image/*" && !file.type.startsWith("image/")) return "Not an image";
    return null;
  }

  function simulate(id: number) {
    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          const next = Math.min(100, it.progress + 12 + it.progress * 0.05);
          if (next >= 100) {
            clearInterval(timer);
            timers.current.delete(id);
            return { ...it, progress: 100, status: "success" };
          }
          return { ...it, progress: next };
        }),
      );
    }, 140);
    timers.current.set(id, timer);
  }

  function upload(item: Item) {
    if (onUpload) {
      onUpload(item.file)
        .then(() =>
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, progress: 100, status: "success" } : it)),
          ),
        )
        .catch((e: unknown) =>
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "error", error: e instanceof Error ? e.message : "Upload failed" }
                : it,
            ),
          ),
        );
    } else {
      simulate(item.id);
    }
  }

  function add(files: FileList | File[]) {
    const list = Array.from(files);
    const next: Item[] = [];
    for (const file of list) {
      const err = validate(file);
      const id = idRef.current++;
      const item: Item = {
        id,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        progress: err ? 0 : 4,
        status: err ? "error" : "uploading",
        error: err ?? undefined,
      };
      next.push(item);
    }
    setItems((prev) => (multiple ? [...prev, ...next] : next.slice(-1)));
    next.filter((it) => it.status === "uploading").forEach(upload);
  }

  function retry(id: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: "uploading", progress: 4, error: undefined } : it,
      ),
    );
    const item = items.find((it) => it.id === id);
    if (item) upload({ ...item, status: "uploading", progress: 4 });
  }

  function remove(id: number) {
    const timer = timers.current.get(id);
    if (timer) clearInterval(timer);
    timers.current.delete(id);
    setItems((prev) => {
      const gone = prev.find((it) => it.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return prev.filter((it) => it.id !== id);
    });
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) add(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-[var(--r)] border border-dashed bg-surface px-6 py-9 text-center transition-colors duration-[var(--dur-normal)]",
          dragging ? "border-accent bg-[var(--accent-tint)]" : "border-line hover:border-accent/60",
        )}
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
        >
          <Ms name="cloud_upload" style={{ fontSize: 26 }} />
        </span>
        <span className="rz-serif text-lg font-semibold">{label}</span>
        <span className="text-[12.5px] text-muted">
          {hint} {maxSizeMb} MB
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) add(e.target.files);
          e.target.value = "";
        }}
      />

      {items.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[var(--r-sm)] border border-line bg-surface p-2.5"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[9px] bg-panel">
                {item.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Ms name="description" style={{ fontSize: 22 }} className="text-muted" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium">{item.file.name}</span>
                  <span className="rz-mono flex-none text-[10.5px] text-muted">
                    {formatSize(item.file.size)}
                  </span>
                </div>
                {item.status === "error" ? (
                  <span className="mt-1 flex items-center gap-1 text-[11.5px] text-danger">
                    <Ms name="error" style={{ fontSize: 13 }} /> {item.error}
                  </span>
                ) : (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-panel">
                    <div
                      className="h-full rounded-full transition-[width] duration-200"
                      style={{
                        width: `${item.progress}%`,
                        background: item.status === "success" ? "var(--accent-deep)" : "var(--accent)",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-none items-center gap-1">
                {item.status === "success" && (
                  <Ms name="check_circle" fill style={{ fontSize: 19, color: "var(--accent-deep)" }} />
                )}
                {item.status === "error" && (
                  <button
                    type="button"
                    aria-label="Retry"
                    onClick={() => retry(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-ink"
                  >
                    <Ms name="refresh" style={{ fontSize: 17 }} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => remove(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-danger"
                >
                  <Ms name="close" style={{ fontSize: 17 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
