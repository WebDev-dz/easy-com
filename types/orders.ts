import { OrderStatus } from "@/services/supplierOrders"

export interface UserOrder {
  id: number
  user_id: number
  supplier_id: number
  wilaya_id: number
  commune_id: number
  full_name: string
  phone_number: string
  status: string
  order_date: string
  is_validated: boolean
  address: any
  created_at: string
  updated_at: string
  supplier: Supplier
  wilaya: Wilaya
  commune: Commune
  order_products: OrderProduct[]
  user: User
}

export interface Supplier {
  id: number
  user_id: number
  business_name: string
  address: string
  description: string
  picture?: string
  domain_id: number
  created_at: string
  updated_at: string
}

export interface Wilaya {
  id: number
  name: string
  code: string
  created_at: any
  updated_at: any
}

export interface Commune {
  id: number
  name: string
  wilaya_id: number
  created_at: any
  updated_at: any
}

export interface OrderProduct {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
  product: Product
}

export interface Product {
  id: number
  supplier_id: number
  category_id: number
  name: string
  price: string
  description: string
  visibility: string
  quantity: number
  minimum_quantity: number
  created_at: string
  updated_at: string
  pictures: Picture[]
}

export interface Picture {
  id: number
  product_id: number
  picture: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: number
  supplier_id: number
  wilaya_id: number
  commune_id: number
  full_name: string
  phone_number: string
  status: OrderStatus
  order_date: string
  is_validated: boolean
  address: any
  created_at: string
  updated_at: string
  user: User
  supplier: Supplier
  wilaya: Wilaya
  commune: Commune
  order_products: OrderProduct[]
}

export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string
  role: string
  picture: string
  address: string
  city: any
  email_verified_at: string
  created_at: string
  updated_at: string
}

