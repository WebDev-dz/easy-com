import { api, getAuthHeaders } from "./api";
import { orderService } from "./orderService";
import productsService from "./products";
import UserOrdersService from "./supplierOrders";
import suppliersService from "./suppliers";
import { DashboardStats, DashboardStatsResponse } from "./types";

const dashboardService = {
  getStats: async (userId: number): Promise<DashboardStats> => {
    const data = await Promise.all([
      suppliersService.getSuppliersByUserId(userId),
      UserOrdersService.getUserOrders(userId),
    ]);

    const [suppliers, orders] = data;

    return {
      totalStores: suppliers?.length,
      totalOrders: orders?.length,
    };
  },
};

export default dashboardService;
