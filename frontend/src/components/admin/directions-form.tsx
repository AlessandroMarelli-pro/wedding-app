import { FormLabel } from '@/components/ui/form';
import { formSchema, WeddingInfo } from '@/pages/admin/information';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import z from 'zod';
import { Direction } from '../../types/api';

export const DirectionsForm = ({
  form,
  setWeddingInfo,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  setWeddingInfo: (form: WeddingInfo) => void;
}) => {
  const [editingDirection, setEditingDirection] = useState<number | null>(null);
  const [newDirection, setNewDirection] = useState<Direction>({
    type: 'car',
    information: '',
    location: { address: '' },
  });

  const hasAllDirectionTypes = () => {
    const existingTypes = form
      .getValues()
      .locationDirections.map((d: Direction) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.every((type) => existingTypes.includes(type));
  };

  const getAvailableTypes = (): Direction['type'][] => {
    if (!form) return ['car', 'train', 'car rental'];
    const existingTypes = form
      .getValues()
      .locationDirections.map((d: Direction) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.filter((type) => !existingTypes.includes(type));
  };

  const addDirection = (direction: Direction) => {
    if (
      !form ||
      !direction.information.trim() ||
      !direction.location.address.trim()
    )
      return;

    form.setValue('locationDirections', [
      ...form.getValues().locationDirections,
      { ...direction },
    ]);
    // Set the next available type for the new direction
    const availableTypes = getAvailableTypes();
    setNewDirection({
      type: (availableTypes[0] || 'car') as Direction['type'],
      information: '',
      location: { address: '', link: '' },
    });
  };

  const updateDirection = (index: number, direction: Direction) => {
    if (!form) return;

    const updatedDirections = [...form.getValues().locationDirections];
    updatedDirections[index] = direction;

    form.setValue('locationDirections', updatedDirections);
    setEditingDirection(null);
  };

  const removeDirection = (index: number) => {
    if (!form) return;

    const updatedDirections = form
      .getValues()
      .locationDirections.filter((_, i) => i !== index);

    form.setValue('locationDirections', updatedDirections);
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
        <FormLabel>Directions & Additional Info</FormLabel>
        {form.getValues().locationDirections.map((direction, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
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
                    <span className="px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
                      {direction.type === 'car'
                        ? 'En voiture'
                        : direction.type === 'train'
                          ? 'En train'
                          : 'Location de voiture'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">
                    {direction.information}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">📍</span>
                    {direction.location.link ? (
                      <a
                        href={direction.location.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {direction.location.address}
                      </a>
                    ) : (
                      <span className="text-gray-600 text-sm">
                        {direction.location.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEditingDirection(index)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDirection(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Direction */}
      {!hasAllDirectionTypes() && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-700 mb-3">Add New Direction</h4>
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
            }}
            isNew={true}
            availableTypes={getAvailableTypes()}
          />
        </div>
      )}

      {/* Show message when all types are present */}
      {hasAllDirectionTypes() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-800 font-medium">
              All direction types have been added! You can edit or remove
              existing directions above.
            </p>
          </div>
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            handleChange('type', e.target.value as Direction['type'])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        >
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'car'
                ? 'En voiture'
                : type === 'train'
                  ? 'En train'
                  : 'Location de voiture'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Information (Markdown supported)
        </label>
        <textarea
          value={formData.information}
          onChange={(e) => handleChange('information', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="Directions, parking info, or other helpful details..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={formData.location.address}
          onChange={(e) => handleLocationChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="Full address"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link (optional)
        </label>
        <input
          type="url"
          value={formData.location.link || ''}
          onChange={(e) => handleLocationChange('link', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          {isNew ? 'Add Direction' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
