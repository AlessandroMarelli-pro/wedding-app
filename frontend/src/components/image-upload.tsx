import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface UploadedImage {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  altText?: string;
  usageLocation: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageUploadProps {
  onUploadComplete?: (image: UploadedImage) => void;
  onUploadError?: (error: string) => void;
  usageLocation: string;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface ImagePreview {
  file: File;
  preview: string;
  altText: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  uploadedImage?: UploadedImage;
}

interface ProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  usageLocation,
  maxFiles = 10,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10, // 10MB default
  className = '',
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(
    {
      quality: 85,
    },
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: ImagePreview[] = [];
      const maxFileSizeBytes = maxFileSize * 1024 * 1024;

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!acceptedFileTypes.includes(file.type)) {
          onUploadError?.(
            `File type ${file.type} is not supported. Allowed types: ${acceptedFileTypes.join(', ')}`,
          );
          return;
        }

        // Validate file size
        if (file.size > maxFileSizeBytes) {
          onUploadError?.(
            `File ${file.name} is too large. Maximum size: ${maxFileSize}MB`,
          );
          return;
        }

        // Check if we've reached the max files limit
        if (images.length + newImages.length >= maxFiles) {
          onUploadError?.(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default alt text
          uploading: false,
          uploaded: false,
        });
      });

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, maxFiles, acceptedFileTypes, maxFileSize, onUploadError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const updateAltText = useCallback((index: number, altText: string) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index].altText = altText;
      return newImages;
    });
  }, []);

  const uploadImage = useCallback(
    async (index: number) => {
      const image = images[index];
      if (!image || image.uploading || image.uploaded) return;

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].uploading = true;
        newImages[index].error = undefined;
        return newImages;
      });

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('image', image.file);
        formData.append('usageLocation', usageLocation);
        formData.append('altText', image.altText);

        // Add processing options if set
        if (processingOptions.maxWidth) {
          formData.append('maxWidth', processingOptions.maxWidth.toString());
        }
        if (processingOptions.maxHeight) {
          formData.append('maxHeight', processingOptions.maxHeight.toString());
        }
        if (processingOptions.quality) {
          formData.append('quality', processingOptions.quality.toString());
        }
        if (processingOptions.format) {
          formData.append('format', processingOptions.format);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/images/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const uploadedImage: UploadedImage = await response.json();

        setImages((prev) => {
          const newImages = [...prev];
          newImages[index].uploading = false;
          newImages[index].uploaded = true;
          newImages[index].uploadedImage = uploadedImage;
          return newImages;
        });

        onUploadComplete?.(uploadedImage);
      } catch (error: any) {
        setImages((prev) => {
          const newImages = [...prev];
          newImages[index].uploading = false;
          newImages[index].error = error.message;
          return newImages;
        });

        onUploadError?.(error.message);
      }
    },
    [images, usageLocation, processingOptions, onUploadComplete, onUploadError],
  );

  const uploadAllImages = useCallback(async () => {
    const pendingImages = images
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => !img.uploading && !img.uploaded);

    for (const { index } of pendingImages) {
      await uploadImage(index);
    }
  }, [images, uploadImage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (filename: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${filename}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Processing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Processing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="maxWidth">Max Width (px)</Label>
              <Input
                id="maxWidth"
                type="number"
                placeholder="e.g., 1920"
                value={processingOptions.maxWidth || ''}
                onChange={(e) =>
                  setProcessingOptions((prev) => ({
                    ...prev,
                    maxWidth: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="maxHeight">Max Height (px)</Label>
              <Input
                id="maxHeight"
                type="number"
                placeholder="e.g., 1080"
                value={processingOptions.maxHeight || ''}
                onChange={(e) =>
                  setProcessingOptions((prev) => ({
                    ...prev,
                    maxHeight: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
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
                value={processingOptions.quality || 85}
                onChange={(e) =>
                  setProcessingOptions((prev) => ({
                    ...prev,
                    quality: parseInt(e.target.value) || 85,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={processingOptions.format || ''}
                onChange={(e) =>
                  setProcessingOptions((prev) => ({
                    ...prev,
                    format: e.target.value as
                      | 'jpeg'
                      | 'png'
                      | 'webp'
                      | undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Keep Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-rose-500 bg-rose-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop images here or click to select
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: {acceptedFileTypes.join(', ')} • Max size:{' '}
              {maxFileSize}MB • Max files: {maxFiles}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Images
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Selected Images ({images.length})
            </h3>
            {images.some((img) => !img.uploaded && !img.uploading) && (
              <Button
                onClick={uploadAllImages}
                disabled={images.some((img) => img.uploading)}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Upload All Images
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={
                      image.uploaded && image.uploadedImage
                        ? getImageUrl(image.uploadedImage.filename)
                        : image.preview
                    }
                    alt={image.altText}
                    className="w-full h-48 object-cover"
                  />

                  {/* Status Overlay */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {image.uploading && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Uploading
                      </Badge>
                    )}
                    {image.uploaded && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    {image.error && (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 left-2 p-1 h-8 w-8 bg-white/80 hover:bg-white"
                    disabled={image.uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <Label
                      htmlFor={`alt-${index}`}
                      className="text-sm font-medium"
                    >
                      Alt Text
                    </Label>
                    <Input
                      id={`alt-${index}`}
                      value={image.altText}
                      onChange={(e) => updateAltText(index, e.target.value)}
                      placeholder="Describe the image"
                      disabled={image.uploading}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{formatFileSize(image.file.size)}</span>
                    <span>{image.file.type}</span>
                  </div>

                  {image.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {image.error}
                    </div>
                  )}

                  {image.uploaded && image.uploadedImage && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      <div>
                        Processed: {image.uploadedImage.width} ×{' '}
                        {image.uploadedImage.height}
                      </div>
                      <div>
                        Final size: {formatFileSize(image.uploadedImage.size)}
                      </div>
                    </div>
                  )}

                  {!image.uploaded && !image.uploading && (
                    <Button
                      onClick={() => uploadImage(index)}
                      size="sm"
                      className="w-full bg-rose-600 hover:bg-rose-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  )}

                  {image.uploaded && image.uploadedImage && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            getImageUrl(image.uploadedImage!.filename),
                            '_blank',
                          )
                        }
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = getImageUrl(
                            image.uploadedImage!.filename,
                          );
                          link.download = image.uploadedImage!.originalName;
                          link.click();
                        }}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
