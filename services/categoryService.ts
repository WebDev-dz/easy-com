import { CategoriesResponse, CategoryResponse } from './types';
import { api } from './api';




export const categoryService = {
    getCategories: async (): Promise<CategoriesResponse> => {
        const response = await api.get<CategoriesResponse>('/categories');
        return response.data;
    },

    getCategoryById: async (id: number): Promise<CategoryResponse> => {
        const response = await api.get<CategoryResponse>(`/categories/${id}`);
        return response.data;
    },
}; 