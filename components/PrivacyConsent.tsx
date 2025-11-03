
import React from 'react';

interface PrivacyConsentProps {
  onAccept: () => void;
}

export const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onAccept }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          This app uses anonymous analytics to help the museum understand exhibit popularity. We do not collect any personal information.
        </p>
        <button
          onClick={onAccept}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
.animate-slide-up {
    animation: slideUp 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);