// Direct AniList GraphQL API Client
// This replaces the MCP server with direct API calls

const ANILIST_API_URL = 'https://graphql.anilist.co';

// GraphQL query fragments
const mediaFragment = `
  id
  title {
    romaji
    english
    native
  }
  type
  status
  episodes
  chapters
  volumes
  description(asHtml: false)
  coverImage {
    large
    medium
  }
  genres
  averageScore
  popularity
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
`;

const userFragment = `
  id
  name
  avatar {
    large
    medium
  }
  statistics {
    anime {
      count
      meanScore
      minutesWatched
    }
    manga {
      count
      meanScore
      chaptersRead
    }
  }
`;

// GraphQL queries
const queries = {
  searchAnime: `
    query SearchAnime($query: String!, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $query, type: ANIME) {
          ${mediaFragment}
        }
      }
    }
  `,

  searchManga: `
    query SearchManga($query: String!, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $query, type: MANGA) {
          ${mediaFragment}
        }
      }
    }
  `,

  getAnimeDetails: `
    query GetAnime($id: Int!) {
      Media(id: $id, type: ANIME) {
        ${mediaFragment}
        studios {
          edges {
            node {
              name
            }
          }
        }
        characters {
          edges {
            node {
              name {
                full
              }
            }
            role
          }
        }
      }
    }
  `,

  getMangaDetails: `
    query GetManga($id: Int!) {
      Media(id: $id, type: MANGA) {
        ${mediaFragment}
        staff {
          edges {
            node {
              name {
                full
              }
            }
            role
          }
        }
      }
    }
  `,

  getUserProfile: `
    query GetUser($name: String!) {
      User(name: $name) {
        ${userFragment}
        bannerImage
        about(asHtml: false)
        favourites {
          anime {
            nodes {
              id
              title {
                romaji
              }
            }
          }
          manga {
            nodes {
              id
              title {
                romaji
              }
            }
          }
        }
      }
    }
  `,

  getCharacter: `
    query GetCharacter($id: Int!) {
      Character(id: $id) {
        id
        name {
          full
          native
        }
        image {
          large
          medium
        }
        description(asHtml: false)
        favourites
        media {
          nodes {
            id
            title {
              romaji
            }
            type
          }
        }
      }
    }
  `,

  searchCharacter: `
    query SearchCharacter($query: String!, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        characters(search: $query) {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
          description(asHtml: false)
        }
      }
    }
  `
};

// Main API client class
class AniListClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async makeRequest(query: string, variables: any = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(ANILIST_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data.data;
    } catch (error) {
      console.error('AniList API request failed:', error);
      throw error;
    }
  }

  async searchAnime(query: string, page = 1, perPage = 10) {
    const data = await this.makeRequest(queries.searchAnime, {
      query,
      page,
      perPage
    });
    return data.Page.media;
  }

  async searchManga(query: string, page = 1, perPage = 10) {
    const data = await this.makeRequest(queries.searchManga, {
      query,
      page,
      perPage
    });
    return data.Page.media;
  }

  async getAnimeDetails(id: number) {
    const data = await this.makeRequest(queries.getAnimeDetails, { id });
    return data.Media;
  }

  async getMangaDetails(id: number) {
    const data = await this.makeRequest(queries.getMangaDetails, { id });
    return data.Media;
  }

  async getUserProfile(name: string) {
    try {
      const data = await this.makeRequest(queries.getUserProfile, { name });
      return data.User;
    } catch (error) {
      console.error(`Failed to get user profile for ${name}:`, error);
      return null;
    }
  }

  async getCharacter(id: number) {
    const data = await this.makeRequest(queries.getCharacter, { id });
    return data.Character;
  }

  async searchCharacter(query: string, page = 1, perPage = 10) {
    const data = await this.makeRequest(queries.searchCharacter, {
      query,
      page,
      perPage
    });
    return data.Page.characters;
  }
}

// Create a singleton instance
const client = new AniListClient(process.env.ANILIST_TOKEN);

// Export tool functions that match the existing interface
export const anilistTools = {
  searchAnime: async (args: { query: string }) => {
    try {
      const results = await client.searchAnime(args.query);
      return results;
    } catch (error) {
      console.error('searchAnime failed:', error);
      return [];
    }
  },

  searchManga: async (args: { query: string }) => {
    try {
      const results = await client.searchManga(args.query);
      return results;
    } catch (error) {
      console.error('searchManga failed:', error);
      return [];
    }
  },

  getUserProfile: async (args: { username: string }) => {
    try {
      const profile = await client.getUserProfile(args.username);
      return profile;
    } catch (error) {
      console.error('getUserProfile failed:', error);
      return null;
    }
  },

  getAnimeDetails: async (args: { animeId: number }) => {
    try {
      const details = await client.getAnimeDetails(args.animeId);
      return details;
    } catch (error) {
      console.error('getAnimeDetails failed:', error);
      return null;
    }
  },

  getMangaDetails: async (args: { mangaId: number }) => {
    try {
      const details = await client.getMangaDetails(args.mangaId);
      return details;
    } catch (error) {
      console.error('getMangaDetails failed:', error);
      return null;
    }
  },

  getCharacter: async (args: { characterId: number }) => {
    try {
      const character = await client.getCharacter(args.characterId);
      return character;
    } catch (error) {
      console.error('getCharacter failed:', error);
      return null;
    }
  },

  searchCharacter: async (args: { query: string }) => {
    try {
      const results = await client.searchCharacter(args.query);
      return results;
    } catch (error) {
      console.error('searchCharacter failed:', error);
      return [];
    }
  }
};

// Export tool definitions for the supervisor agent
export const anilistToolDefinitions = [
  {
    type: "function",
    name: "searchAnime",
    description: "Search for anime by title on AniList",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for anime title"
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "searchManga",
    description: "Search for manga by title on AniList",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for manga title"
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getUserProfile",
    description: "Get AniList user profile and statistics",
    parameters: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "AniList username to look up"
        }
      },
      required: ["username"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getAnimeDetails",
    description: "Get detailed information about a specific anime by ID",
    parameters: {
      type: "object",
      properties: {
        animeId: {
          type: "number",
          description: "AniList anime ID"
        }
      },
      required: ["animeId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getMangaDetails",
    description: "Get detailed information about a specific manga by ID",
    parameters: {
      type: "object",
      properties: {
        mangaId: {
          type: "number",
          description: "AniList manga ID"
        }
      },
      required: ["mangaId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getCharacter",
    description: "Get information about a character by ID",
    parameters: {
      type: "object",
      properties: {
        characterId: {
          type: "number",
          description: "AniList character ID"
        }
      },
      required: ["characterId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "searchCharacter",
    description: "Search for characters by name on AniList",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for character name"
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  }
];