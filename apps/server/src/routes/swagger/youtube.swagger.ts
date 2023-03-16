/**
 * @swagger
 *  /api/youtube/content/{videoId}:
 *      get:
 *          tags: [Youtube]
 *          summary: Get information of given YouTube content URL
 *          parameters:
 *            - in: path
 *              name: videoId
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *              200:
 *                  description: Success
 */

/**
 * @swagger
 *  /api/youtube/video/download/{videoId}:
 *      get:
 *          tags: [Youtube]
 *          summary: download youtube video as mp3
 *          parameters:
 *            - in: path
 *              name: videoId
 *              required: true
 *              schema:
 *                type: string
 *            - in: query
 *              name: isHighQuality
 *              required: true
 *              schema:
 *                type: boolean
 *          responses:
 *              200:
 *                  description: success
 *
 */

/**
 * @swagger
 *  /api/youtube/audio/download/{videoId}:
 *      get:
 *          tags: [Youtube]
 *          summary: download youtube video as mp3
 *          parameters:
 *            - in: path
 *              name: videoId
 *              required: true
 *              schema:
 *                type: string
 *            - in: query
 *              name: isHighQuality
 *              required: true
 *              schema:
 *                type: boolean
 *          responses:
 *              200:
 *                  description: success
 *
 */

/**
 * @swagger
 *  /api/youtube/playlist/{playlistId}:
 *      get:
 *          tags: [Youtube]
 *          summary: get youtube playlist info
 *          parameters:
 *            - in: path
 *              name: playlistId
 *              description: the id of youtube playlist(it comes after list=)
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *              200:
 *                  description: success
 *
 */

/**
 * @swagger
 *  /api/youtube/playlist/audio/download/{playlistId}:
 *      get:
 *          tags: [Youtube]
 *          summary: get youtube playlist info
 *          parameters:
 *              - in: path
 *                name: playlistId
 *                required: true
 *                description: the id of youtube playlist(it comes after list=)
 *                schema:
 *                  type: string
 *              - in: query
 *                name: isHighQuality
 *                required: true
 *                schema:
 *                  type: boolean
 *              - in: query
 *                name: albumName
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: success
 *
 */

/**
 * @swagger
 *  /api/youtube/playlist/video/download/{playlistId}:
 *      get:
 *          tags: [Youtube]
 *          summary: get youtube playlist info
 *          parameters:
 *              - in: path
 *                name: playlistId
 *                required: true
 *                description: the id of youtube playlist(it comes after list=)
 *                schema:
 *                  type: string
 *              - in: query
 *                name: isHighQuality
 *                required: true
 *                schema:
 *                  type: boolean
 *              - in: query
 *                name: albumName
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: success
 *
 */
