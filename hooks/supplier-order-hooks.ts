import { useMutation, useQuery } from "@tanstack/react-query";
import supplierOrdersService from '../services/supplierOrders';
import { UpdateOrderStatusRequest } from '../services/types';
import { useAuth } from '@/hooks/useAuth';
import { toastAlert } from '@/lib/toastAlert';
import UserOrdersService from "../services/supplierOrders";

export const useGetUserOrders = () => {
    return useMutation({
        mutationFn: supplierOrdersService.getUserOrders,
        onSuccess: () => {
            toastAlert.success('Orders fetched successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch orders: ' + error.message);
        }
    });
};

export const useGetUserOrder = () => {
    return useMutation({
        mutationFn: UserOrdersService.getOrderById,
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch orders: ' + error.message);
        }
    });
};

export const useGetRecievedSupplierOrders = () => {
    return useMutation({
        mutationFn: (storeId: number) => supplierOrdersService.getRecievedOrders(storeId),
        onSuccess: () => {
            toastAlert.success('Received orders fetched successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch received orders: ' + error.message);
        }
    });
};

export const useGetSupplierOrder = () => {
    return useMutation({
        mutationFn: supplierOrdersService.getOrderById,
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch order: ' + error.message);
        }
    });
};

export const useUpdateSupplierOrderStatus = () => {
    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: UpdateOrderStatusRequest }) =>
            supplierOrdersService.updateOrderStatus(orderId, status as any),
        onSuccess: () => {
            toastAlert.success('Order status updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update order status: ' + error.message);
        }
    });
};

export const useValidateSupplierOrder = () => {
    return useMutation({
        mutationFn: supplierOrdersService.validateOrder,
        onSuccess: () => {
            toastAlert.success('Order validated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to validate order: ' + error.message);
        }
    });
};

export const useDeleteSupplierOrder = () => {
    return useMutation({
        mutationFn: supplierOrdersService.deleteOrder,
        onSuccess: () => {
            toastAlert.success('Order deleted successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to delete order: ' + error.message);
        }
    });
}; 