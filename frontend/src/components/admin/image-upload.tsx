import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FileUpload from '../kokonutui/file-upload';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ImageUploadProps {
  onUpload?: (file: File, options: ImageUploadOptions) => Promise<void>;
  className?: string;
  usageLocationOptions?: { id: string; name: string }[];
}

interface ImageUploadOptions {
  usageLocation: string;
  altText?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}
export const defaultUsageLocationOptions = [
  { id: 'hero', name: 'Hero' },
  { id: 'information', name: 'Informations' },
  { id: 'accommodation', name: 'Logements' },
];
export function ImageUpload({
  onUpload,
  className,
  usageLocationOptions = defaultUsageLocationOptions,
}: ImageUploadProps) {
  console.info('usageLocationOptions', usageLocationOptions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadOptions, setUploadOptions] = useState<ImageUploadOptions>({
    usageLocation: usageLocationOptions[0].id,
    altText: '',
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 100,
    format: 'webp',
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;

    setUploading(true);

    try {
      await onUpload(selectedFile, uploadOptions);
      toast.success('Succès!', {
        duration: 10000,
        description: `${selectedFile.name} a été déposé avec succès.`,
      });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        'file-input',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Erreur!', {
        duration: 10000,
        description: `${selectedFile.name} n'a pas été déposé.`,
      });
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
      <Card>
        <CardHeader></CardHeader>

        <CardContent className="space-y-4 flex flex-row gap-4">
          <div className="w-full flex flex-col gap-4">
            <CardTitle>Déposer une image</CardTitle>
            <CardDescription>
              Déposez des images pour votre site de mariage
            </CardDescription>
            {/* Upload Options */}
            <div className="grid w-full  items-center gap-2">
              <Label htmlFor="usage-location">Emplacement d'utilisation</Label>
              <Select
                onValueChange={(value) =>
                  setUploadOptions({ ...uploadOptions, usageLocation: value })
                }
              >
                <SelectTrigger className="w-full" id="usage-location">
                  <SelectValue placeholder="Selectionner une catégorie de section" />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  <SelectGroup>
                    <SelectLabel>Section</SelectLabel>
                    {usageLocationOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full  items-center gap-2">
              <Label htmlFor="alt-text">Texte alternatif (Accessibilité)</Label>
              <Input
                id="alt-text"
                placeholder="Décrivez l'image pour les lecteurs d'écran"
                value={uploadOptions.altText || ''}
                onChange={(e) =>
                  setUploadOptions({
                    ...uploadOptions,
                    altText: e.target.value,
                  })
                }
              />
            </div>
            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  En cours de dépôt...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Déposer l'image
                </>
              )}
            </Button>
          </div>
          <div className="w-full flex flex-col gap-4 h-full">
            {/* Drag and Drop Area */}
            <FileUpload
              className="w-full"
              currentFile={selectedFile}
              onUploadSuccess={(file) => setSelectedFile(file)}
              onUploadError={() => console.log('error')}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.webp']}
              maxFileSize={20 * 1024 * 1024} // 10MB
            />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
