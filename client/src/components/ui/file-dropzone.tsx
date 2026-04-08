import { UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";

type FileDropzoneProps = {
  file?: File | null;
  onChange: (file: File | null) => void;
};

export function FileDropzone({ file, onChange }: FileDropzoneProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/70 px-6 py-10 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:bg-brand-50/40 hover:shadow-soft"
      )}
    >
      <UploadCloud className="h-10 w-10 text-brand-500" />
      <p className="mt-4 font-semibold text-ink">{file ? file.name : "Upload inventory workbook"}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        Select an `.xlsx` file to validate headers, preview rows, and replace the current master inventory.
      </p>
      <input
        type="file"
        className="hidden"
        accept=".xlsx"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}
