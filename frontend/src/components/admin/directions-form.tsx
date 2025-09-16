import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { formSchema } from '@/pages/admin/information';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Car, CheckCircle2Icon, Edit, Plus, Train, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import z from 'zod';
import { Direction } from '../../types/api';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  convertTextWithLinksToReactNodes,
  LinkPreview,
} from '../ui/link-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

const DirectionsIcons = {
  car: <Car className="size-4" />,
  train: <Train className="size-4" />,
  'car rental': <Car className="size-4" />,
};
export const DirectionsForm = ({
  form,
  setChangesStatus,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  setChangesStatus: (status: string) => void;
}) => {
  const [editingDirection, setEditingDirection] = useState<number | null>(null);
  const [newDirection, setNewDirection] = useState<Direction>({
    type: 'car',
    information: '',
    location: { address: '' },
  });
  const [shouldDisplayAddForm, setShouldDisplayAddForm] = useState(false);

  const hasAllDirectionTypes = () => {
    const existingTypes = form
      .getValues()
      .locationDirections?.map((d: Direction) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.every((type) => existingTypes?.includes(type));
  };

  const getAvailableTypes = (): Direction['type'][] => {
    if (!form) return ['car', 'train', 'car rental'];
    const existingTypes = form
      .getValues()
      .locationDirections?.map((d: Direction) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.filter((type) => !existingTypes?.includes(type));
  };

  const addDirection = (direction: Direction) => {
    if (
      !form ||
      !direction.information.trim() ||
      !direction.location.address.trim()
    )
      return;

    form.setValue('locationDirections', [
      ...(form.getValues().locationDirections || []),
      { ...direction },
    ]);
    form.trigger('locationDirections');

    // Set the next available type for the new direction
    const availableTypes = getAvailableTypes();
    setNewDirection({
      type: (availableTypes[0] || 'car') as Direction['type'],
      information: '',
      location: { address: '', link: '' },
    });
    setShouldDisplayAddForm(false);
    setChangesStatus('1');
  };

  const updateDirection = (index: number, direction: Direction) => {
    if (!form) return;

    const updatedDirections = [...(form.getValues().locationDirections || [])];
    updatedDirections[index] = direction;

    form.setValue('locationDirections', updatedDirections);
    form.trigger('locationDirections');
    setEditingDirection(null);
    setChangesStatus('1');
  };

  const removeDirection = (index: number) => {
    if (!form) return;

    const updatedDirections = [
      ...(form.getValues().locationDirections?.filter((_, i) => i !== index) ||
        []),
    ];
    form.setValue('locationDirections', updatedDirections);
    form.trigger('locationDirections');
    setChangesStatus('1');
  };

  const startEditingDirection = (index: number) => {
    if (!form) return;
    setEditingDirection(index);
  };

  const cancelEditingDirection = () => {
    setEditingDirection(null);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Existing Directions */}
      <div className="space-y-4 ">
        <div className="flex flex-row  justify-between w-full mb-0">
          <FormLabel className="mb-2">Indications du lieu de mariage</FormLabel>
        </div>
        {form.getValues().locationDirections?.map((direction, index) => (
          <div key={index} className=" rounded-lg p-4 border">
            {editingDirection === index ? (
              <DirectionEditForm
                direction={direction}
                onSave={(updatedDirection) =>
                  updateDirection(index, updatedDirection)
                }
                onCancel={cancelEditingDirection}
                availableTypes={['car', 'train', 'car rental']}
              />
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      {DirectionsIcons[direction.type]}{' '}
                      {direction.type === 'car'
                        ? 'En voiture'
                        : direction.type === 'train'
                          ? 'En train'
                          : 'Location de voiture'}
                    </Badge>
                  </div>
                  <p className="text-sm  mb-2 whitespace-pre-line">
                    {convertTextWithLinksToReactNodes(
                      direction.information,
                      'text-black dark:text-black',
                    )}
                  </p>
                  <div className="flex flex-row items-center gap-2 text-gray-700">
                    {direction.location.link ? (
                      <>
                        <IconMapPinFilled className="w-4 h-4 mt-0.5 text-gray-400" />

                        <LinkPreview
                          url={direction.location.link}
                          width={400}
                          height={300}
                          className=" hover:text-blue-800 underline text-black dark:text-black"
                        >
                          {direction.location.address}
                        </LinkPreview>
                      </>
                    ) : (
                      <span className="text-gray-600 text-sm">
                        {direction.location.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    onClick={() => startEditingDirection(index)}
                    size="icon"
                  >
                    <Edit />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => removeDirection(index)}
                    size="icon"
                    className="bg-destructive"
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {shouldDisplayAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-700 mb-3">
            Ajouter de nouvelles indications
          </h4>
          <DirectionEditForm
            direction={newDirection}
            onSave={addDirection}
            onCancel={() => {
              const availableTypes = getAvailableTypes();
              setNewDirection({
                type: (availableTypes[0] || 'car') as Direction['type'],
                information: '',
                location: { address: '', link: '' },
              });
              setShouldDisplayAddForm(false);
            }}
            isNew={true}
            availableTypes={getAvailableTypes()}
          />
        </div>
      )}
      {/* Add New Direction */}
      {!hasAllDirectionTypes() && !shouldDisplayAddForm && (
        <div className=" flex justify-center">
          <Button
            variant="default"
            className=""
            onClick={() => setShouldDisplayAddForm(true)}
          >
            Ajouter une information de navigation <Plus />
          </Button>
        </div>
      )}
      {/* Show message when all types are present */}
      {hasAllDirectionTypes() && (
        <div className=" w-full  items-start gap-4 h-[10rem]">
          <Alert variant="success">
            <CheckCircle2Icon className="size-6" />
            <AlertTitle>
              Toutes les informations de navigation ont été ajoutées !{' '}
            </AlertTitle>
            <AlertDescription>
              Vous pouvez modifier ou supprimer les informations de navigation
              ci-dessus.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
interface DirectionEditFormProps {
  direction: Direction;
  onSave: (direction: Direction) => void;
  onCancel: () => void;
  isNew?: boolean;
  availableTypes?: Direction['type'][];
}

function DirectionEditForm({
  direction,
  onSave,
  onCancel,
  isNew = false,
  availableTypes = ['car', 'train', 'car rental'] as Direction['type'][],
}: DirectionEditFormProps) {
  const [formData, setFormData] = useState<Direction>({ ...direction });

  // Update formData when direction prop changes (for editing)
  useEffect(() => {
    setFormData({ ...direction });
  }, [direction]);

  const handleSave = () => {
    if (!formData.information.trim() || !formData.location.address.trim())
      return;
    onSave(formData);
  };

  const handleChange = (field: keyof Direction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (
    field: keyof Direction['location'],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-4 font-sans">
      <div>
        <FormItem className="font-sans">
          <FormLabel>Type</FormLabel>
          <Select
            onValueChange={(e) => handleChange('type', e as Direction['type'])}
            defaultValue={formData.type}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified email to display" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="font-sans">
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'car'
                    ? 'En voiture'
                    : type === 'train'
                      ? 'En train'
                      : 'Location de voiture'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Sélectionnez le type de navigation.</FormDescription>
          <FormMessage />
        </FormItem>
      </div>
      <FormItem>
        <FormLabel>Informations</FormLabel>
        <FormControl>
          <Textarea
            className="h-20"
            onChange={(e) => handleChange('information', e.target.value)}
            required
            value={formData.information}
          />
        </FormControl>
        <FormDescription className="flex flex-col justify-between">
          <span>Indications, parkings, gares ou autres détails utiles... </span>
          <span>
            Utilisez le format [texte] ([url]) pour ajouter des liens.
          </span>
        </FormDescription>
        <FormMessage />
      </FormItem>
      <FormItem className="w-full">
        <FormLabel>Adresse</FormLabel>
        <FormControl>
          <Input
            placeholder="Adresse complète"
            value={formData.location.address}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            required
          />
        </FormControl>
        <FormDescription>
          Indiquez l'adresse concernant l'indication (parking, gare, etc.)
        </FormDescription>
        <FormMessage />
      </FormItem>
      <FormItem className="w-full">
        <FormLabel>Lien de l'adresse</FormLabel>
        <FormControl>
          <Input
            type="url"
            value={formData.location.link || ''}
            onChange={(e) => handleLocationChange('link', e.target.value)}
            required
            placeholder="https://maps.google.com/..."
          />
        </FormControl>
        <FormDescription>
          Ce lien permettra d'ouvrir la carte Google Maps directement.
        </FormDescription>
        <FormMessage />
      </FormItem>

      <div className="flex gap-2 justify-between">
        <Button variant="default" onClick={onCancel}>
          Annuler
        </Button>{' '}
        <Button
          type="button"
          onClick={handleSave}
          variant="success"
          disabled={
            !formData.information.trim() ||
            !formData.location.address.trim() ||
            !formData.location?.link?.trim()
          }
        >
          {isNew
            ? 'Ajouter la nouvelle indication'
            : 'Sauvegarder les modifications'}
        </Button>
      </div>
    </div>
  );
}
