import React, { useState, useCallback, useEffect } from 'react';
import type { AppView, Exhibit } from './types';
import { ScannerView } from './components/ScannerView';
import { ExhibitDetailView } from './components/ExhibitDetailView';
import { mockExhibits } from './services/mockData';
import { identifyArtwork } from './services/geminiService';
import { analyticsService } from './services/analyticsService';
import { PrivacyConsent } from './components/PrivacyConsent';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 text-white">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">Identifying artwork...</p>
        </div>
    );
};

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 text-center p-4">
            <h2 className="text-xl font-bold text-red-500 mb-2">Scan Failed</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <button
                onClick={onRetry}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [view, setView] = useState<AppView>('scanner');
  const [activeExhibit, setActiveExhibit] = useState<Exhibit | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('museum_privacy_consent');
    if (consent === 'true') {
      setPrivacyConsent(true);
      analyticsService.track('app_load_with_consent');
    } else {
      analyticsService.track('app_load_no_consent');
    }
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('museum_privacy_consent', 'true');
    setPrivacyConsent(true);
    analyticsService.track('privacy_consent_accepted');
  };

  const handleCapture = useCallback(async (base64Image: string) => {
    setView('loading');
    analyticsService.track('scan_initiated');

    try {
      const exhibitId = await identifyArtwork(base64Image);
      if (exhibitId) {
        const foundExhibit = mockExhibits.find(e => e.id === exhibitId);
        if (foundExhibit) {
          setActiveExhibit(foundExhibit);
          setView('detail');
          analyticsService.track('scan_success', { exhibitId: foundExhibit.id });
        } else {
          throw new Error('Identified artwork not found in our database.');
        }
      } else {
        setErrorMessage('Could not identify the artwork. Please try again with better lighting and a clearer angle.');
        setView('error');
        analyticsService.track('scan_failed', { reason: 'not_identified' });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An unexpected error occurred during identification.');
      setView('error');
      analyticsService.track('scan_failed', { reason: 'api_error' });
    }
  }, []);

  const resetToScanner = useCallback(() => {
    setView('scanner');
    setActiveExhibit(null);
    setErrorMessage('');
    analyticsService.track('navigation_to_scanner');
  }, []);

  const handleSelectExhibit = useCallback((exhibitId: string) => {
    const foundExhibit = mockExhibits.find(e => e.id === exhibitId);
    if (foundExhibit) {
      setActiveExhibit(foundExhibit);
      analyticsService.track('navigation_to_related_exhibit', { exhibitId });
    }
  }, []);

  const renderView = () => {
    switch (view) {
      case 'scanner':
        return <ScannerView onCapture={handleCapture} />;
      case 'loading':
        return <LoadingSpinner />;
      case 'detail':
        if (!activeExhibit) {
          return <ErrorDisplay message={"Exhibit data is missing."} onRetry={resetToScanner} />;
        }
        const relatedExhibits = activeExhibit.relatedArtworkIds
            ?.map(id => mockExhibits.find(e => e.id === id))
            .filter((e): e is Exhibit => !!e) ?? [];

        return (
          <ExhibitDetailView
            key={activeExhibit.id} // Re-mounts component on exhibit change
            exhibit={activeExhibit}
            onBack={resetToScanner}
            relatedExhibits={relatedExhibits}
            onSelectExhibit={handleSelectExhibit}
          />
        );
      case 'error':
        return <ErrorDisplay message={errorMessage} onRetry={resetToScanner} />;
      default:
        return <ScannerView onCapture={handleCapture} />;
    }
  };

  return (
    <main className="h-screen w-screen font-sans">
      {renderView()}
      {!privacyConsent && <PrivacyConsent onAccept={handlePrivacyAccept} />}
    </main>
  );
};

export default App;