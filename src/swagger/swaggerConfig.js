import swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authDocs = YAML.load(path.join(__dirname, 'auth.yaml'));
const goodsDocs = YAML.load(path.join(__dirname, 'goods.yaml'));
const ordersDocs = YAML.load(path.join(__dirname, 'order.yaml'));
const feedbacksDocs = YAML.load(path.join(__dirname, 'feedbacks.yaml'));
const categoriesDocs = YAML.load(path.join(__dirname, 'categories.yaml'));
const topRatedDocs = YAML.load(path.join(__dirname, 'top-rated.yaml'));
const usersDocs = YAML.load(path.join(__dirname, 'users.yaml'));
const subscriptionsDocs = YAML.load(path.join(__dirname, 'subscriptions.yaml'));

const swaggerDefinition = {
  openapi: '3.0.0',

  info: {
    title: 'Clothica API',
    version: '1.0.0',
    description: 'Документація REST API для інтернет-магазину Clothica.',

    license: {
      name: 'Ліцензія вільного програмного забезпечення',
      url: 'https://opensource.org/licenses/MIT',
    },
  },

  servers: [
    {
      url: 'http://localhost:3030/api/v1',
      description: 'Локальний сервер розробки',
    },
  ],

  tags: [
    { name: 'Auth', description: 'Авторизація та управління користувачами' },
    { name: 'Goods', description: 'Каталог товарів' },
    { name: 'Orders', description: 'Створення та управління замовленнями' },
    { name: 'Feedbacks', description: 'Відгуки покупців' },
    { name: 'Categories', description: 'Категорії товарів' },
    { name: 'Top Rated', description: 'Топові товари' },
    { name: 'Users', description: 'Особистий кабінет користувача' },
    { name: 'Subscriptions', description: 'Підписки та розсилки' },
  ],

  externalDocs: {
    description: 'Репозиторій проєкту',
    url: 'https://github.com/Veron0013/project-clothica-team-04-frontend',
  },

  paths: {
    ...authDocs.paths,
    ...goodsDocs.paths,
    ...ordersDocs.paths,
    ...feedbacksDocs.paths,
    ...categoriesDocs.paths,
    ...topRatedDocs.paths,
    ...usersDocs.paths,
    ...subscriptionsDocs.paths,
  },

  components: {
    schemas: {
      ...(authDocs.components?.schemas || {}),
      ...(goodsDocs.components?.schemas || {}),
      ...(ordersDocs.components?.schemas || {}),
      ...(feedbacksDocs.components?.schemas || {}),
      ...(categoriesDocs.components?.schemas || {}),
      ...(topRatedDocs.components?.schemas || {}),
      ...(usersDocs.components?.schemas || {}),
      ...(subscriptionsDocs.components?.schemas || {}),
    },
    securitySchemes: {
      ...(authDocs.components?.securitySchemes || {}),
      ...(goodsDocs.components?.securitySchemes || {}),
      ...(ordersDocs.components?.securitySchemes || {}),
      ...(feedbacksDocs.components?.securitySchemes || {}),
      ...(categoriesDocs.components?.securitySchemes || {}),
      ...(topRatedDocs.components?.securitySchemes || {}),
      ...(usersDocs.components?.securitySchemes || {}),
      ...(subscriptionsDocs.components?.securitySchemes || {}),
    },
  },
};

const swaggerConfig = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

export default swaggerConfig;
