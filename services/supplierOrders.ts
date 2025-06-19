import axios from 'axios';

import  {api, getAuthHeaders } from './api';

const isSumulated = false;

// Simulated data
const mockOrders: SupplierOrder[] = [
  {
    id: 1,
    user_id: 3,
    supplier_id: 5,
    wilaya_id: 1,
    commune_id: 1,
    full_name: "John Doe",
    phone_number: "0555123456",
    address: "123 Main St",
    status: "pending",
    is_validated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_products: [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 2,
        unit_price: 1000
      }
    ]
  }
];

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export interface SupplierOrderProduct {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
}

export interface SupplierOrder {
    id: number;
    user_id: number;
    supplier_id: number;
    wilaya_id: number;
    commune_id: number;
    full_name: string;
    phone_number: string;
    address: string | null;
    status: OrderStatus;
    is_validated: boolean;
    created_at: string;
    updated_at: string;
    order_products: SupplierOrderProduct[];
}

export interface UpdateOrderStatusRequest {
    status: 'pending' | 'processing' | 'delivered';
}

export interface UpdateOrderStatusResponse {
    message: string;
    order: {
        id: number;
        status: string;
        updated_at: string;
    };
}

const supplierOrdersService = {
    // Get all user orders
    getUserOrders: async (userId: number): Promise<SupplierOrder[]> => {
        if (isSumulated) {
            return mockOrders;
        }
        const response = await api.get<SupplierOrder[]>(`/orders/user/${userId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get all orders received by a supplier
    getRecievedOrders: async (supplierId: number): Promise<SupplierOrder[]> => {
        if (isSumulated) {
            return mockOrders;
        }
        const response = await api.get<SupplierOrder[]>(`/orders/supplier/${supplierId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get a specific supplier order by ID
    getOrderById: async (orderId: number): Promise<SupplierOrder> => {
        if (isSumulated) {
            const order = mockOrders.find(o => o.id === orderId);
            if (!order) throw new Error('Order not found');
            return order;
        }
        const response = await api.get<SupplierOrder>(`/supplier/orders/${orderId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (
        orderId: number,
        data: UpdateOrderStatusRequest
    ): Promise<UpdateOrderStatusResponse> => {
        if (isSumulated) {
            const order = mockOrders.find(o => o.id === orderId);
            if (!order) throw new Error('Order not found');
            order.status = data.status;
            order.updated_at = new Date().toISOString();
            return {
                message: 'Order status updated successfully',
                order: {
                    id: order.id,
                    status: order.status,
                    updated_at: order.updated_at
                }
            };
        }
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
        if (isSumulated) {
            const order = mockOrders.find(o => o.id === orderId);
            if (!order) throw new Error('Order not found');
            order.is_validated = true;
            return { message: 'Order validated successfully' };
        }
        const response = await api.post<{ message: string }>(`/supplier/orders/${orderId}/validate`);
        return response.data;
    },

    // Delete an order
    deleteOrder: async (orderId: number): Promise<{ message: string }> => {
        if (isSumulated) {
            const index = mockOrders.findIndex(o => o.id === orderId);
            if (index === -1) throw new Error('Order not found');
            mockOrders.splice(index, 1);
            return { message: 'Order deleted successfully' };
        }
        const response = await api.delete<{ message: string }>(`/supplier/orders/${orderId}`);
        return response.data;
    }
};

export default supplierOrdersService; 