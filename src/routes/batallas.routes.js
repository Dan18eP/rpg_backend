const { Router } = require('express');
const router = Router();

const {
    simularBatalla,
    listarBatallas,
    obtenerBatallaPorId} = require('../controllers/batallas.controller.js');

// Endpoint de batalla
router.post('/', simularBatalla);

router.get('/resultados/:id', obtenerBatallaPorId);

router.get('/resultados', listarBatallas);



module.exports = router;