/**
 * @swagger
 *  components:
 *      schemas:
 *          getInfo:
 *              type: object
 *              required:
 *                  -   link
 *              properties:
 *                  link:
 *                      type: string
 *                      description: YouTube content link
 *          downloadContent:
 *              type:
 *                  object
 *              required:
 *                  - link
 *                  - isHighQuality
 *                  - format
 *              properties:
 *                  link:
 *                      type: string
 *                      description: YouTube content link
 *                  isHighQuality:
 *                      type: boolean
 *                      description: download high quality or low quality
 *                  format:
 *                      type: string
 *                      enum: [mp3 , zip]
 *                      description: the format to download
 */

/**
 * @swagger
 *  /api/youtube/:
 *      post:
 *          tags: [Youtube]
 *          summary: get information of given youtube content url
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/getInfo'
 *          responses:
 *              200:
 *                  description: success
 */

/**
 * @swagger
 *  /api/youtube/download/:
 *      post:
 *          tags: [Youtube]
 *          summary: download youtube content
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/downloadContent'
 *          responses:
 *              200:
 *                  description: success
 *
 */
