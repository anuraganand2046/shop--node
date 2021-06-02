const mongoose= require('mongoose');
const Schema= mongoose.Schema;//mongoose provide this schema.
const productSchema= new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});//a new schema.
module.exports= mongoose.model('Product', productSchema);















// const mongodb= require('mongodb');
// const getDb= require('../util/database').getDb;
// module.exports= class Product{
//     constructor(title, imageUrl, price, description, id, userId){
//         this.title= title;
//         this.imageUrl= imageUrl;
//         this.price= price;
//         this.description=description;
//         this._id= (id)?new mongodb.ObjectID(id):null;
//         this.userId= userId;
//         //this._id definition is a fault here as even if we don't pass an id the new element will define an id whatsoever.So we use an if condition to check if there is actually an id.
//     }
//     save(){
//         const db= getDb();
//         let dbOp;
//         if(this._id){
//             //we need to update the product but it is already in the shop.
//             dbOp= db.collection('products').updateOne({_id: this._id}, {$set: this});//just to update the product and not insert a new one.
//         }
//         else{
//             //we need to add it to the shop.
//             dbOp= db.collection('products').insertOne(this);
//         }
//         return dbOp
//         .then(result=>{
//             console.log(result);
//         })
//         .catch(err=>{console.log(err)});
//     }
//     static fetchAll(){
//         const db= getDb();
//         return db.collection('products').find()
//         .toArray()
//         .then(products=>{
//             console.log(products);
//             return products;
//         })
//         .catch(err=>{console.log(err)});
//     }
//     static findById(prodId){
//         const db= getDb();
//         return db.collection('products').find({_id: new mongodb.ObjectID(prodId)}).next()
//         .then(products=>{
//             console.log(products);
//             return products;
//         })
//         .catch(err=>{console.log(err)});
//     }
//     static deleteById(prodId){
//         const db= getDb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectID(prodId)})
//         .then(products=>{
//             console.log('Deleted');
//         })
//         .catch(err=>{console.log(err)});
//     }
// }