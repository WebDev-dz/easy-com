import { api } from './api';
import { SearchResponse, SearchByIdRequest } from './types';

const searchService = {
    // Search for similar products by uploading an image
    searchByImage: async (image: File): Promise<SearchResponse> => {
        const formData = new FormData();
        formData.append('image', image);

        const response = await api.post<SearchResponse>(`/search`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Search for similar products by image ID
    searchById: async (data: SearchByIdRequest): Promise<SearchResponse> => {
        const response = await api.post<SearchResponse>(`/products/search-by-id`, data);
        return response.data;
    }
};

export default searchService; 