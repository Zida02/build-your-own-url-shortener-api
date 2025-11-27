/**
 * @swagger
 * components:
 *   schemas:
 *     UrlInput:
 *       type: object
 *       required:
 *         - originalUrl
 *       properties:
 *         originalUrl:
 *           type: string
 *           format: uri
 *           description: The original URL to shorten
 *           example: "https://example.com/page"
 *         alias:
 *           type: string
 *           description: Custom alias for the shortened link
 *           example: "my-custom-link"
 *         linkType:
 *           type: string
 *           enum: [public, private, protected]
 *           default: public
 *           description: Defines the visibility/security of the link
 *         setExpiry:
 *           type: string
 *           format: date-time
 *           description: Optional expiry date for the URL
 *           example: "2025-12-31T23:59:59Z"
 *         password:
 *           type: string
 *           description: Password for protected links
 */


/**
 * @swagger
 * /api/url/create:
 *   post:
 *     tags: [URL]
 *     summary: Create a shortened URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UrlInput'
 *     responses:
 *       201:
 *         description: Short URL created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/url/urlClicks:
 *   get:
 *     tags: [URL]
 *     summary: Get all URLs created by the user with click statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URLs with click counts returned
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/url/{alias}:
 *   get:
 *     tags: [URL]
 *     summary: Redirect to the original URL using an alias
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         description: The short alias
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 *       404:
 *         description: Alias not found
 */


/**
 * @swagger
 * /api/url/list/allclicks:
 *   get:
 *     tags: [URL]
 *     summary: List all URLs and their total clicks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List returned
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/url/delete/{alias}:
 *   delete:
 *     tags: [URL]
 *     summary: Delete a shortened URL by alias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         description: Alias of the URL to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: URL not found
 */
