import { AlertCircle, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ImageUploadProps {
  onUpload?: (file: File, options: ImageUploadOptions) => Promise<void>;
  className?: string;
}

interface ImageUploadOptions {
  usageLocation: string;
  altText?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  usageLocation: string;
  altText?: string;
  url: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  createdAt: string;
}

export function ImageUpload({ onUpload, className }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadOptions, setUploadOptions] = useState<ImageUploadOptions>({
    usageLocation: 'gallery',
    altText: '',
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'jpeg',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(null);
      } else {
        setUploadError('Please select an image file');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(null);
      } else {
        setUploadError('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await onUpload(selectedFile, uploadOptions);
      setUploadSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        'file-input',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload images for your wedding website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your image here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Supports JPG, PNG, GIF, WebP up to 10MB
              </p>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    const fileInput = document.getElementById(
                      'file-input',
                    ) as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usage-location">Usage Location</Label>
                <select
                  id="usage-location"
                  value={uploadOptions.usageLocation}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      usageLocation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gallery">Gallery</option>
                  <option value="hero">Hero Section</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="program">Program</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="alt-text">Alt Text (Accessibility)</Label>
                <Input
                  id="alt-text"
                  type="text"
                  placeholder="Describe the image for screen readers"
                  value={uploadOptions.altText || ''}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      altText: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max-width">Max Width (px)</Label>
                <Input
                  id="max-width"
                  type="number"
                  placeholder="1920"
                  value={uploadOptions.maxWidth || ''}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      maxWidth: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="max-height">Max Height (px)</Label>
                <Input
                  id="max-height"
                  type="number"
                  placeholder="1080"
                  value={uploadOptions.maxHeight || ''}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      maxHeight: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="quality">Quality (1-100)</Label>
                <Input
                  id="quality"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="85"
                  value={uploadOptions.quality || ''}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      quality: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={uploadOptions.format || 'jpeg'}
                onChange={(e) =>
                  setUploadOptions({
                    ...uploadOptions,
                    format: e.target.value as 'jpeg' | 'png' | 'webp',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>

          {/* Status Messages */}
          {uploadError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">{uploadSuccess}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>
            Best practices for wedding website images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Image Sizes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Hero images: 1920x1080px or larger</li>
              <li>• Gallery images: 1200x800px minimum</li>
              <li>• Accommodation photos: 800x600px minimum</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">File Formats</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• JPEG: Best for photos with many colors</li>
              <li>• PNG: Best for images with transparency</li>
              <li>• WebP: Best for modern browsers (smaller file size)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Accessibility</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Always provide descriptive alt text</li>
              <li>• Avoid text-heavy images</li>
              <li>• Ensure good contrast for readability</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
