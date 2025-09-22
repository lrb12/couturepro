import React, { useState } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#1B7F4D', '#3EBE72', '#0C3A24', // Verts
  '#2563EB', '#3B82F6', '#1E40AF', // Bleus
  '#DC2626', '#EF4444', '#B91C1C', // Rouges
  '#7C3AED', '#8B5CF6', '#6D28D9', // Violets
  '#EA580C', '#F97316', '#C2410C', // Oranges
  '#059669', '#10B981', '#047857', // Emeraudes
  '#DB2777', '#EC4899', '#BE185D', // Roses
  '#374151', '#4B5563', '#1F2937'  // Gris
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setShowPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        >
          <Palette className="text-white" size={20} />
        </div>
        
        <input
          type="text"
          value={customColor}
          onChange={handleCustomColorChange}
          placeholder="#FF5733"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        
        <input
          type="color"
          value={value}
          onChange={handleCustomColorChange}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
        />
      </div>

      {showPicker && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Couleurs prédéfinies</p>
          <div className="grid grid-cols-8 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => handlePresetClick(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};