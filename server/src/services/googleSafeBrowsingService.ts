import axios from 'axios';
import { getSettings } from './settingsService.js';

interface ThreatEntryMetadataItem {
  key: string;
  value: string;
}

export interface SafeBrowsingMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threat: {
    url: string;
  };
  threatEntryMetadata?: {
    entries: ThreatEntryMetadataItem[];
  };
  cacheDuration?: string;
}

interface SafeBrowsingResponse {
  matches?: SafeBrowsingMatch[];
}

export interface SafeBrowsingResult {
  matches: SafeBrowsingMatch[];
}

export async function checkSafeBrowsing(url: string): Promise<SafeBrowsingResult> {
  const { googleSafeBrowsingKey } = getSettings();

  if (!googleSafeBrowsingKey) {
    return { matches: [] };
  }

  const payload = {
    client: {
      clientId: 'jagoan-platform',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }]
    }
  };

  try {
    const response = await axios.post<SafeBrowsingResponse>(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingKey}`,
      payload,
      { timeout: 5000 }
    );

    return {
      matches: response.data.matches ?? []
    };
  } catch (error) {
    console.error('Google Safe Browsing error', error);
    return { matches: [] };
  }
}
