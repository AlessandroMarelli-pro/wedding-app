import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formSchema } from '@/pages/admin/accommodations';
import { Accommodation } from '@/types/api';
import { IconAnalyzeFilled } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Checkbox } from '../ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';

export interface AccommodationFormData {
  name: string;
  description: string;
  address: string;
  priceRange: string;
  isRecommended: boolean;
  sourceUrl: string;
  imagesUrl: string;
}

export const initialFormData: AccommodationFormData = {
  name: '',
  description: '',
  address: '',
  priceRange: '',
  isRecommended: false,
  sourceUrl: '',
  imagesUrl: '',
};

export const AccomodationFormDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  accommodationsCount,
  formData,
  editingAccommodation,
  setEditingAccommodation,
  fetchAccommodations,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  accommodationsCount: number;
  formData: UseFormReturn<z.infer<typeof formSchema>>;
  editingAccommodation: Accommodation | null;
  setEditingAccommodation: (editingAccommodation: Accommodation | null) => void;
  fetchAccommodations: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [urlInput, setUrlInput] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        ...values,
        displayOrder:
          editingAccommodation?.displayOrder || accommodationsCount + 1,
      };

      const url = editingAccommodation
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations/${editingAccommodation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations`;

      const method = editingAccommodation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          `Success in ${editingAccommodation ? 'update' : 'creation'} !`,
          {
            description: `Accommodation ${editingAccommodation ? 'updated' : 'created'} successfully`,
          },
        );
        setIsDialogOpen(false);
        resetForm();

        fetchAccommodations();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save accommodation');
      }
    } catch (error: any) {
      toast.error('Failed to save accommodation', {
        description: error as string,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = () => {
    formData.reset(initialFormData);
    setEditingAccommodation(null);
  };

  const handleParseUrl = async () => {
    setIsParsingUrl(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations/parse-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: urlInput }),
        },
      );

      if (response.ok) {
        const parsedData = await response.json();
        formData.reset({
          name: parsedData.name,
          description: parsedData.description,
          address: parsedData.address,
          priceRange: parsedData.priceRange || '',
          sourceUrl: parsedData.sourceUrl,
          imagesUrl: parsedData.imagesUrl || '',
        });

        toast.success('URL parsed successfully! ', {
          description: 'Please review and complete the form.',
        });
        setUrlInput('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse URL');
      }
    } catch (error: any) {
      toast.error('Failed to parse URL', {
        description: error as string,
      });
    } finally {
      setIsParsingUrl(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className="space-y-2">
        <Button variant="default" onClick={() => resetForm()}>
          Ajouter un logement
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle>
            {editingAccommodation ? 'Edition du logement' : 'Nouveau logement'}
          </DialogTitle>
        </DialogHeader>
        <Form {...formData}>
          <form
            onSubmit={formData.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* URL Parser Section */}
            {!editingAccommodation && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <div className="flex space-x-2">
                    <FormItem className="w-full">
                      <FormLabel>Ajout rapide depuis une URL</FormLabel>
                      <FormControl>
                        <div className="flex w-full  items-center gap-2">
                          <Input
                            placeholder="https://www.airbnb.com/rooms/..."
                            id="urlInput"
                            type="url"
                            value={urlInput}
                            className="w-full"
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                          <Button
                            onClick={handleParseUrl}
                            disabled={isParsingUrl || !urlInput.trim()}
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {isParsingUrl
                              ? 'Analyse en cours...'
                              : "Analyser l'URL"}
                            <IconAnalyzeFilled
                              className={isParsingUrl ? 'animate-spin' : ''}
                            />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription hidden={isParsingUrl}>
                        Collez une URL depuis <strong>Airbnb</strong> ou{' '}
                        <strong>Booking.com</strong> pour remplir le formulaire
                        automatiquement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>
              </div>
            )}
            {!isParsingUrl && (
              <>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={formData.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du logement" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ex: Hotel de Paris, Hotel de la Paix
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formData.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            className="h-40"
                            placeholder="Description du logement"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex flex-row justify-between">
                          <span>
                            Ex: Un logement confortable avec une vue sur la mer
                          </span>
                          <span>{field.value.length}/2000 caractères</span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formData.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse complète" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ex: 123 Rue de la Paix, 75000 Paris
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formData.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Prix *</FormLabel>
                        <FormControl>
                          <Input placeholder="Prix par nuit" {...field} />
                        </FormControl>
                        <FormDescription>Ex: 120-180€/nuit</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formData.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>URL de l'anonnce *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Url complète de l'annonnce"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ex: https://www.airbnb.com/rooms/...
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formData.control}
                    name="imagesUrl"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>URL des images de l'annonnce *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Url des images qui seront affichées sur le site"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ex:
                          https://www.airbnb.com/rooms/...,https://www.airbnb.com/rooms/...,https://www.airbnb.com/rooms/...
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formData.control}
                    name="isRecommended"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox
                              className="m-0"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Marquer comme recommandé
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="flex gap-2 justify-between">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : editingAccommodation
                        ? 'Update'
                        : 'Create'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
