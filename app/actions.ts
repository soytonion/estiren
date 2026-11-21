"use server";

import { BranchCode } from "../lib/branches";
import { CartItem, CheckoutInputCustomer } from "../lib/types";
import {
  getProductsWithStock,
  getFederatedProductStock,
  getBranchCustomers,
  processCheckoutOrder,
  transferInterbranchStock,
} from "../lib/services/products.service";
import { getCedisMetrics } from "../lib/services/cedis.service";

export async function fetchProductsWithStock(branch: BranchCode) {
  return await getProductsWithStock(branch);
}

export async function fetchFederatedStock(sku: string, branch: BranchCode) {
  return await getFederatedProductStock(sku, branch);
}

export async function fetchBranchCustomers(branch: BranchCode) {
  return await getBranchCustomers(branch);
}

export async function fetchCedisData() {
  return await getCedisMetrics();
}

export async function executeCheckoutOrder(
  branch: BranchCode,
  items: CartItem[],
  customer: CheckoutInputCustomer
) {
  return await processCheckoutOrder(branch, items, customer);
}

export async function executeStockTransfer(
  fromBranch: BranchCode,
  toBranch: BranchCode,
  sku: string,
  cantidad: number
) {
  return await transferInterbranchStock(fromBranch, toBranch, sku, cantidad);
}
