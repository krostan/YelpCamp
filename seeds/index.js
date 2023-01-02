const mongoose = require("mongoose");
const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");
//正在查看的Campground模型 位於models目錄中
//但是我在一個單獨的目錄seeds中
//所以需要退出一個目錄 使用 ..
const Campground = require("../models/campground");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    autoIndex: true, //舊版為useCreateIndex:true
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!");
    console.log(err);
  });
//一個sample函數 當傳入array陣列時
//根據陣列長度做隨機亂數
//然後傳回array[隨機亂數]的值
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  /*const c = new Campground({ title: 'purple field' })
    await c.save();*/
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //你的會員帳號
      author: "636e50dd6a15088010be7e19", //只要不刪除我的這個帳號 所有帳號 都是我的
      location: `${cities[random1000].city} , ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, qui, deserunt unde beatae velit quisquam repudiandae animi aperiam saepe adipisci ratione aut nemo molestias quia illum assumenda consequuntur impedit vel?",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dmpihwhhz/image/upload/v1669992667/YelpCamp/t4gznagpu66hizjoeypk.jpg",
          filename: "YelpCamp/qnqxcywxwjtr5uyzgkj8",
        },
        {
          url: "https://res.cloudinary.com/dmpihwhhz/image/upload/v1669992666/YelpCamp/wjzgde8ozfuixn1a0nro.jpg",
          filename: "YelpCamp/xjintynddyst2f5vb6gb",
        },
      ],
    });
    await camp.save();
  }
};

//連繫完 結束
seedDB().then(() => {
  mongoose.connection.close();
});
