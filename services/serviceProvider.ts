import { api, getAuthHeaders } from './api';
import { 
    Project, 
    CreateProjectRequest, 
    UpdateProjectRequest,
    ProjectResponse 
} from './types';

const serviceProviderService = {
    // Create a new project
    createProject: async (serviceProviderId: number, data: CreateProjectRequest): Promise<Project> => {
        const formData = new FormData();
        
        // Append required fields
        formData.append('title', data.title);
        
        // Append optional fields if they exist
        if (data.description) formData.append('description', data.description);
        if (data.service_provider_id) formData.append('service_provider_id', data.service_provider_id.toString());
        
        // Append pictures if they exist
        if (data.pictures) {
            data.pictures.forEach((picture, index) => {
                formData.append(`pictures[${index}]`, picture);
            });
        }

        const response = await api.post<ProjectResponse>(
            `/service_providers/${serviceProviderId}/portfolio/projects`,
            formData,
            {
                headers: {
                    ...await getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    // Update a project
    updateProject: async (
        serviceProviderId: number,
        projectId: number,
        data: UpdateProjectRequest
    ): Promise<Project> => {
        const formData = new FormData();

        // Append fields if they exist
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);

        // Append pictures if they exist
        if (data.pictures) {
            data.pictures.forEach((picture, index) => {
                formData.append(`pictures[${index}]`, picture);
            });
        }

        const response = await api.put<ProjectResponse>(
            `/service-providers/${serviceProviderId}/portfolio/projects/${projectId}`,
            formData,
            {
                headers: {
                    ...await getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    // Delete a project
    deleteProject: async (projectId: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(
            `/service_providers/portfolio/projects/${projectId}`,
            {
                headers: await getAuthHeaders()
            }
        );
        return response.data;
    }
};

export default serviceProviderService; 