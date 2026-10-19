export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}

export const apiClient: ApiClient = {
  async get<T>(path: string) {
    throw new Error(`API not connected yet: GET ${path}`) as unknown as T;
  },
  async post<T>(path: string) {
    throw new Error(`API not connected yet: POST ${path}`) as unknown as T;
  },
};
