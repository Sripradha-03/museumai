export interface Exhibit {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  imageUrl: string;
  relatedArtworkIds?: string[];
}

export type AppView = 'scanner' | 'loading' | 'detail' | 'error';

export interface AnalyticsEvent {
  eventName: string;
  payload: {
    timestamp: number;
    sessionId: string;
    exhibitId?: string;
    [key: string]: any;
  };
}