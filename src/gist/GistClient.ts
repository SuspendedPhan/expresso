import axios from 'axios';
import Token from './Token';

const GITHUB_API_URL = 'https://api.github.com';

interface GistFile {
  content: string;
}

interface Gist {
  description: string;
  public: boolean;
  files: {
    [filename: string]: GistFile;
  };
}

class GistClient {
  private token: string;

  constructor(token: string = Token) {
    this.token = token;
  }

  private getAuthHeaders() {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async createGist(description: string, isPublic: boolean, files: { [filename: string]: string }): Promise<any> {
    const gist: Gist = {
      description,
      public: isPublic,
      files: {}
    };

    for (const [filename, content] of Object.entries(files)) {
      gist.files[filename] = { content };
    }

    try {
      const response = await axios.post(`${GITHUB_API_URL}/gists`, gist, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Gist:', error);
      throw error;
    }
  }

  async getGist(gistId: string): Promise<any> {
    try {
      const response = await axios.get(`${GITHUB_API_URL}/gists/${gistId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Gist:', error);
      throw error;
    }
  }

  async updateGist(gistId: string, files: { [filename: string]: string }): Promise<any> {
    const gist: Partial<Gist> = {
      files: {}
    };

    for (const [filename, content] of Object.entries(files)) {
      gist.files![filename] = { content };
    }

    try {
      const response = await axios.patch(`${GITHUB_API_URL}/gists/${gistId}`, gist, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Gist:', error);
      throw error;
    }
  }

  async deleteGist(gistId: string): Promise<void> {
    try {
      await axios.delete(`${GITHUB_API_URL}/gists/${gistId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error deleting Gist:', error);
      throw error;
    }
  }
}

export default GistClient;
