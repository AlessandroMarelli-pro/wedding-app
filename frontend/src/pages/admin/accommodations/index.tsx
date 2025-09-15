import {
  AccomodationFormDialog,
  initialFormData,
} from '@/components/admin/accomodation-form-dialog';
import AlertDialog from '@/components/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkPreview } from '@/components/ui/link-preview';
import { cn } from '@/lib';
import { Accommodation } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconWorldWww } from '@tabler/icons-react';
import { Dot, Edit, MapPin, Star, Trash2 } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(2000),
  address: z.string().min(2).max(300),
  priceRange: z.string().min(2).max(50),
  isRecommended: z.boolean().optional().default(false),
  sourceUrl: z.string().min(2).url(),
  imagesUrl: z.string().min(2).startsWith('https'),
});

export default function AdminAccommodations() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
  });

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAccommodation, setEditingAccommodation] =
    useState<Accommodation | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAccommodations();
  }, [router]);

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/accommodations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAccommodations(
          data.sort(
            (a: Accommodation, b: Accommodation) =>
              a.displayOrder - b.displayOrder,
          ),
        );
      } else {
        throw new Error('Failed to fetch accommodations');
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      toast.error('Erreur lors de la récupération des logements !', {
        description: error as string,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (accommodation: Accommodation) => {
    setEditingAccommodation(accommodation);

    form.reset({
      name: accommodation.name,
      description: accommodation.description,
      address: accommodation.address,
      priceRange: accommodation.priceRange || '',
      isRecommended: accommodation.isRecommended,
      sourceUrl: accommodation.sourceUrl || '',
      imagesUrl: accommodation.imagesUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/accommodations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.warning('Logement supprimé avec succès !', {
          description: `${name} a été supprimé.`,
        });

        fetchAccommodations();
      } else {
        throw new Error('Failed to delete accommodation');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la suppression du logement !', {
        description: error as string,
      });
    }
  };

  const getSourceName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      if (domain.includes('airbnb.com')) return 'Airbnb';
      if (domain.includes('booking.com')) return 'Booking.com';
      if (domain.includes('hostelworld.com')) return 'Hostelworld';
      if (domain.includes('hotels.com')) return 'Hotels.com';
      if (domain.includes('expedia.com')) return 'Expedia';
      if (domain.includes('tripadvisor.com')) return 'TripAdvisor';
      if (domain.includes('agoda.com')) return 'Agoda';
      if (domain.includes('trivago.com')) return 'Trivago';
      if (domain.includes('kayak.com')) return 'Kayak';
      if (domain.includes('priceline.com')) return 'Priceline';
      if (domain.includes('orbitz.com')) return 'Orbitz';
      if (domain.includes('hotwire.com')) return 'Hotwire';
      if (domain.includes('vrbo.com')) return 'VRBO';
      if (domain.includes('homeaway.com')) return 'HomeAway';

      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'External Site';
    }
  };
  const getImageUrlByIndex = (imageUrl: string, index: number) => {
    const url = imageUrl.split(',')?.[index] || '';
    if (url.includes('http')) {
      return url;
    }
    return '';
  };

  return (
    <>
      <Head>
        <title>Admin - Logements</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-6 space-y-8 flex flex-col">
        {/* Header */}
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between">
                Logements
              </h1>

              <p className="text-muted-foreground">
                Gérez les logements recommandés pour vos invités
              </p>
            </div>
            <AccomodationFormDialog
              fetchAccommodations={fetchAccommodations}
              editingAccommodation={editingAccommodation}
              setEditingAccommodation={setEditingAccommodation}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              accommodationsCount={accommodations.length}
              formData={form}
            />
          </div>
        </div>

        {/* Accommodations List */}
        {!isLoading && (
          <div className="space-y-4 flex flex-row  flex-wrap">
            {accommodations.map((accommodation, index) => (
              <div
                className={cn(' max-w-1/2', index % 2 === 0 && 'pr-4')}
                key={accommodation.id}
              >
                <Card className="h-full">
                  <CardHeader className="pb-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{accommodation.name}</span>
                            {accommodation.priceRange && (
                              <>
                                <Dot />
                                <Badge variant="outline">
                                  {`${accommodation.priceRange?.replace('€', '')} € `}
                                </Badge>
                              </>
                            )}
                            {accommodation.isRecommended && (
                              <>
                                <Dot />
                                <Badge variant="warning">
                                  <Star className="w-3 h-3 mr-1" />
                                  Recommended
                                </Badge>
                              </>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(accommodation)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog
                          triggerIcon={<Trash2 className="w-4 h-4" />}
                          triggerText=""
                          triggerVariant="ghost"
                          triggerClass="text-destructive"
                          mainTitle="Supprimer le logement"
                          title={`Êtes-vous sûr de vouloir supprimer ${accommodation.name} ?`}
                          description="Cette action ne peut pas être annulée. Elle supprimera définitivement le logement."
                          actionText="Supprimer"
                          action={() => {
                            handleDelete(accommodation.id, accommodation.name);
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className=" flex flex-col gap-4">
                    {accommodation.imagesUrl && (
                      <div className="flex flex-row  justify-center gap-4">
                        <Image
                          src={getImageUrlByIndex(accommodation.imagesUrl, 0)}
                          alt={accommodation.name}
                          width={1000}
                          height={1000}
                          className="w-[50%] rounded-lg max-h-50"
                        />
                        <Image
                          src={getImageUrlByIndex(accommodation.imagesUrl, 1)}
                          alt={accommodation.name}
                          width={1000}
                          height={1000}
                          className="w-[50%]  rounded-lg max-h-50"
                        />
                      </div>
                    )}
                    <div className="flex flex-col text-xs">
                      <div className="space-y-2 text-sm ">
                        <p className="text-sm text-justify">
                          {accommodation.description}
                        </p>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                          <span>{accommodation.address}</span>
                        </div>
                        {accommodation.sourceUrl && (
                          <div className="flex items-start space-x-2">
                            <IconWorldWww className="w-4 h-4 mt-0.5 text-gray-400" />
                            <LinkPreview
                              width={400}
                              height={300}
                              url={accommodation.sourceUrl || ''}
                              className=" hover:text-blue-800 underline text-black dark:text-black"
                            >
                              View on {getSourceName(accommodation.sourceUrl)}
                            </LinkPreview>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
