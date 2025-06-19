import { ServiceOrder, ServiceOrdersResponse } from './types';
import { api, getAuthHeaders } from './api';

class OrderService {

  async getUserServiceOrders(userId: number, token?: string): Promise<ServiceOrder[]> {
    try {
      const response = await api.get<ServiceOrdersResponse>(
        `/service-orders/user/${userId}`,
        {
          headers: await getAuthHeaders(token)
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user service orders:', error);
      throw error;
    }
  }

  async getServiceProviderOrders(providerId: number, token?: string): Promise<ServiceOrder[]> {
    try {
      const response = await api.get<ServiceOrdersResponse>(
        `/service-orders/provider/${providerId}`,
        {
          headers: await getAuthHeaders(token)
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service provider orders:', error);
      throw error;
    }
  }

  async getServiceOrderById(orderId: number, token?: string): Promise<ServiceOrder> {
    try {
      const response = await api.get<{ data: ServiceOrder }>(
        `/service-orders/${orderId}`,
        {
          headers: await getAuthHeaders()
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service order:', error);
      throw error;
    }
  }

  async createServiceOrder(
    orderData: Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at' | 'user' | 'service_provider' | 'skill'>,
    token?: string
  ): Promise<ServiceOrder> {
    try {
      const response = await api.post<{ data: ServiceOrder }>(
        `/service-orders`,
        orderData,
        {
          headers: await getAuthHeaders()
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating service order:', error);
      throw error;
    }
  }

  async updateServiceOrderStatus(
    orderId: number,
    status: ServiceOrder['status'],
    token?: string
  ): Promise<ServiceOrder> {
    try {
      const response = await api.patch<{ data: ServiceOrder }>(
        `/service-orders/${orderId}/status`,
        { status },
        {
          headers: await getAuthHeaders()
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating service order status:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService(); 