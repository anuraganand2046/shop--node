const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const userSchema= new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    cart:{
        items: [{productId:
            {type: Schema.Types.ObjectId, ref: 'Product', required: true}
            ,quantity: {type: Number, required: true}}] //how will an element of the array will look like.
    }
});
userSchema.methods.addToCart= function(product){
    const cartProductIndex= this.cart.items.findIndex(cp=>{
                return cp.productId.toString()=== product._id.toString();
            })
            let newQuantity= 1;
            const updatedCartItems= [...this.cart.items];
            //checking if the index we got is >=0.If yes then this product was already added to the cart.
            if(cartProductIndex>=0){
                newQuantity= this.cart.items[cartProductIndex].quantity+1;
                updatedCartItems[cartProductIndex].quantity=newQuantity;//either update quantity of an existing cart item.
            }
            else{
                updatedCartItems.push({productId: product._id, quantity:newQuantity});//or push a new item into the cart.
            }
            const updatedCart= {items: updatedCartItems};//we add quantity field to cart and hence updated it.
            this.cart= updatedCart;
            return this.save();
}
userSchema.methods.removeFromCart= function(productId){
    const updatedCartItems= this.cart.items.filter(item=>{
            return item.productId.toString() !== productId.toString();
    });
    this.cart.items= updatedCartItems;
    return this.save();
}
userSchema.methods.clearCart= function(){
    this.cart= {items: []};
    return this.save();
}
module.exports= mongoose.model('User', userSchema);
















// const getDb= require('../util/database').getDb;
// const mongodb= require('mongodb');
// const ObjectId= mongodb.ObjectId;
// class User{
//     constructor(username, email, cart, id){
//         this.name= username;
//         this.email=email;
//         this.cart= cart;//{items: []}=> this parameter can have the field we desire.Js allows to make data structures as we desire.So we can now assume that cart is an array and have items field inside it.
//         this._id= id;
//     }
//     save(){
//         const db=getDb();
//         return db.collection('users').insertOne(this);
//     }
//     addToCart(product){
//         const cartProductIndex= this.cart.items.findIndex(cp=>{
//             return cp.productId.toString()=== product._id.toString();
//         })
//         let newQuantity= 1;
//         const updatedCartItems= [...this.cart.items];
//         //checking if the index we got is >=0.If yes then this product was already added to the cart.
//         if(cartProductIndex>=0){
//             newQuantity= this.cart.items[cartProductIndex].quantity+1;
//             updatedCartItems[cartProductIndex].quantity=newQuantity;//either update quantity of an existing cart item.
//         }
//         else{
//             updatedCartItems.push({productId: new ObjectId(product._id), quantity:newQuantity});//or push a new item into the cart.
//         }
//         const updatedCart= {items: updatedCartItems};//we add quantity field to cart and hence updated it.
//         const db= getDb();
//         return db.collection('users').updateOne({_id: new ObjectId(this._id)}, {$set: {cart: updatedCart}})//this overwrites the previous cart with updated cart.
//     }
//     getCart(){
//         const db= getDb();
//         const productIds= this.cart.items.map(item=>{
//             return item.productId;
//         })
//         return db.collection('products').find({_id: {$in: productIds}}).toArray() //returning db is important as it ensures that product is available.
//         .then(products=>{
//             return products.map(p=>{
//                 return {...p, quantity: this.cart.items.find(i=>{
//                     return i.productId.toString()===p._id.toString();//here the id was already passed to products array.Then we just mapped through all ids and matched these ides for their quantity.
//                 }).quantity}
//             })
//         })
//         .catch();
//     }
//     deleteItemFromCart(productId){//we pass id of item to be deleted.
//         const updatedCartItems= this.cart.items.filter(item=>{
//             return item.productId.toString() !== productId.toString();
//         });
//         const db= getDb();
//         return db.collection('users')
//         .updateOne({_id: new ObjectId(this._id)}, 
//         {$set: {cart: {items: updatedCartItems}}})
//     }
//     addOrder(){
//         const db= getDb();
//         return this.getCart().then(products=>{
//             const order={
//                 items: products,
//                 user:{
//                     _id: new ObjectId(this._id),
//                     name: this.name,
//                     email: this.email
//                 }
//             }
//             return db.collection('orders').insertOne(order);
//         })
//         .then(result=>{
//             this.cart= {items: []};//once our cart has become our oder we clear the cart and insert the objects array into orders database.
//             return db.collection('users').updateOne({_id: new ObjectId(this._id)}, {$set: {cart: {items: []}}});//this is clearing the database.
//         })
//     }
//     getOrders(){
//         const db=getDb();
//         return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
//         //this way we compare the orders whose user id matches with current user's id.
//     }
//     static findById(userId){
//         const db= getDb();
//         return db.collection('users').findOne({_id: new ObjectId(userId)})
//         .then(user=>{
//             console.log(user);
//             return user;
//         })
//         .catch(err=>console.log(err));
//         //next() id used ensures that we gate only the element that matters to us as we get a cursor.
//     }
// }
// module.exports= User;