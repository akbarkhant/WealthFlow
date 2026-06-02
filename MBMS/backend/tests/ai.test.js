const request = require('supertest');
const app = require('../src/app');

describe('AI Routes', () => {

  it('Generate Insight', async () => {

    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'How can I save money?'
      });

    expect(res.statusCode).toBe(200);

  });

});