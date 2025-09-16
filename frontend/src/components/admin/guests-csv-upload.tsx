import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import ApiService from '@/services/api';
import { IconLoader2, IconUser } from '@tabler/icons-react';
import { File, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FileUpload from '../kokonutui/file-upload';

interface CSVUpload {
  id: string;
  filename: string;
  totalGuests: number;
  successfulImports: number;
  createdAt: string;
  errorLog?: string;
  errorRows?: number;
}

export const GuestsCsvUpload = ({
  fetchData,
  csvUploads,
}: {
  fetchData: () => Promise<void>;
  csvUploads: CSVUpload[];
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const data: any = await ApiService.uploadGuestCSV(selectedFile);

      if (data) {
        toast.success(`CSV importé avec succès! `, {
          duration: 10000,
        });

        setSelectedFile(null);
        setTimeout(() => {
          fetchData().then(() => {
            setIsUploading(false);
          });
        }, 2000);
      } else {
        setUploadMessage({
          type: 'error',
          text: data.message || 'Importation échouée. Veuillez réessayer.',
        });
      }
    } catch (error) {
      setUploadMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-4 ">
      {!selectedFile && (
        <>
          <FileUpload
            className="w-full"
            currentFile={selectedFile}
            onUploadSuccess={(file) => setSelectedFile(file)}
            onUploadError={() => console.log('error')}
            acceptedFileTypes={['.csv']}
            maxFileSize={10 * 1024 * 1024} // 10MB
          />
          <p className="text-sm text-gray-600">
            Colonnes requises : <br /> Nom, Prénom, email, numéro de téléphone,
            nombre de personnes, restrictions alimentaires, besoins spéciaux
          </p>
        </>
      )}
      {selectedFile && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Validez pour déposer le fichier <strong>{selectedFile.name}</strong>
          </p>
        </div>
      )}
      {uploadMessage && (
        <div
          className={`p-3 rounded-md ${
            uploadMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm">{uploadMessage.text}</p>
        </div>
      )}
      {selectedFile && (
        <div className="flex items-center justify-between gap-6">
          <Button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setUploadMessage(null);
            }}
            disabled={isUploading}
            variant="secondary"
          >
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={!selectedFile || isUploading}
            onClick={handleFileUpload}
            variant="success"
          >
            {isUploading ? 'En cours de dépôt...' : 'Valider le dépôt'}
          </Button>
        </div>
      )}

      {csvUploads.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Derniers dépôts:{' '}
            {isUploading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              ''
            )}
          </h4>
          <div className="space-y-2 max-h-[10rem] overflow-y-auto">
            {csvUploads.map((upload) => (
              <div
                key={upload.id}
                className={cn(
                  'flex items-center justify-between p-2 bg-gray-50 rounded',
                  upload.errorRows ? 'bg-red-50' : 'bg-green-50',
                )}
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    <strong>{upload.filename}</strong> importé le{' '}
                    {new Date(upload.createdAt).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {upload.errorRows ? (
                  <div className="text-sm text-red-600">
                    {upload.successfulImports}/{upload.totalGuests}
                  </div>
                ) : (
                  <div className="text-sm text-green-600 flex flex-row items-center gap-2">
                    {upload.successfulImports > 0 && (
                      <IconUser className="w-4 h-4" />
                    )}
                    {upload.successfulImports}/{upload.totalGuests}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const GuestsCsvUploadDialog = ({
  fetchData,
  csvUploads,
}: {
  fetchData: () => Promise<void>;
  csvUploads: CSVUpload[];
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          Déposer un fichier <File />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95%]  max-h-[80vh] lg:max-w-2xl lg:max-h-[80vh] overflow-y-auto font-sans">
        {' '}
        <div className="-mt-3 -mx-6 border-b pb-3 px-6 flex justify-between items-center">
          <DialogHeader>
            <DialogTitle>Déposer un fichier</DialogTitle>
          </DialogHeader>
        </div>
        <GuestsCsvUpload fetchData={fetchData} csvUploads={csvUploads} />
      </DialogContent>
    </Dialog>
  );
};
