import axios, { type AxiosRequestConfig } from 'axios'

const apiUrl = 'https://api.github.com/gists/'
const apiVersion = '2022-11-28'
const gistID = '4fecd1f04cf402778c0f777b7eac5dc3'
const token = ''

interface GistFile {
  content: string
}

interface GistUpdate {
  description: string
  files: {
    [key: string]: GistFile
  }
}

export class GitHubGist {
  public static async read() {
    const gist = await this.getGist()
    return gist.files['main.go'].content
  }

  private static async updateGist(gistUpdate: GistUpdate): Promise<void> {
    const jsonData = JSON.stringify(gistUpdate)
    await this.sendGistRequest('patch', jsonData)
  }

  private static async getGist(): Promise<any> {
    return await this.sendGistRequest('get', null)
  }

  private static async sendGistRequest(
    method: 'get' | 'patch',
    jsonData: string | null
  ): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `${apiUrl}${gistID}`,
      method: method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': apiVersion
      }
    }

    if (method === 'patch' && jsonData) {
      config.data = jsonData
      config.headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await axios(config)
      if (response.status === 200) {
        if (method === 'get') {
          console.log('Gist retrieved successfully')
          console.log(response.data)
        } else {
          console.log('Gist updated successfully')
        }
        return response.data
      } else {
        throw new Error(
          `Failed to ${method === 'get' ? 'retrieve' : 'update'} gist: ${response.status}`
        )
      }
    } catch (error) {
      throw new Error(`Error making request: ${error.message}`)
    }
  }
}
