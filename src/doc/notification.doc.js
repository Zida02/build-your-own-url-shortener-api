/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: User Notification management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnreadNotification:
 */

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     tags: [Notification]
 *     summary: Get a user's unread notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *          description: Unread Notification  Returned 
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/read:
 *   get:
 *     tags: [Notification]
 *     summary: Get a user's read notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *          description:  Read  Notification Returned 
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /api/notifications/count:
 *   get:
 *     tags: [Notification]
 *     summary: Get total notifications count for a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification count returned
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/delete:
 *   delete:
 *     tags: [Notification]
 *     summary: Delete all notifications for a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/{NotificationId}:
 *   put:
 *     tags: [Notification]
 *     summary: Update a notification as Read or Unread
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: NotificationId
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated as Read or Unread
 *       401:
 *         description: Unauthorized
 */

