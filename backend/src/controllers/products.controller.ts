// backend/src/controllers/products.controller.ts
// All 8 product endpoints from Section 9.
// POS search must return results < 200ms (uses MongoDB text index).
// Prices in PKR as Numbers (no currency strings in DB).

import { Response, NextFunction } from 'express'
import mongoose, { UpdateQuery } from 'mongoose'
import { Product, Brand, Category } from '../models'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  SearchProductsQuery,
  BulkPriceUpdateInput
} from '../validators/product.validator'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/products
// Role: Cashier + Admin
// Supports: text search, brand filter, category filter,
//           minStock filter, pagination, sort
// ─────────────────────────────────────────────────────────────────────────
export async function listProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, brand, category, minStock, page, limit, sort, includeInactive } =
      req.query as unknown as ListProductsQuery

    // ── Build filter object ────────────────────────────────────────────
   const filter: Record<string, any> = {}


    // Only admins can see inactive products
    if (!includeInactive || req.user?.role !== 'admin') {
      filter.isActive = true
    }

    // Text search on name + sku
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() }
    }

    // Brand filter (validate ObjectId format first)
    if (brand && mongoose.Types.ObjectId.isValid(brand as string)) {
      filter.brand = new mongoose.Types.ObjectId(brand as string)
    }

    // Category filter
    if (category && mongoose.Types.ObjectId.isValid(category as string)) {
      filter.category = new mongoose.Types.ObjectId(category as string)
    }

    // Minimum stock filter
    if (minStock !== undefined && !isNaN(Number(minStock))) {
      filter.stockQty = { $gte: Number(minStock) }
    }

    // ── Build sort object ──────────────────────────────────────────────
    type SortOption = Record<string, 1 | -1 | { $meta: 'textScore' }>
    let sortOption: SortOption = { name: 1 }

    if (q && q.trim()) {
      // When searching, sort by text relevance score first
      sortOption = { score: { $meta: 'textScore' }, name: 1 }
    } else {
      switch (sort) {
        case 'price':
          sortOption = { salePrice: 1 }
          break
        case 'stock':
          sortOption = { stockQty: 1 }
          break
        case 'createdAt':
          sortOption = { createdAt: -1 }
          break
        default:
          sortOption = { name: 1 }
      }
    }

    // ── Pagination ─────────────────────────────────────────────────────
    const currentPage = Math.max(1, Number(page) || 1)
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 20))
    const skip = (currentPage - 1) * itemsPerPage

    // ── Execute queries in parallel ────────────────────────────────────
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate('brand', 'name slug')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      Product.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.status(200).json({
      success: true,
      message: `${products.length} product(s) retrieved successfully.`,
      data: {
        products,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/products/search?q=
// Role: Cashier + Admin — PRIMARY POS ENDPOINT
// Must return in < 200ms. Uses MongoDB text index.
// Returns only active, in-stock-aware results for the POS cart.
// ─────────────────────────────────────────────────────────────────────────
export async function searchProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, limit } = req.query as unknown as SearchProductsQuery

    if (!q || !q.trim()) {
      res.status(200).json({
        success: true,
        message: 'No search query provided.',
        data: { products: [] },
        error: null
      })
      return
    }

    const searchTerm = q.trim()
    const resultLimit = Math.min(Number(limit) || 10, 20)

    // ── Strategy: Try text search first, fall back to regex ───────────
    // Text index: blazing fast (< 50ms typically on local MongoDB)
    // Regex fallback: catches partial SKU matches the text index misses

    let products = await Product.find(
      {
        $text: { $search: searchTerm },
        isActive: true
      },
      // Project text score for sorting by relevance
      { score: { $meta: 'textScore' } }
    )
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .limit(resultLimit)
      .select('name sku salePrice purchasePrice stockQty brand category')
      .lean()

    // ── Fallback: regex search if text index returns no results ────────
    if (products.length === 0) {
      const regexPattern = new RegExp(
        searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      )
      products = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: regexPattern } },
          { sku: { $regex: regexPattern } }
        ]
      })
        .populate('brand', 'name')
        .populate('category', 'name')
        .limit(resultLimit)
        .select('name sku salePrice purchasePrice stockQty brand category')
        .lean()
    }

    res.status(200).json({
      success: true,
      message: `${products.length} product(s) found.`,
      data: { products, query: searchTerm },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/products/low-stock
// Role: Admin only
// Returns all active products where stockQty <= lowStockThreshold
// ─────────────────────────────────────────────────────────────────────────
export async function getLowStockProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stockQty', '$lowStockThreshold'] }
    })
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ stockQty: 1 }) // Most critical (lowest stock) first
      .select('name sku stockQty lowStockThreshold brand category salePrice')
      .lean()

    res.status(200).json({
      success: true,
      message: `${lowStockProducts.length} low-stock product(s) found.`,
      data: {
        products: lowStockProducts,
        count: lowStockProducts.length
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/products/:id
// Role: Cashier + Admin
// ─────────────────────────────────────────────────────────────────────────
export async function getProductById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID format.', 400)
    }

    const product = await Product.findById(id)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .populate('createdBy', 'name username')
      .lean()

    if (!product) {
      throw new AppError('Product not found.', 404)
    }

    if (!product.isActive) {
      throw new AppError('This product has been deactivated.', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: { product },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/products
// Role: Admin only
// Body validated by createProductSchema before reaching here.
// ─────────────────────────────────────────────────────────────────────────
export async function createProduct(
  req: AuthenticatedRequest & { body: CreateProductInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      name,
      sku,
      brand,
      category,
      description,
      purchasePrice,
      salePrice,
      stockQty,
      lowStockThreshold
    } = req.body

    // ── Validate brand exists ──────────────────────────────────────────
    const brandExists = await Brand.findById(brand).select('_id isActive')
    if (!brandExists || !brandExists.isActive) {
      throw new AppError(
        'The selected brand does not exist or has been deactivated.',
        400
      )
    }

    // ── Validate category exists ───────────────────────────────────────
    const categoryExists =
      await Category.findById(category).select('_id isActive')
    if (!categoryExists || !categoryExists.isActive) {
      throw new AppError(
        'The selected category does not exist or has been deactivated.',
        400
      )
    }

    // ── Check for duplicate SKU if manually provided ───────────────────
    if (sku) {
      const skuExists = await Product.findOne({ sku: sku.toUpperCase() })
      if (skuExists) {
        throw new AppError(
          `A product with SKU "${sku.toUpperCase()}" already exists.`,
          409
        )
      }
    }

    const product = await Product.create({
      name,
      sku: sku ? sku.toUpperCase() : undefined, // Pre-save hook generates if undefined
      brand,
      category,
      description: description ?? '',
      purchasePrice,
      salePrice,
      stockQty,
      lowStockThreshold: lowStockThreshold ?? 5,
      createdBy: req.user.userId
    })

    // Populate brand + category for the response
    await product.populate('brand', 'name slug')
    await product.populate('category', 'name slug')

    res.status(201).json({
      success: true,
      message: `Product "${product.name}" created successfully.`,
      data: { product },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/v1/products/:id
// Role: Admin only
// Partial update — only fields provided in body are changed.
// NOTE: Cashiers CANNOT change prices (enforced by requireAdmin on this route).
// ─────────────────────────────────────────────────────────────────────────
export async function updateProduct(
  req: AuthenticatedRequest & { body: UpdateProductInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID format.', 400)
    }

    const updateData = { ...req.body }

    // Uppercase SKU if provided
    if (updateData.sku) {
      updateData.sku = updateData.sku.toUpperCase()

      // Check SKU uniqueness (exclude current product)
      const skuConflict = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: id }
      })
      if (skuConflict) {
        throw new AppError(
          `Another product with SKU "${updateData.sku}" already exists.`,
          409
        )
      }
    }

    // Validate brand if being changed
    if (updateData.brand) {
      const brandExists = await Brand.findById(updateData.brand).select(
        '_id isActive'
      )
      if (!brandExists || !brandExists.isActive) {
        throw new AppError(
          'The selected brand does not exist or has been deactivated.',
          400
        )
      }
    }

    // Validate category if being changed
    if (updateData.category) {
      const categoryExists = await Category.findById(
        updateData.category
      ).select('_id isActive')
      if (!categoryExists || !categoryExists.isActive) {
        throw new AppError(
          'The selected category does not exist or has been deactivated.',
          400
        )
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('brand', 'name slug')
      .populate('category', 'name slug')

    if (!updatedProduct) {
      throw new AppError('Product not found.', 404)
    }

    res.status(200).json({
      success: true,
      message: `Product "${updatedProduct.name}" updated successfully.`,
      data: { product: updatedProduct },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/products/:id
// Role: Admin only
// SOFT DELETE — sets isActive: false. Product disappears from POS search.
// ─────────────────────────────────────────────────────────────────────────
export async function deleteProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID format.', 400)
    }

    const product = await Product.findById(id)

    if (!product) {
      throw new AppError('Product not found.', 404)
    }

    if (!product.isActive) {
      throw new AppError('This product is already deactivated.', 400)
    }

    product.isActive = false
    await product.save()

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" has been deactivated successfully. It will no longer appear in POS search.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/products/bulk-price
// Role: Admin only
// Bulk price adjustment — by brand, category, or all products.
// ─────────────────────────────────────────────────────────────────────────
export async function bulkPriceUpdate(
  req: AuthenticatedRequest & { body: BulkPriceUpdateInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      filterType,
      filterId,
      priceField,
      adjustmentType,
      adjustmentValue
    } = req.body

    // ── Build the filter ───────────────────────────────────────────────
     const filter: Record<string, any> = {}


    if (filterType === 'brand') {
      if (!filterId || !mongoose.Types.ObjectId.isValid(filterId)) {
        throw new AppError(
          'A valid brand ID is required for brand-based bulk update.',
          400
        )
      }
      filter.brand = new mongoose.Types.ObjectId(filterId)
    } else if (filterType === 'category') {
      if (!filterId || !mongoose.Types.ObjectId.isValid(filterId)) {
        throw new AppError(
          'A valid category ID is required for category-based bulk update.',
          400
        )
      }
      filter.category = new mongoose.Types.ObjectId(filterId)
    }
    // filterType === "all" → no extra filter, updates ALL active products

    // ── Count affected products before running ─────────────────────────
    const affectedCount = await Product.countDocuments(filter)

    if (affectedCount === 0) {
      throw new AppError(
        'No active products found matching the specified filter.',
        404
      )
    }

    // ── Build the update operation ─────────────────────────────────────
    let updateOperation: mongoose.UpdateQuery<typeof Product>

    if (adjustmentType === 'set_value') {
      updateOperation = { $set: { [priceField]: adjustmentValue } }
    } else if (adjustmentType === 'percentage_increase') {
      updateOperation = {
        $mul: { [priceField]: 1 + adjustmentValue / 100 }
      }
    } else {
      // percentage_decrease
      const decreaseFactor = Math.max(0, 1 - adjustmentValue / 100)
      updateOperation = { $mul: { [priceField]: decreaseFactor } }
    }

    await Product.updateMany(filter, updateOperation)

    // Round prices to avoid floating point issues after percentage update
    if (adjustmentType !== 'set_value') {
      await Product.updateMany(filter, [
        {
          $set: {
            [priceField]: { $round: [`$${priceField}`, 0] }
          }
        }
      ])
    }

    res.status(200).json({
      success: true,
      message: `Bulk price update applied to ${affectedCount} product(s) successfully.`,
      data: {
        affectedCount,
        priceField,
        adjustmentType,
        adjustmentValue
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}
