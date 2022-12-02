//一個camp 有很多個評論
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Review = require('./review')
const User = require('./user');

const ImageSchema = new Schema({
    url: String,
    filename: String
});
//為縮圖屬性 定義一個虛擬的圖像模式
//想做一個 virtual property 這樣就可以訪問縮圖 它只是一個修改版本的現有訊息 這個 this.url
ImageSchema.virtual('thumbanil').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    price: Number,
    description: String,
    location: String,
    //ref選項 告訴 mongoose 在填充過程中 使用哪個模型
    //它只是ID 如果要拿取作者 則需要進行填充  
    //在route中的campgrounds的show
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)
//如果正在使用 JSON.parse()，並且想避免意外的標記錯誤，只需從 popUpMarkup 虛擬屬性的 href 定義中刪除雙引號
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href=/campgrounds/${this._id}>${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`//使用substring 截成一小段文字 如0~20個字串
});

//獲取刪除的文檔
//post
//實際上我們可以訪問剛剛被刪除的文檔
/*
doc 的內容
{
  reviews: [],
  _id: new ObjectId("635bab0775450d807bec960d"),
  title: 'cat party camp',
  image: 'https://images.unsplash.com/photo-1505489304219-85ce17010209?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  description: '  asdasdasgdfbxc fasfa ssaasda a asdasd asd  ',
  location: 'Kyoto',
  __v: 0,
  price: 20
}
 */
// mongoose pre post中間件
//在pre中間件內部 我們無法訪問被刪除的campground
//pre在post中間件中的查詢之前運行
//現在刪除的campground是空的
//但是所有的ID 都在reviews arrays陣列中 並且刪除其中的每一個
//所以只需要重寫POST中間件

/*如果有評論 他們將在該陣列中(reviews)
然後我們根據特定的對象ID進行刪除

取reviews陣列中的所有評論
取所有的ID
並刪除具有該匹配ID的所有評論

findOneAndDelete 是 查詢中間件
如果它找到一個文檔並將其刪除
它會將該文檔傳遞給函數*/
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    //因不想只刪除一個 所以不會使用 findByIdAndDelete
    //也不會刪除或查找一個 只會執行一般刪除操作
    //可以在其中傳遞評論 可以在查詢中傳遞評論 或是我會說出每個評論的ID

    /*此doc 包含評論 將刪除所有評論 
    這些評論(_id)位於doc.reviews陣列中  刪除的doc中 */

    /*被警告 remove已停用
    Warning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
    (Use `node --trace-warnings ...` to show where the warning was created)
    故改用 deleteMany */

    if (doc) {
        await Review.deleteMany({
            //remove 這個_id 如果它在 doc.reviews陣列中 
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)