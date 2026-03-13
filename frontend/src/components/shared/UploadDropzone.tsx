import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File) => void;
  uploading?: boolean;
  className?: string;
  hint?: string;
}

export default function UploadDropzone({
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 5,
  onFile,
  uploading,
  className,
  hint,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validate(file)) {
      setSelectedFile(file);
      onFile(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('relative', className)}>
      <label
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all',
          dragging ? 'border-brand-oxford bg-brand-oxford/5 scale-[1.01]' : 'border-border bg-gray-50/50 hover:border-brand-oxford/40 hover:bg-brand-oxford/3',
          uploading && 'pointer-events-none opacity-60',
        )}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept={accept} className="sr-only" onChange={onInputChange} disabled={uploading} />
        <div className="w-10 h-10 rounded-xl bg-brand-oxford/8 flex items-center justify-center">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-brand-oxford/30 border-t-brand-oxford rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-brand-oxford" strokeWidth={1.75} />
          )}
        </div>
        {selectedFile ? (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-brand-oxford" />
            <span className="font-medium text-foreground">{selectedFile.name}</span>
            <button
              type="button"
              onClick={e => { e.preventDefault(); setSelectedFile(null); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop your file here, or <span className="text-brand-oxford">browse</span></p>
            <p className="text-xs text-muted-foreground mt-1">{hint ?? `${accept.split(',').join(', ')} · Max ${maxSizeMB}MB`}</p>
          </div>
        )}
      </label>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
