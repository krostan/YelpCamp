const Review = require('../models/review');
const Campground = require('../models/campground');
const { model } = require('mongoose');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    /*{ $pull: { reviews: reviewId } }
    從array mongo中刪除 這是推薦的解決方案
    獲取此ID(reviewId)並從評論中提取出任何具有此ID(reviewId)的內容
    reviews 只是一個 ID陣列
    等pull找到camp 
    我們從reviews陣列中刪除對該評論的引用
    然後刪除整個評論*/
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}