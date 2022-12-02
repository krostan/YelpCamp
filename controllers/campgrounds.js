//控制
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
//初始化一個新的Mapbox地理編碼實例來傳遞它 將傳入accessToken
//這裡包含了兩個方法 我們需要正向和反向地理編碼 我們只需要一個正向地理編碼
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');



module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Date', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;//得到(經度 , 緯度)
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));//從file中 取出路徑path 和檔案名稱filename
    campground.author = req.user._id;//將使用者的ID添加到campground中的author
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.showCampground = async (req, res) => {
    //透過populate來填充 reviews 和author
    //這樣就能給予 評論 和 作者 的全部訊息
    const campground = await Campground.findById(req.params.id).populate({
        //填充所有評論
        //在填充每個評論中的每一個author
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;//取得ID
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    //因為放在campground裡
    //所以取出時 應 req.body.campground
    const { id } = req.params;//取得ID
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    //req.files.map(f => ({ url: f.path, filename: f.filename })) 該文件狀態 會成為一個array
    //因此我們不希望將整個陣列推送到現有陣列上
    //所以只需要把它變成一個陣列
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);//spread操作
    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            //在cloudinary中 有一個方法destroy  輸入filename 它會刪除那個特定的file
            await cloudinary.uploader.destroy(filename);
        }

        //從圖像array中取出所有圖像  其中該圖像的filename 在req.body.deleteImages arrays中
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campgrounds!');
    res.redirect(`/campgrounds/${campground._id}`);//眺轉頁面
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;//取得ID
    //findByIdAndDelete 此函數 可以觸發 findOneAndDelete()這個中間件
    //但是如果使用了其他方式 如remove() 或者是deleteMany() 
    //則不會觸發 findOneAndDelete()這個中間件
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}