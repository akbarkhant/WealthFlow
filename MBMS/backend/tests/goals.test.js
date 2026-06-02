const request = require('supertest');
const app = require('../src/app')

describe('Goals', () => {

  it('Create Goal', async () => {

    const res = await request(app)
      .post('/api/goals')
      .send({
        name: 'Laptop',
        targetAmount: 100000
      });

    expect(res.statusCode).toBe(201);

  });

});