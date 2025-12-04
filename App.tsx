import React, { useState } from 'react';
import { ParticleTemplate } from './types';
import ControlPanel from './components/ControlPanel';
import ParticleCanvas from './components/ParticleCanvas';

const App: React.FC = () => {
  const [template, setTemplate] = useState<ParticleTemplate>(ParticleTemplate.Heart);
  const [color, setColor] = useState<string>('#ff007f');

  return (
    <main className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      <ParticleCanvas template={template} color={color} />
      
      {/* Branding Layer */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs font-light tracking-[0.2em] uppercase text-right">
          Developed By<br />
          <span className="font-bold text-indigo-400">Jadan Technologies</span>
        </p>
      </div>

      <ControlPanel
        selectedTemplate={template}
        onTemplateChange={setTemplate}
        selectedColor={color}
        onColorChange={setColor}
      />
    </main>
  );
};

export default App;