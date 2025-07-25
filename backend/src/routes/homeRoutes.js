const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/categories', homeController.getCategories);
router.get('/category/:category', homeController.getProductsByCategory);
router.get('/product/:id', homeController.getProductById);
router.get('/', homeController.home);

 module.exports = router;