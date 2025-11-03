
import type { AnalyticsEvent } from '../types';

class AnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getSessionId();
  }

  private getSessionId(): string {
    let sid = sessionStorage.getItem('museum_session_id');
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('museum_session_id', sid);
    }
    return sid;
  }

  public track(eventName: string, payload: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      eventName,
      payload: {
        ...payload,
        timestamp: Date.now(),
        sessionId: this.sessionId,
      },
    };
    
    // In a real application, this would send the event to an analytics backend.
    console.log('ANALYTICS EVENT:', event);
  }
}

export const analyticsService = new AnalyticsService();
