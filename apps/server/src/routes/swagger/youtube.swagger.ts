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
 *          downloadVideo:
 *              type:
 *                  object
 *              required:
 *                  - link
 *                  - isHighQuality
 *              properties:
 *                  link:
 *                      type: string
 *                      description: YouTube content link
 *                  isHighQuality:
 *                      type: boolean
 *                      description: download high quality or low quality
 *          downloadPlaylist:
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
 *                      enum: [zip , mp3]
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
 *  /api/youtube/video/:
 *      post:
 *          tags: [Youtube]
 *          summary: download youtube video as mp3
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/downloadVideo'
 *          responses:
 *              200:
 *                  description: success
 *
 */

/**
 * @swagger
 *  /api/youtube/playlist/:
 *      post:
 *          tags: [Youtube]
 *          summary: download youtube playlist as a zip or mp3
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/downloadPlaylist'
 *          responses:
 *              200:
 *                  description: success
 *
 */
