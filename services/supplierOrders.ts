import axios from 'axios';

import  {api, getAuthHeaders } from './api';
import { Order, UserOrder } from '@/types/orders';

const isSumulated = false;


export type OrderStatus = 'pending' | 'processing' | 'delivered' ;


export type UpdateOrderStatusRequest = {
    status: OrderStatus;
};

export interface UpdateOrderStatusResponse {
    message: string;
    order: {
        id: number;
        status: string;
        updated_at: string;
    };
}

const UserOrdersService = {
    // Get all user orders
    getUserOrders: async (userId: number): Promise<Order[]> => {
        if (isSumulated) {
            return [];
        }
        const response = await api.get<Order[]>(`/orders/user/${userId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get all orders received by a supplier
    getRecievedOrders: async (supplierId: number): Promise<Order[]> => {
        if (isSumulated) {
            return [];
        }
        const response = await api.get<Order[]>(`/orders/supplier/${supplierId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get a specific supplier order by ID
    getOrderById: async (orderId: number): Promise<Order> => {
       
        const response = await api.get<Order>(`/orders/${orderId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (
        orderId: number,
        data: UpdateOrderStatusRequest
    ): Promise<UpdateOrderStatusResponse> => {
        // if (isSumulated) {
        //     const order = mockOrders.find(o => o.id === orderId);
        //     if (!order) throw new Error('Order not found');
        //     order.status = data.status;
        //     order.updated_at = new Date().toISOString();
        //     return {
        //         message: 'Order status updated successfully',
        //         order: {
        //             id: order.id,
        //             status: order.status,
        //             updated_at: order.updated_at
        //         }
        //     };
        // }
        const response = await api.patch<UpdateOrderStatusResponse>(
            `/orders/${orderId}/status`,
            data,{
                headers: await getAuthHeaders()
            }
        );
        return response.data;
    },

    // Validate an order
    validateOrder: async (orderId: number): Promise<{ message: string }> => {
        // if (isSumulated) {
        //     const order = mockOrders.find(o => o.id === orderId);
        //     if (!order) throw new Error('Order not found');
        //     order.is_validated = true;
        //     return { message: 'Order validated successfully' };
        // }
        const response = await api.post<{ message: string }>(`/supplier/orders/${orderId}/validate`);
        return response.data;
    },

    // Delete an order
    deleteOrder: async (orderId: number): Promise<{ message: string }> => {
        // if (isSumulated) {
        //     const index = mockOrders.findIndex(o => o.id === orderId);
        //     if (index === -1) throw new Error('Order not found');
        //     mockOrders.splice(index, 1);
        //     return { message: 'Order deleted successfully' };
        // }
        const response = await api.delete<{ message: string }>(`/supplier/orders/${orderId}`);
        return response.data;
    }
};

export default UserOrdersService; 