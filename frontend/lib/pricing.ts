import { Product } from './types';

/**
 * Get the display price for a product
 * Returns promotional price if product is on promotion, otherwise returns original price
 */
export function getDisplayPrice(product: Product): number {
  return product.isOnPromotion && product.promotionalPrice !== undefined
    ? product.promotionalPrice
    : product.price;
}

/**
 * Calculate the discount percentage for a promotional product
 * Returns 0 if product is not on promotion
 */
export function getDiscountPercentage(product: Product): number {
  if (!product.isOnPromotion || !product.promotionalPrice) {
    return 0;
  }
  return Math.round(((product.price - product.promotionalPrice) / product.price) * 100);
}

/**
 * Calculate the savings amount for a promotional product
 * Returns 0 if product is not on promotion
 */
export function getSavingsAmount(product: Product): number {
  if (!product.isOnPromotion || !product.promotionalPrice) {
    return 0;
  }
  return product.price - product.promotionalPrice;
}
