const path= require('path');
const fs= require('fs');
// const stripe= require('stripe')('sk_test_51IskMdSJPcVIURXi9lHciUGkqwqOwMIQLu4GZb7LVXCIf7WdW2BfU9h1BWWhg7a8I6ErpTxJKlJp2Q14aCrQfriX00x16ueAVb');
const stripe= require('stripe')(process.env.STRIPE_KEY);//->environment variable required.
const Product= require('../models/product');
const PDFDocument= require('pdfkit');//we tend to make a pdf as soon as a user demands an invoice.That is we don't use hard coded files.
const Order= require('../models/order');
const ITEMS_PER_PAGE=2;
exports.getProducts= (req, res, next)=>{
    let totalItems;
    const page= +req.query.page || 1;//query because we need to get the query parameter.And page because in the pagination link we set the page number as the variable changing when we change the page number.
    Product.find().countDocuments()
    .then(numProducts=>{
        totalItems=numProducts;
        return Product.find()
        .skip((page-1)*ITEMS_PER_PAGE)//this skips x number of items from front.
        .limit(ITEMS_PER_PAGE)//this sets the number of pages we see on a page.
        .then((products)=>{
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: page*ITEMS_PER_PAGE < totalItems,
                hasPreviousPage: page>1,
                nextPage: page+1,
                previousPage: page-1,
                lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            })
        })
    })
    .catch(err=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.getIndex= (req, res, next)=>{
    let totalItems;
    const page= +req.query.page || 1;//query because we need to get the query parameter.And page because in the pagination link we set the page number as the variable changing when we change the page number.
    Product.find().countDocuments()
    .then(numProducts=>{
        totalItems=numProducts;
        return Product.find()
        .skip((page-1)*ITEMS_PER_PAGE)//this skips x number of items from front.
        .limit(ITEMS_PER_PAGE)//this sets the number of pages we see on a page.
        .then((products)=>{
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: page*ITEMS_PER_PAGE < totalItems,
                hasPreviousPage: page>1,
                nextPage: page+1,
                previousPage: page-1,
                lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            })
        })
    })
    .catch(err=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.getCart= (req, res, next)=>{
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user=>{
        const products= user.cart.items;
        res.render('shop/cart',{
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err=> {
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.postCart=(req, res, next)=>{
    const prodId= req.body.productId;
    Product.findById(prodId).then(product=>{
        req.user.addToCart(product);
        res.redirect('/cart');
    }).then(result=>{console.log(result); res.redirect('/cart');});
}
exports.getCheckout= (req, res, next)=>{
    let products, total;
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user=>{
        products= user.cart.items;
        total=0;
        products.forEach(p=>{
            total= total+p.productId.price*p.quantity;
        })
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],//means we accept payments in card.
            line_items: products.map(p=>{
                return{
                    name: p.productId.title,
                    description: p.productId.description,
                    amount: p.productId.price*100,
                    currency: 'usd',
                    quantity: p.quantity
                    //stripe requires all these information prior to payments
                };
            }),
            success_url: req.protocol+ '://'+req.get('host')+ '/checkout/success',//get(host) gives the link where app is running(localhost/deployed site).
            cancel_url: req.protocol+ '://'+req.get('host')+ '/checkout/cancel',
            //we are redirected by the stripe to above two urls depending upon whether we succeeded or the payment was canceled.
        })
    })
    .then(session=>{
        res.render('shop/checkout',{
            path: '/checkout',
            pageTitle: 'Checkout',
            products: products,
            isAuthenticated: req.session.isLoggedIn,
            sessionId: session.id,//session has an id property.
            totalSum: total
        })
    })
    .catch(err=> {
    const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.getCheckoutSuccess= (req, res, next)=>{
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user=>{
    const products= user.cart.items.map(i=>{
        return {quantity: i.quantity, product: {...i.productId._doc}}
    });
    const order= new Order({
        user:{
            email: req.user.email,
            userId: req.user
        },
        products: products
    });
    return order.save();
    })
    .then(result=>{
        return req.user.clearCart();
    })
    .then(()=>{
        res.redirect('/orders');
    })
    .catch(err=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
};
exports.postOrder= (req, res, next)=>{
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user=>{
    const products= user.cart.items.map(i=>{
        return {quantity: i.quantity, product: {...i.productId._doc}}
    });
    const order= new Order({
        user:{
            email: req.user.email,
            userId: req.user
        },
        products: products
    });
    return order.save();
    })
    .then(result=>{
        return req.user.clearCart();
    })
    .then(()=>{
        res.redirect('/orders');
    })
    .catch(err=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
};
exports.getOrders= (req, res, next)=>{
    Order.find({'user.userId': req.user._id})
    .then(orders=>{
        res.render('shop/orders', {
            path:'/orders',
            pageTitle: 'Your Orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.getProduct= (req, res, next)=>{
    const prodId= req.params.productId;
    Product.findById(prodId).then((product)=>{
        console.log(product);
        res.render('shop/product-detail', 
        {product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
    });
    }).catch((err)=>{
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.postCartDeleteProduct= (req, res, next)=>{
    const prodId= req.body.productId;
    req.user.removeFromCart(prodId)//removeFromCart -> a method of user field which we defined using mongoose.
    .then(result=>{
        res.redirect('/cart');
    })
    .catch(err=> {
        const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
}
exports.getInvoice= (req, res, next)=>{
    const orderId= req.params.orderId;
    Order.findById(orderId)
    .then(order=>{
        if(!order){
            return next(new Error('No Order found!'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'));
        }
        const invoiceName= 'invoice-'+orderId+'.pdf';
        const invoicePath= path.join('data', 'invoices', invoiceName);
        const pdfDoc= new PDFDocument();//new pdf generated.
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename= "'+invoiceName+'"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));//makes it writable.
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        let totalPrice=0;
        pdfDoc.fontSize(14).text('--------------------------');
        order.products.forEach(prod=>{
            totalPrice= totalPrice+prod.quantity*prod.product.price;
            pdfDoc.text(prod.product.title+ ' - '+ prod.quantity+ ' x '+ '              Rs ' + prod.quantity*prod.product.price);
        })
        pdfDoc.text('-----------------------');
        pdfDoc.text('Total Price'+ ' = ' + totalPrice);
        pdfDoc.end();//this ends any further changes in pdfDoc.
        // fs.readFile(invoicePath, (err, data)=>{
        //     if(err){
        //         return next(err);
        //     }
        //     console.log(orderId);
        //     res.send(data);
        //     //this code lets u download the file named data.
        // });

        // const file= fs.createReadStream(invoicePath);
        // file.pipe(res);//this way the browser does not downloads entire file system but does it in chunks.
    })
    .catch(err=> next(err));
};