'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUploadVideo } from '@/lib/hooks/useVideos';
import { useProjects } from '@/lib/hooks/useProjects';
import { cn } from '@/lib/utils';

export function VideoUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  
  const { data: projects } = useProjects();
  const uploadMutation = useUploadVideo();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }

    setUploading(true);
    for (const file of files) {
      try {
        setProgress((prev) => ({ ...prev, [file.name]: 10 }));
        await uploadMutation.mutateAsync({ file, projectId: selectedProjectId });
        setProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setProgress((prev) => ({ ...prev, [file.name]: -1 })); // -1 for error
      }
    }
    setUploading(false);
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <select
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Select a project...</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Drag & drop video files here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Accepted formats: MP4, MOV, AVI
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({files.length})</p>
              <div className="grid gap-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileVideo className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(i)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={uploading || !selectedProjectId}
              >
                {uploading ? 'Uploading...' : 'Start Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
