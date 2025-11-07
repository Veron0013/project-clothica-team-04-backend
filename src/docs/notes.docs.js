/**
 * @openapi
 * tags:
 *   - name: Notes
 *     description: Операції з нотатками користувача
 */

/**
 * @openapi
 * /notes:
 *   get:
 *     summary: Отримати всі нотатки користувача
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер сторінки
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Кількість нотаток на сторінці
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Пошук у назві або тексті
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           enum: [Work, Personal, Meeting, Shopping, Ideas, Travel, Finance, Health, Important, Todo]
 *         description: Фільтр за тегом
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: "_id"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Успішне отримання списку нотаток
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 perPage:
 *                   type: integer
 *                 totalNotes:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 */

/**
 * @openapi
 * /notes/{noteId}:
 *   get:
 *     summary: Отримати нотатку за ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ідентифікатор нотатки
 *     responses:
 *       200:
 *         description: Успішне отримання нотатки
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Нотатку не знайдено
 */

/**
 * @openapi
 * /notes:
 *   post:
 *     summary: Створити нову нотатку
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "План на день"
 *               content:
 *                 type: string
 *                 example: "Купити продукти, зробити дзвінок"
 *               tag:
 *                 type: string
 *                 enum: [Work, Personal, Meeting, Shopping, Ideas, Travel, Finance, Health, Important, Todo]
 *                 example: "Todo"
 *     responses:
 *       201:
 *         description: Нотатку створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 */

/**
 * @openapi
 * /notes/{noteId}:
 *   patch:
 *     summary: Оновити нотатку
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tag:
 *                 type: string
 *                 enum: [Work, Personal, Meeting, Shopping, Ideas, Travel, Finance, Health, Important, Todo]
 *     responses:
 *       200:
 *         description: Нотатку оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Нотатку не знайдено
 */

/**
 * @openapi
 * /notes/{noteId}:
 *   delete:
 *     summary: Видалити нотатку
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Нотатку видалено
 *       404:
 *         description: Нотатку не знайдено
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "6740c0e5a5d6b5a10c76a345"
 *         title:
 *           type: string
 *           example: "План на тиждень"
 *         content:
 *           type: string
 *           example: "Купити продукти, здати проєкт"
 *         tag:
 *           type: string
 *           enum: [Work, Personal, Meeting, Shopping, Ideas, Travel, Finance, Health, Important, Todo]
 *           example: "Work"
 *         userId:
 *           type: string
 *           example: "673f99b2d6a3cd145e21d12f"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

