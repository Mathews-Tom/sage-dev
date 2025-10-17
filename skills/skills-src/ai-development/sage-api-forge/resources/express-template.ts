// Express + TypeScript Resource Template
// Replace {Resource}, {resource}, {resources} with actual names

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ==================== TYPES & VALIDATION ====================

export const {Resource}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const {Resource}CreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
});

export const {Resource}UpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export type {Resource} = z.infer<typeof {Resource}Schema>;
export type {Resource}Create = z.infer<typeof {Resource}CreateSchema>;
export type {Resource}Update = z.infer<typeof {Resource}UpdateSchema>;

// ==================== SERVICE ====================

export class {Resource}Service {
  /**
   * Create a new {resource}
   * @throws Error if creation fails
   */
  async create(data: {Resource}Create): Promise<{Resource}> {
    // TODO: Implement database insertion
    throw new Error('Database layer not configured');
  }

  /**
   * Get {resource} by ID
   * @returns {Resource} or null if not found
   */
  async getById(id: string): Promise<{Resource} | null> {
    // TODO: Implement database query
    throw new Error('Database layer not configured');
  }

  /**
   * List {resources} with pagination
   */
  async list(skip: number = 0, limit: number = 100): Promise<{Resource}[]> {
    // TODO: Implement database query with pagination
    throw new Error('Database layer not configured');
  }

  /**
   * Update {resource}
   * @returns Updated {resource} or null if not found
   */
  async update(id: string, data: {Resource}Update): Promise<{Resource} | null> {
    // TODO: Implement database update
    throw new Error('Database layer not configured');
  }

  /**
   * Delete {resource}
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    // TODO: Implement database deletion
    throw new Error('Database layer not configured');
  }
}

// ==================== MIDDLEWARE ====================

/**
 * Validation middleware factory
 */
function validate<T>(schema: z.ZodSchema<T>, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}

// ==================== CONTROLLER ====================

export class {Resource}Controller {
  constructor(private service: {Resource}Service) {}

  /**
   * Create {resource} handler
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {Resource}CreateSchema.parse(req.body);
      const {resource} = await this.service.create(data);
      res.status(201).json({resource});
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get {resource} by ID handler
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {resource} = await this.service.getById(id);

      if (!{resource}) {
        res.status(404).json({
          error: 'Not found',
          message: `{Resource} with ID ${id} not found`,
        });
        return;
      }

      res.json({resource});
    } catch (error) {
      next(error);
    }
  };

  /**
   * List {resources} handler
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

      const {resources} = await this.service.list(skip, limit);
      res.json({
        {resources},
        pagination: { skip, limit, total: {resources}.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update {resource} handler
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = {Resource}UpdateSchema.parse(req.body);
      const {resource} = await this.service.update(id, data);

      if (!{resource}) {
        res.status(404).json({
          error: 'Not found',
          message: `{Resource} with ID ${id} not found`,
        });
        return;
      }

      res.json({resource});
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete {resource} handler
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not found',
          message: `{Resource} with ID ${id} not found`,
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

// ==================== ROUTES ====================

export function create{Resource}Router(): Router {
  const router = Router();
  const service = new {Resource}Service();
  const controller = new {Resource}Controller(service);

  /**
   * @swagger
   * /api/v1/{resources}:
   *   post:
   *     summary: Create a new {resource}
   *     tags: [{Resources}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: {Resource} created successfully
   *       400:
   *         description: Validation error
   */
  router.post(
    '/api/v1/{resources}',
    validate({Resource}CreateSchema),
    controller.create
  );

  /**
   * @swagger
   * /api/v1/{resources}/{id}:
   *   get:
   *     summary: Get {resource} by ID
   *     tags: [{Resources}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: {Resource} found
   *       404:
   *         description: {Resource} not found
   */
  router.get('/api/v1/{resources}/:id', controller.getById);

  /**
   * @swagger
   * /api/v1/{resources}:
   *   get:
   *     summary: List {resources}
   *     tags: [{Resources}]
   *     parameters:
   *       - in: query
   *         name: skip
   *         schema:
   *           type: integer
   *           default: 0
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *           maximum: 1000
   *     responses:
   *       200:
   *         description: List of {resources}
   */
  router.get('/api/v1/{resources}', controller.list);

  /**
   * @swagger
   * /api/v1/{resources}/{id}:
   *   put:
   *     summary: Update {resource}
   *     tags: [{Resources}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: {Resource} updated
   *       404:
   *         description: {Resource} not found
   */
  router.put(
    '/api/v1/{resources}/:id',
    validate({Resource}UpdateSchema),
    controller.update
  );

  /**
   * @swagger
   * /api/v1/{resources}/{id}:
   *   delete:
   *     summary: Delete {resource}
   *     tags: [{Resources}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: {Resource} deleted
   *       404:
   *         description: {Resource} not found
   */
  router.delete('/api/v1/{resources}/:id', controller.delete);

  return router;
}
