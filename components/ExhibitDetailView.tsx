import React, { useState, useEffect } from 'react';
import type { Exhibit } from '../types';
import { BackIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './icons';

interface ExhibitDetailViewProps {
  exhibit: Exhibit;
  onBack: () => void;
  relatedExhibits: Exhibit[];
  onSelectExhibit: (exhibitId: string) => void;
}

export const ExhibitDetailView: React.FC<ExhibitDetailViewProps> = ({ exhibit, onBack, relatedExhibits, onSelectExhibit }) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const { title, artist, description, year, imageUrl } = exhibit;

  useEffect(() => {
    // Cleanup function to stop speech synthesis when the component unmounts or the exhibit changes.
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [exhibit.id]);

  const handleToggleNarration = () => {
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(description);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = (e) => {
        // The 'interrupted' error is expected when speech is cancelled. We can safely ignore it.
        if (e.error !== 'interrupted') {
          console.error('Speech synthesis error:', e.error);
        }
        setIsNarrating(false);
      }
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Scrollable Content */}
      <div className="relative w-full h-full overflow-y-auto animate-fade-in">
        <div className="relative">
          <img src={imageUrl} alt={title} className="w-full h-80 object-contain" />
          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            aria-label="Go back to scanner"
          >
            <BackIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
              <h1 className="text-4xl font-bold leading-tight">{title}</h1>
              <h2 className="text-xl text-gray-300">{artist} ({year})</h2>
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">Description</h3>
              <button
                onClick={handleToggleNarration}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full shadow-sm transition-all"
                aria-label={isNarrating ? 'Stop' : 'Read Aloud'}
              >
                {isNarrating ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                <span>{isNarrating ? 'Stop' : 'Read Aloud'}</span>
              </button>
            </div>
            <p className="text-gray-300">{description}</p>
          </div>

          {relatedExhibits.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Related Artwork</h3>
              <div className="flex overflow-x-auto space-x-4 pb-4 -mx-6 px-6">
                {relatedExhibits.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onSelectExhibit(related.id)}
                    className="flex-shrink-0 w-48 bg-white/5 rounded-lg overflow-hidden text-left hover:bg-white/10 transition-all transform hover:-translate-y-1 shadow-lg"
                    aria-label={`View details for ${related.title}`}
                  >
                    <img src={related.imageUrl} alt={related.title} className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <h4 className="text-md font-semibold truncate text-white">{related.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{related.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind.config.js or a style tag if needed.
// For simplicity, we can add it directly to index.html style tag for this example.
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);