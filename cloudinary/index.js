const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//將帳戶與此cloudinary 相關聯
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp', //名稱
        allowedFormats: ['jpeg', 'png', 'jpg']//指定允許的格式allowedFormats
    }
});


module.exports = {
    cloudinary,
    storage
}


