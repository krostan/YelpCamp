const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const multer = require('multer')
const { storage } = require('../cloudinary');//不需要打index 因為記住它的自動節點會自動在文件夾中查找index.js文件
//const upload = multer({ dest: 'uploads/' })//本地
const upload = multer({ storage });

const Campground = require('../models/campground');

//放置順序很重要
//new 一定要放在 ID之前
router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

//.post(upload.array('image'), (req, res) => {
//如果我們使用array 那些文件將被儲存在 req.files 
//所以molitor只需要解析表單數據
//它在尋找一種 image的東西
//它會將其視為文件 
//如果給它一個不同的名稱
//需要確保輸入的名稱 與表單上的name的名稱相同
//console.log(req.body, req.files);
//res.send('it worked')
//})

/*single 單個
[Object: null prototype] {
campground: [Object: null prototype] {
title: 'asd',
location: 'asd',
price: '12',
description: 'asdasd'
  }
} {
fieldname: 'image',
originalname: '15822025_p0_master1200.jpg',
encoding: '7bit',
mimetype: 'image/jpeg',
destination: 'uploads/',
filename: 'a5423070e0bf4dd5f3881493de50f673',
path: 'uploads\\a5423070e0bf4dd5f3881493de50f673',
size: 392985
}*/


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;












/*router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Date', 400);
    res.send(req.body.campground)
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    值組:campground[title]  campground[price] username password
    當值組只有compgroud
    使用const result = campgroundSchema.validate(req.body);
        console.log(result);
        則會顯示以下錯誤
    {
      value: { campground: 'sada' },
      error: [Error [ValidationError]: "campground" must be of type object ] {
        _original: { campground: 'sada' },
        details: [ [Object] ]
      }
    }
    
      當值組 都沒有
      則會顯示以下錯誤
      {
      value: {},
      error: [Error [ValidationError]: "campground" is required] {
        _original: {},
        details: [ [Object] ]
      }
    }
    
     
    ----------------------------------------------------------
    const result = campgroundSchema.validate(req.body);

    如果有一個結果錯誤
    會拋出這個錯誤 表達錯誤
    然後剪取並傳遞到 app.use((err, req, res, next)這個應用程序
    然後使用此錯誤程序
    if (result.error) {
        result.error.details 錯誤詳細訊息是一個array
        所以需要它把映射成一個字串 然後連接起來
        throw new ExpressError(result.error.details, 400);
    }

    console.log(result);
    ------------------------------------------------------------
    如下
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    -------------------------------------------------------

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))*/