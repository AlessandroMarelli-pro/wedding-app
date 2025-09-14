import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  defaultUsageLocationOptions,
  ImageUpload,
} from '../../../components/admin/image-upload';
import { ApiService } from '../../../services/api';

interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  usageLocation: string;
  altText?: string;
  createdAt: string;
}

export default function AdminImages() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [useLocationOptions, setUseLocationOptions] = useState<
    { id: string; name: string }[]
  >(defaultUsageLocationOptions);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchImages();
  }, [router]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await ApiService.getImages();
      setImages(fetchedImages);
      const filteredUsageLocationOptions = useLocationOptions.filter(
        (a) => !fetchedImages.some((image) => image.usageLocation === a.id),
      );
      setUseLocationOptions([...filteredUsageLocationOptions]);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, options: any) => {
    try {
      await ApiService.uploadImage(file, options);
      await fetchImages(); // Refresh the list
      console.log('Image uploaded successfully');
    } catch (error) {
      throw error; // Re-throw to let ImageUpload component handle it
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Helper functions to generate image URLs using the new API endpoints
  const getImageUrl = (imageId: string): string => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/api/images/${imageId}`;
  };

  const getOptimizedUrl = (imageId: string): string => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/api/images/${imageId}/optimized`;
  };

  const handleDelete = (id: string, name: string) => {
    return async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette image?')) {
        try {
          await ApiService.deleteImage(id);
          await fetchImages(); // Refresh the list
        } catch (error) {
          console.error('Error deleting image:', error);
          setError('Failed to delete image');
        }
      }
    };
  };

  return (
    <>
      <Head>
        <title>Image Management - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between">
            Gestion des images
          </h1>
          <p className="text-gray-600">
            Gérez vos images pour votre site de mariage
          </p>
        </div>

        {/* Image Upload Component */}
        <ImageUpload
          onUpload={handleImageUpload}
          usageLocationOptions={useLocationOptions}
        />

        {/* Images Grid */}
        <div>
          <h2 className="text-2xl  text-gray-800 mb-4">Uploaded Images</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No images uploaded yet
              </h3>
              <p className="text-gray-500">
                Upload your first image using the form above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img
                      src={getOptimizedUrl(image.id)}
                      alt={image.altText || image.originalName}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">
                      {image.originalName}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>Taille : {formatFileSize(image.size)}</p>
                      <p>
                        Emplacement :{' '}
                        {
                          defaultUsageLocationOptions.find(
                            (a) => a.id === image.usageLocation,
                          )?.name
                        }
                      </p>
                      <p>Uploadé le : {formatDate(image.createdAt)}</p>
                      {image.altText && (
                        <p className="truncate">Alt: {image.altText}</p>
                      )}
                    </div>
                    <div className="gap-2 space-x-2 flex flex-row justify-between">
                      <Button
                        onClick={() =>
                          window.open(getOptimizedUrl(image.id), '_blank')
                        }
                      >
                        View Optimized
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger>Supprimer</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous sûr de vouloir supprimer cette image{' '}
                              {image.originalName} ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Elle
                              supprimera définitivement l'image de nos serveurs.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(image.id, image.originalName)
                              }
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
