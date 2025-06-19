import axios from 'axios';
import { WilayasResponse, CommunesResponse } from './types';
import { api } from './api';



export const wilayaService = {
    getWilayas: async (): Promise<WilayasResponse> => {
        const response = await api.get<WilayasResponse>('/wilayas');
        return response.data;
    },

    getWilayaCommunes: async (id: number): Promise<CommunesResponse> => {
        const response = await api.get<CommunesResponse>(`/wilayas/${id}/communes`);
        return response.data;
    },
}; 