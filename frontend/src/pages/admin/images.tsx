import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NavbarLayout } from '../../components/admin-navbar-layout';
import { ImageUpload } from '../../components/image-upload';
import { ApiService } from '../../services/api';

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
    return new Date(dateString).toLocaleDateString('en-US', {
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
    return `${baseUrl}/images/${imageId}`;
  };

  const getThumbnailUrl = (imageId: string): string => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/images/${imageId}/thumbnail`;
  };

  const getOptimizedUrl = (imageId: string): string => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/images/${imageId}/optimized`;
  };

  if (loading) {
    return (
      <NavbarLayout type="admin" currentPath="/admin/images">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </NavbarLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Image Management - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <NavbarLayout type="admin" currentPath="/admin/images">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl  text-gray-800 mb-2">Image Management</h1>
            <p className="text-gray-600">
              Upload and manage images for your wedding website
            </p>
          </div>

          {/* Image Upload Component */}
          <ImageUpload onUpload={handleImageUpload} />

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
                        src={getThumbnailUrl(image.id)}
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
                        <p>Size: {formatFileSize(image.size)}</p>
                        <p>Usage: {image.usageLocation}</p>
                        <p>Uploaded: {formatDate(image.createdAt)}</p>
                        {image.altText && (
                          <p className="truncate">Alt: {image.altText}</p>
                        )}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() =>
                            window.open(getImageUrl(image.id), '_blank')
                          }
                          className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Original
                        </button>
                        <button
                          onClick={() =>
                            window.open(getOptimizedUrl(image.id), '_blank')
                          }
                          className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          View Optimized
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                'Are you sure you want to delete this image?',
                              )
                            ) {
                              try {
                                await ApiService.deleteImage(image.id);
                                await fetchImages(); // Refresh the list
                              } catch (error) {
                                console.error('Error deleting image:', error);
                                setError('Failed to delete image');
                              }
                            }
                          }}
                          className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </NavbarLayout>
    </>
  );
}
