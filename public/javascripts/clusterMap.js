mapboxgl.accessToken = mapToken;
//形成一個通用的地圖
const map = new mapboxgl.Map({
    container: 'cluster-map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-103.5917, 40.6699],//座標 經緯度
    zoom: 3//放大所小比例
});


map.addControl(new mapboxgl.NavigationControl());
//console.log(campgrounds)

map.on('load', () => {
    //console.log('MAP LOADED!!!')
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    //像是為地圖註冊一個數據源 然後再添加這些不同的圖層時 引用它
    map.addLayer({
        id: 'clusters',
        type: 'circle',//添加一個名位circle的層
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#dda15e',//低於10 紅色
                10,
                '#9c6644',//高於10 低於30 橘色
                30,
                '#bc6c25'//高於30 黃色 
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,//任何低於10個露營地 將是20像素
                20,
                30,//任何高於10 低於30個露營地 將是30像素
                25//任何高於30個露營地 將是40像素
            ]
        }
    });

    //集群記數
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',//文本字段將只顯示縮寫的點記數
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    //放大到最大的單一個點
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],//過濾器 當沒有點記數時 希望顯示它 顯示這個圖
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    //當點擊一個聚集點時的邏輯 它會調用地圖 獲取營地getSource('campgrounds') 然後得到聚集擴展縮放(getClusterExpansionZoom)
    //當點擊一個集群時 它會放大你的地圖
    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                //一個方法 easeTo 可以改變easeTo的中心
                //無論點擊哪一個集群 它都會成為新的中心
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom//縮放級別
                });
            }
        );
    });

    // When a click event occurs on a feature in 當點擊事件發生在一個非聚集點的特徵上
    // the unclustered-point layer, open a popup at 在功能的位置打開一個窗口
    // the location of the featur, with 其中包含來自其屬性的HTML描述
    // description HTML from its properties.
    //所以當點擊一個最詳細(地圖上放大最大的小點)的點時 這個函數就被調用了
    map.on('click', 'unclustered-point', (e) => {
        //console.log("UNCLUSTERED POINT CLICKED!!")
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    //滑鼠進入事件 
    //當進入時 不僅僅是在地圖上
    //而是當你滑鼠進入一個聚集點時
    //我們只是把光標樣式改為指針
    map.on('mouseenter', 'clusters', () => {
        //console.log("MOUSING OVER A CLUSTER!!")
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});