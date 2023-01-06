//process.env.NODE_ENV 是一個環境變量
//通常只是開發或生產環境
//我們一直在開發模式下運行
//但在最終部屬時
//我們將在生產模式下運行代碼

//我們是否再開發模式下運行
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const campgroundRoutes = require("./route/campgrounds");
const reviewRoutes = require("./route/reviews");
const userRoutes = require("./route/users");

const MongoDBStore = require("connect-mongo");

//const dbUrl = process.env.DB_URL //mongo DB Atlas
// const dbUrl = "mongodb://localhost:27017/yelp-camp"; //本地
//上面兩者的資料庫不相同

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"; //此行只會連接mongo DB Atlas
mongoose.set("strictQuery", false);
mongoose
  .connect(dbUrl, {
    autoIndex: true, //舊版為useCreateIndex:true
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!");
    console.log(err);
  });
/*const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});*/

const app = express();
// 對所有EJS模板使用 EJS-LOCALS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//告訴express 使用該中間件
//表示URL編碼是甚麼 然後傳入一個擴展選項
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public"))); //需要確保告訴快遞服務我們的公共目錄
app.use(mongoSanitize()); //避免當使用者透過輸入$ 來使用mongo DB的語法 避免類似SQL注入攻擊

/*Both allowDots and replaceWith
app.use(
  mongoSanitize({
    allowDots: true,
    replaceWith: '_',
  }),
);*/
const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("asdasdasd", e);
});

const sessionConfig = {
  store, //或者store:store
  name: "session",
  secret,
  resave: false,
  saveUninitialized: false,
  /*基本上就是說我們的cookie 
    至少是通過session所設置的cookie 
    只能通過HTTP訪問
    不能通過JavaScript訪問*/
  cookie: {
    httpOnly: true,
    /*httpOnly: true,
        secure:true,這實際上會立即破壞系統
        依照程式碼 
        這個cookie應該只在https上工作
        所以https是安全的      
        但本地主機 localhost 不是https 不安全*/
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //毫秒 秒 分鐘 小時 天  計算出一周時間 此為一周後過期
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

/*正在限制可以獲取資源的位置
只是包含 bootstrapcdn mapbox fontawesome cdn
作為希望應用程序能從中獲取腳本的位置*/

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  //"https://stackpath.bootstrapcdn.com/",

  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  //配置helmet
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dmpihwhhz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

/*在本例中 我們需要指定為我們自動添加的身分驗證方法
它不需要寫這個 也不需要寫如何序列化和序列化一個用戶
基本上就是如何儲存它和 在session中儲存它 */

//護照 希望使用已下載並要求的本地策略(localStorage)
//對於該本地策略 身分驗證方法將位於我們的用戶模型中 稱為身分驗證(authenticate)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

/*這是我們在用戶模型中指定的兩種方法
它們也已自動為我們添加 */
//告訴護照如何序列化(serialize)用戶
//序列化基本上是指如何獲取數據 或者是如何在session中儲存用戶
passport.serializeUser(User.serializeUser());
//如何讓用戶退出session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //console.log(req.query);

  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  res.locals.currentUser = req.user; //currentUser當前用戶
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "cat@gmail.com", username: "cat" });
  const newUser = await User.register(user, "bear");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

//對每個請求建立一個應用程序
//對於每個路徑 將在此處調用此回調
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found ", 404));
});

app.use((err, req, res, next) => {
  //const { statusCode = 500, message = 'Something went wrong' } = err;
  //為了更新err對象 從err中提取了一個變量 並為該變量指定了一個默認值
  //所以應該改為
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";

  //res.status(statusCode).send(message);
  res.status(statusCode).render("error", { err });
  //res.send('OH NO ~~~')
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

/*
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
    await camp.save();
    res.send(camp);
})
*/

/*app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

//因為放在campground裡
//所以取出時 應 req.body.campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;//取得ID
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);//眺轉頁面
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;//取得ID
    //findByIdAndDelete 此函數 可以觸發 findOneAndDelete()這個中間件
    //但是如果使用了其他方式 如remove() 或者是deleteMany() 
    //則不會觸發 findOneAndDelete()這個中間件
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
})) */
