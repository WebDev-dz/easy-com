import { ProductImage } from "@/hooks/image-uploader";
import { ImagePickerAsset } from "expo-image-picker";

export interface RegisterRequest {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export interface User {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    picture: string | null;
    address: string | null;
    city: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface RegisterResponse {
    user: User;
    token: string;
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    access_token: string;
    token_type: string;
}

export interface UpdateProfileRequest {
    full_name?: string;
    email?: string;
    phone_number?: string;
    picture?: File | ImagePickerAsset;
    address?: string;
    city?: string;
}

export interface UpdateProfileResponse {
    user: User;
    message: string;
}

export interface UpdatePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface UpdatePasswordResponse {
    message: string;
}

export interface ErrorResponse {
    message?: string;
    error?: string;
    [key: string]: any;
}

// Category Types
export interface Category {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface CategoriesResponse {
    data: Category[];
    message: string;
}

export interface CategoryResponse {
    data: Category;
    message: string;
}

// Wilaya and Commmuns

export interface Wilaya {
    id: number,
    name: string
}

export interface Commune {
    id: number,
    name: string
}

export type WilayasResponse = Wilaya[]
export type CommunesResponse = Commune[]


// Domain Types
export interface Domain {
    id: number;
    name: string;
}

export interface DomainsResponse {
    message: string;
    data: Domain[];
}

// Order Types
export interface OrderProduct {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    product: {
        id: number;
        supplier_id: number;
        category_id: number;
        name: string;
        price: string;
        description: string;
        visibility: string;
        quantity: number;
        minimum_quantity: number;
        created_at: string;
        updated_at: string;
        pictures: {
            id: number;
            product_id: number;
            picture: string;
            created_at: string;
            updated_at: string;
        }[];
    };
}

export interface CartOrder {
    id: number;
    user_id: number;
    supplier_id: number;
    wilaya_id: number;
    commune_id: number;
    full_name: string;
    phone_number: string;
    address: string;
    status: string;
    order_date: string;
    is_validated: boolean;
    created_at: string;
    updated_at: string;
    order_products: OrderProduct[];
}

export interface CartResponse {
    message: string;
    data: CartOrder[];
}

// Request Types
export interface BuyNowRequest {
    product_id: number;
    quantity: number;
    full_name: string;
    phone_number: string;
    wilaya_id: number;
    commune_id: number;
    address?: string;
}

export interface AddToCartRequest {
    product_id: number;
    quantity: number;
}

export interface ValidateCartRequest {
    full_name: string;
    phone_number: string;
    wilaya_id: number;
    commune_id: number;
    address?: string;
}

export interface UpdateCartRequest {
    product_id: number;
    quantity: number;
}

export interface RemoveFromCartRequest {
    order_id?: number;
}

// Response Types
export interface OrderResponse {
    message: string;
    order_id: number;
}

export interface ValidateCartResponse {
    message: string;
    order_ids: number[];
}

export interface UpdateCartResponse {
    message: string;
    order_id: number;
}

export interface RemoveFromCartResponse {
    message: string;
}

export interface ClearCartResponse {
    message: string;
}

// Supplier Order Types
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
    status: 'pending' | 'processing' | 'delivered';
    is_validated: boolean;
    created_at: string;
    updated_at: string;
    order_products: SupplierOrderProduct[];
}

export interface UpdateOrderStatusRequest {
    status: "processing" | "delivered" | "cancelled"
                                           
}

export interface UpdateOrderStatusResponse {
    message: string;
    order: {
        id: number;
        status: string;
        updated_at: string;
    };
}

// Product Types
export interface ProductPicture {
    id: number;
    product_id: number;
    picture: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    supplier_id: number;
    category_id: number | null;
    name: string;
    price: number;
    description: string | null;
    visibility: string;
    quantity: number;
    minimum_quantity: number;
    created_at: string;
    updated_at: string;
    pictures: ProductPicture[];
}

export interface ProductWithSupplier extends Product {
    supplier: Supplier
}

export interface CreateProductRequest {
    supplier_id: number;
    name: string;
    price: number;
    quantity: number;
    minimum_quantity: number;
    description?: string;
    category_id?: number;
    pictures?: File[] | ImagePickerAsset[]
    visibility: "public" | "private";
}

export interface UpdateProductRequest {
    supplier_id?: number;
    name?: string;
    price?: number;
    quantity?: number;
    minimum_quantity?: number;
    description?: string;
    category_id?: number;
    pictures?: File[];
    images_to_delete?: number[];
}

export interface ProductResponse {
    message: string;
    data: Product | ProductWithSupplier;
}

export interface ProductsResponse {
    data: Product[];
}

// Search Types
export interface SearchResultProduct {
    id: number;
    supplier_id: number;
    name: string;
    description: string;
    category_id: number;
    price: number;
    quantity: number;
    minimum_quantity: number;
}

export interface SearchResult {
    id: number;
    product_id: number;
    picture: string;
    product: SearchResultProduct;
}

export interface SearchResponse {
    message: string;
    data: SearchResult[];
}

export interface SearchByIdRequest {
    id: number;
}

// Service Provider Portfolio Types
export interface ProjectPicture {
    id: number;
    project_id: number;
    picture: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: number;
    service_provider_id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    pictures: ProjectPicture[];
}

export interface CreateProjectRequest {
    title: string;
    description?: string;
    pictures?: File[];
    service_provider_id?: number;
}

export interface UpdateProjectRequest {
    title?: string;
    description?: string;
    pictures?: File[];
}

export interface ProjectResponse {
    message: string;
    data: Project;
}

// Supplier Types
export interface SupplierUser {
    id: number;
    full_name: string;
    email: string;
}

export interface SupplierDomain {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface SupplierType {
    id: number;
    supplier_id: number;
}

export interface Supplier {
    id: number;
    user_id: number;
    business_name: string;
    address: string;
    description: string;
    picture: string | null;
    domain_id: number;
    created_at: string;
    updated_at: string;
    user: SupplierUser;
    domain: SupplierDomain;
    workshop: SupplierType | null;
    importer: SupplierType | null;
    merchant: SupplierType | null;
    type: 'workshop' | 'importer' | 'merchant' | 'none';
}

export interface CreateSupplierRequest {
    user_id: number;
    business_name: string;
    description: string;
    address: string;
    domain_id: number;
    type: 'workshop' | 'importer' | 'merchant';
    picture?: File | ProductImage;
}

export interface UpdateSupplierRequest {
    business_name?: string;
    description?: string;
    address?: string;
    domain_id?: number;
    type?: 'workshop' | 'importer' | 'merchant';
    picture?: File;
}

export interface SupplierResponse {
    message: string;
    data: Supplier;
}

export interface SuppliersResponse {
    data: Supplier[];
}

export interface SupplierProductsResponse {
    message: string;
    data: {
        id: number;
        name: string;
        price: number;
        supplier_id: number;
        created_at: string;
        updated_at: string;
        pictures: {
            id: number;
            product_id: number;
            picture: string;
        }[];
    }[];
}

export interface UserResponse {
    user: User;
    message: string;
}

export interface UpdateUserRequest {
    full_name?: string;
    email?: string;
    phone_number?: string;
    picture?: File;
    address?: string;
    city?: string;
}

export interface ServiceOrderUser {
    id: number;
    full_name: string;
}

export interface ServiceProviderUser {
    full_name: string;
}

export interface ServiceProvider {
    id: number;
    user_id: number;
    user: ServiceProviderUser;
}

export interface Skill {
    id: number;
    name: string;
}

export interface ServiceOrder {
    id: number;
    user_id: number;
    service_provider_id: number;
    skill_id: number;
    title: string;
    description: string;
    deadline: string;
    total_amount: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    user: ServiceOrderUser;
    service_provider: ServiceProvider;
    skill: Skill;
}

export interface ServiceOrdersResponse {
    data: ServiceOrder[];
}

export interface Store {
    id: number;
    business_name: string;
    type: string;
    description: string;
    picture?: string;
    status: 'active' | 'inactive';
    supplier_id: number;
    domain: {
        id: number;
        name: string;
    };
}

export interface Review {
    id: number;
    user_id: number;
    supplier_id: number;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        picture?: string;
    };
}

export interface SupplierReviewsResponse {
    reviews: unknown[];
   data: { reviews: Review[];
    total_rating: number;
    average_rating: number;
    review_count: number;}
} 