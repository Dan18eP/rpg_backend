const { Router } = require('express');
const router = Router();

const {
    simularBatalla
} = require('../controllers/batallas.controller.js');

// Endpoint de batalla
router.post('/', simularBatalla);

module.exports = router;