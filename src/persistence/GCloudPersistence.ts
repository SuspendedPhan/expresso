import { gapi } from 'gapi-script';
import GCloudKey from './GCloudKey';
import { PersistService } from './Persistence';

const CLIENT_ID = GCloudKey.client_id;
const API_KEY = GCloudKey.private_key;
const SCOPES = 'https://www.googleapis.com/auth/devstorage.read_write';
const BUCKET_NAME = 'expresso';

export default class GoogleCloudPersistService implements PersistService {
  constructor() {
    this.initClient();
  }

  private initClient(): void {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/storage/v1/rest'],
        scope: SCOPES,
      }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
        this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
    });
  }

  private updateSigninStatus(isSignedIn: boolean): void {
    if (!isSignedIn) {
      this.handleAuthClick();
    }
  }

  private handleAuthClick(): void {
    gapi.auth2.getAuthInstance().signIn();
  }

  async readFile(name: string): Promise<any> {
    try {
      const response = await gapi.client.storage.objects.get({
        bucket: BUCKET_NAME,
        object: name,
        alt: 'media',
      });
      return response.result;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async writeFile(name: string, content: any): Promise<void> {
    try {
      const base64Content = btoa(JSON.stringify(content));
      await gapi.client.storage.objects.insert({
        bucket: BUCKET_NAME,
        name: name,
        media: {
          mimeType: 'application/json',
          body: base64Content,
        },
      });
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }
}
