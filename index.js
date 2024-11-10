const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = 3000;

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Carros',
        version: '1.0.0',
        description: 'API para gerenciar dados de carros.',
    },
    servers: [
        {
            url: `http://localhost:${port}`,
            description: 'Servidor local',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

const carMap = new Map();
//const dataMap = new Map();

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - id
 *         - imageUrl
 *         - year
 *         - name
 *         - licence
 *         - place
 *       properties:
 *         id:
 *           type: string
 *           description: ID do carro
 *         imageUrl:
 *           type: string
 *           description: URL da imagem do carro
 *         year:
 *           type: string
 *           description: Ano do carro no formato '2020/2020'
 *         name:
 *           type: string
 *           description: Nome do carro
 *         licence:
 *           type: string
 *           description: Placa do carro
 *         place:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               description: Latitude do local
 *             long:
 *               type: number
 *               description: Longitude do local
 *       example:
 *         id: "001"
 *         imageUrl: "https://image"
 *         year: "2020/2020"
 *         name: "Gaspar"
 *         licence: "ABC-1234"
 *         place:
 *           lat: 0
 *           long: 0
 */

/**
 * @swagger
 * /car:
 *   post:
 *     summary: Adiciona um novo carro ou uma lista de carros
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Car'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Carro(s) adicionado(s) com sucesso
 *       400:
 *         description: Erro de validação nos dados fornecidos
 */
app.post('/car', (req, res) => {
    console.log("POST /car");
    const body = req.body;

    // Verifica se body é um array ou um único objeto
    if (Array.isArray(body)) {
        // Se for um array, percorre os itens e adiciona ao carMap
        const addedCars = [];
        const errors = [];

        for (const car of body) {
            const id = car.id;
            if (carMap.has(id)) {
                errors.push({ id, error: 'ID já existe' });
            } else {
                carMap.set(id, car);
                addedCars.push(car);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        return res.status(201).json(addedCars);
    } else {
        // Se for um único objeto, processa como antes
        const id = body.id;
        if (carMap.has(id)) {
            return res.status(400).json({ error: 'ID já existe' });
        }
        carMap.set(id, body);
        return res.status(201).json(body);
    }
});

/**
 * @swagger
 * /car:
 *   get:
 *     summary: Retorna a lista de todos os carros
 *     responses:
 *       200:
 *         description: Lista de carros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */
app.get('/car', (req, res) => {
    console.log("GET /car")
    const car = Array.from(carMap, ([id, value]) => ({ id, value }));
    res.json(car);
});


/**
 * @swagger
 * /car/{id}:
 *   get:
 *     summary: Retorna os dados de um carro específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do carro
 *     responses:
 *       200:
 *         description: Dados do carro retornados com sucesso
 *       404:
 *         description: Carro não encontrado
 */
app.get('/car/:id', (req, res) => {
    const id = req.params.id;
    console.log(`GET /car/${id}`)
    if (carMap.has(id)) {
        res.json({ id, value: carMap.get(id) });
    } else {
        res.status(404).json({ error: 'Item não encontrado' });
    }
});

/**
 * @swagger
 * /car/{id}:
 *   patch:
 *     summary: Atualiza os dados de um carro específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do carro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Carro atualizado com sucesso
 *       400:
 *         description: Erro de validação nos dados fornecidos
 *       404:
 *         description: Carro não encontrado
 */
app.patch('/car/:id', (req, res) => {
    var body = req.body;
    const id = req.params.id;
    console.log(`PATCH /car/${id}`)
    if (carMap.has(id)) {
        carMap.set(id, body);
        res.status(201).json(body);
    } else {
        res.status(404).json({ error: 'Item não encontrado' });
    }
});

/**
 * @swagger
 * /car/{id}:
 *   delete:
 *     summary: Remove um carro específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do carro
 *     responses:
 *       200:
 *         description: Carro deletado com sucesso
 *       404:
 *         description: Carro não encontrado
 */
app.delete('/car/:id', (req, res) => {
    const id = req.params.id;
    console.log(`DELETE /car/${id}`)
    if (carMap.has(id)) {
        carMap.delete(id);
        res.json({ message: 'Item deletado com sucesso' });
    } else {
        res.status(404).json({ error: 'Item não encontrado' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
