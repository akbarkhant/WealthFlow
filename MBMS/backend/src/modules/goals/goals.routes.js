// goals.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./goals.controller');
const { authenticate } = require('../../middleware/authorize.middleware'); // adjust to your auth middleware path

router.use(authenticate);

router.get('/',              ctrl.list);
router.get('/:id',           ctrl.getOne);
router.post('/',             ctrl.create);
router.post('/:id/contribute', ctrl.contribute);
router.patch('/:id',         ctrl.update);
router.delete('/:id',        ctrl.remove);

module.exports = router;