import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content downloader API documentation',
      version: '1.0.0',
      description: 'The complete documentation for all routes',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Mohammadreza jafari',
        url: 'https://github.com/dayeezus',
        email: 'mohamamdrezajafari.dev@gmailc.om',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};

export const swaggerSpecs = swaggerJSDoc(options);
