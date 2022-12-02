const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');


/*定義一個joi字串的擴展 名為escapeHTML */
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        //轉義HTML
        escapeHTML: {
            //需要有一個名為validate的函數
            //Joi會自動調用它 無論它收到甚麼值
            validate(value, helpers) {
                //使用sanitize-Html的包
                const clean = sanitizeHtml(value, {
                    //標記允許的屬性
                    allowedTags: [],
                    allowedAttributes: {},
                });
                //檢查傳入的輸入 和經過處理的輸出之間是否有差異
                //如果有差異 意味著有東西被拿走了 
                //就返回helpers.error('string.escapeHTML', { value })
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})