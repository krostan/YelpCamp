//評論有其專屬camp
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

/*body  如 'this is a great place!'
rating 如 評價 5顆星 */

module.exports = mongoose.model('Review', reviewSchema);
