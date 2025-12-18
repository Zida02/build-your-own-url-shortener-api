/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration, authentication and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     UserForgotPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 * 
 *     UpdateUserProfile:
 *       type: object
 *       required: []
 *       properties:
 *         fullname:
 *           type: string
 *           example: "Emmanuel Olabisi"
 *         job:
 *           type: string
 *           example: "Software Developer"
 *         address:
 *           type: string
 *           example: "34 Ikoyi Road, Lagos"
 *         age:
 *           type: number
 *           example: 28
 *         phoneNumber:
 *           type: string
 *           example: "+2348012345678"
 *       example:
 *         fullname: "Emmanuel Olabisi"
 *         job: "Software Developer"
 *         address: "34 Ikoyi Road, Lagos"
 *         age: 28
 *         phoneNumber: "+2348012345678"
 * 
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     tags: [Authentication]
 *     summary: Send password reset link to user's email
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserForgotPassword'
 *     responses:
 *       200:
 *         description: Reset link sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/resetpassword/{resetToken}:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password using token
 *     parameters:
 *       - in: path
 *         name: resetToken
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */


/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     tags: [Authentication]
 *     summary: Update user profile details
 *     description: |
 *       Allows a logged-in user to update profile information.  
 *       Users **cannot update password or role** here.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateUserProfile'
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     tags: 
 *       - Authentication
 *     summary: Logout user account
 *     requestBody:
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       404:
 *         description: User not found
 */
