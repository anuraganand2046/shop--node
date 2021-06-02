const express= require('express');
const router= express.Router();
const shopController= require('../controllers/shop');
const isAuth= require('../middleware/is-auth');
router.get('/products', shopController.getProducts);
router.get('/', shopController.getIndex);
router.get('/products/:productId', shopController.getProduct);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/checkout', isAuth, shopController.getCheckout);//all checking done by this function
router.get('/checkout/success', shopController.getCheckoutSuccess);
router.get('/checkout/cancel', shopController.getCheckout);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);
module.exports= router;



//isAuth checks whether the user is logged in or not and correspondingly changes the appearance and properties of the ejs pages.