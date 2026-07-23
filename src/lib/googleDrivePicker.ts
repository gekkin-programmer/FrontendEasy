// Loads Google Identity Services + the Picker API on demand and opens the
// Drive file picker. Both the client ID and API key are meant to be public
// in client code (restricted by JS origin / HTTP referrer on Google's side).

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => { (script as any)._loaded = true; resolve(); };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureGoogleScripts(): Promise<void> {
  await Promise.all([
    loadScript('https://accounts.google.com/gsi/client'),
    loadScript('https://apis.google.com/js/api.js'),
  ]);
  await new Promise<void>((resolve) => window.gapi.load('picker', () => resolve()));
}

function requestAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.access_token);
        }
      },
      error_callback: (err: any) => {
        reject(new Error(err?.type || 'Google auth failed'));
      },
    });
    tokenClient.requestAccessToken();
  });
}

export interface DrivePickedFile {
  fileId: string;
  accessToken: string;
}

export async function openGoogleDrivePicker(): Promise<DrivePickedFile | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
  if (!clientId || !apiKey) {
    throw new Error('Google Drive Picker is not configured');
  }

  await ensureGoogleScripts();
  const accessToken = await requestAccessToken(clientId);

  return new Promise((resolve, reject) => {
    try {
      const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs?.[0];
            resolve(doc ? { fileId: doc.id, accessToken } : null);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();
      picker.setVisible(true);
    } catch (err) {
      reject(err);
    }
  });
}
