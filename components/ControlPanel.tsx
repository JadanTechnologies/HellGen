import React from 'react';
import { ParticleTemplate } from '../types';
import { HeartIcon, FlowerIcon, SaturnIcon, BuddhaIcon, FireworksIcon } from './icons';

interface ControlPanelProps {
    selectedTemplate: ParticleTemplate;
    onTemplateChange: (template: ParticleTemplate) => void;
    selectedColor: string;
    onColorChange: (color: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedTemplate,
    onTemplateChange,
    selectedColor,
    onColorChange,
}) => {
    const templates = [
        { id: ParticleTemplate.Heart, Icon: HeartIcon },
        { id: ParticleTemplate.Flower, Icon: FlowerIcon },
        { id: ParticleTemplate.Saturn, Icon: SaturnIcon },
        { id: ParticleTemplate.Buddha, Icon: BuddhaIcon },
        { id: ParticleTemplate.Fireworks, Icon: FireworksIcon },
    ];

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 p-3 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl z-20">
            {templates.map(({ id, Icon }) => (
                <div key={id} className="relative group">
                    <button
                        onClick={() => onTemplateChange(id)}
                        className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            selectedTemplate === id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                        aria-label={`Select ${id} template`}
                    >
                        <Icon className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {id}
                    </div>
                </div>
            ))}
            
            <div className="w-px h-8 bg-gray-700 mx-1"></div>
            
            <div className="relative group">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-600 hover:border-gray-400 transition-colors">
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => onColorChange(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none cursor-pointer"
                    />
                </div>
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Color
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;