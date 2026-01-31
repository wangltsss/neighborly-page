import { apolloClient } from '@/lib/apollo-client';
import { SEARCH_BUILDINGS } from '@/lib/graphql/queries';

/**
 * Building data model matching GraphQL schema
 */
export interface Building {
  buildingId: string;
  country: string;
  state: string;
  city: string;
  address: string;
  name?: string;
  memberCount: number;
  createdTime: string;
}

/**
 * Parameters for building search
 */
export interface SearchBuildingsParams {
  city: string;
  state: string;
  addressFilter?: string;
}

/**
 * Service layer for building-related API operations
 */
export const buildingService = {
  /**
   * Search for buildings by location
   * 
   * @param params - Search parameters (city, state, optional addressFilter)
   * @returns Array of buildings matching the search criteria
   * @throws Error if GraphQL query fails
   */
  async searchBuildings(params: SearchBuildingsParams): Promise<Building[]> {
    const { data } = await apolloClient.query({
      query: SEARCH_BUILDINGS,
      variables: params,
      fetchPolicy: 'network-only', // Always fetch fresh data for search
    });
    return data.searchBuildings || [];
  },
};
