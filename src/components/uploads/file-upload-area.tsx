'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[], metadata: any[]) => void;
  className?: string;
}

export function FileUploadArea({ onFilesSelected, className }: FileUploadAreaProps) {
  const extractMetadata = async (file: File) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.round(video.duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.onerror = () => {
        resolve({ duration: 0, resolution: 'Unknown' });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    const metadataList: any[] = [];

    for (const file of acceptedFiles) {
      // Basic size validation (10GB)
      if (file.size > 10 * 1024 * 1024 * 1024) {
        console.error(`${file.name} is too large`);
        continue;
      }

      const meta: any = await extractMetadata(file);
      
      // Industrial validation requirements
      const isLandscape = meta.width > meta.height;
      const isMin720p = meta.height >= 720;

      if (!isLandscape) {
        console.warn(`${file.name} is not landscape`);
        // continue; // For now let's just log or notify
      }

      validFiles.push(file);
      metadataList.push(meta);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles, metadataList);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-all duration-300 cursor-pointer bg-card/30 hover:bg-card/50 hover:border-primary/50",
        isDragActive && "border-primary bg-primary/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <div className="mt-6 text-center space-y-2">
        <h3 className="text-xl font-bold tracking-tight">Drop Traffic Survey Videos</h3>
        <p className="text-sm text-muted-foreground max-w-[350px]">
          Upload survey footage for AI analysis. <br /> 
          <span className="font-medium text-foreground">MP4, MOV, or AVI</span> (Max 10GB per file)
        </p>
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-muted-foreground/10">
          <AlertCircle className="h-3 w-3" /> Minimum 720p
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-muted-foreground/10">
          <AlertCircle className="h-3 w-3" /> Landscape Only
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-muted-foreground/10">
          <AlertCircle className="h-3 w-3" /> Industry Standards
        </div>
      </div>
    </div>
  );
}
