import axios from 'axios';

const JSON_PLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';

export interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const getJsonPlaceholderPosts = async (signal?: AbortSignal) => {
  const { data } = await axios.get<JsonPlaceholderPost[]>(
    `${JSON_PLACEHOLDER_URL}/posts`,
    {
      params: {
        _limit: 8
      },
      signal
    }
  );

  return data;
};
