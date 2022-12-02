mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    //center: [-74.5, 40],
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

/*我們做了個標記
設定它應該去的地方的經緯度
然後在該標記上設置彈出視窗
這是當用戶點擊時
應該發生的 */
new mapboxgl.Marker()
    //.setLngLat([-74.5, 40])
    .setLngLat(campground.geometry.coordinates)
    //這是彈出視窗 把它傳遞進來 最後把標記添加到地圖上
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
