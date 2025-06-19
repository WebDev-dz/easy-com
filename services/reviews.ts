import { api, getAuthHeaders } from './api';
import { SupplierReviewsResponse } from './types';

const reviewsService = {
    // Get reviews for a specific supplier
    getSupplierReviews: async (supplierId: number): Promise<SupplierReviewsResponse> => {
        const response = await api.get<SupplierReviewsResponse>(`/suppliers/${supplierId}/reviews`, {
            headers: await getAuthHeaders()
        });
        return response.data;
    }
};

export default reviewsService; 