/**
 * Created by b509 on 2017/7/18.
 */
var map;
var toolBar;
var points;//轨迹路径


function initialize() {
    map = new AMap.Map("container", {
        view: new AMap.View2D({ //创建地图二维视口
            center: [104.758545, 31.474781], //创建中心点坐标
            zoom: 5, //设置地图缩放级别
            rotation: 0, //设置地图旋转角度
            resizeEnable: true
        }),
        lang: "zh_cn" //设置地图语言类型，默认：中文简体
    }); //创建地图实例

    //加载标尺
    map.plugin(["AMap.Scale"], function() {
        var scale = new AMap.Scale();
        map.addControl(scale);
    });

    //加载鹰眼
    map.plugin(["AMap.OverView"], function() {
        var view = new AMap.OverView({
            visible: true
        });
        view.open(); //初始化的时候就展开鹰眼

        map.addControl(view);
    });

    map.plugin(["AMap.ToolBar"], function() {
        toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
    });

    //加载地图类型切换插件
    map.plugin(["AMap.MapType"], function() {
        //地图类型切换
        var mapType = new AMap.MapType({
            defaultType: 0, //默认显示画布地图
            showRoad: true //叠加路网图层
        });
        map.addControl(mapType);
    });
}

//初始化数据
function initData(){
    points=null;
}

var pts="[\"104.715902,31.445707\",\"104.717709,31.445734\",\"104.718844,31.443558\",\"104.720086,31.441657\",]";
//加载轨迹路径

function newLoadPath()
{
    map.clearMap(); //每次加载路线时,清除地图上所有覆盖物,防止覆盖物重复
    initData();
    points = jsonConvertToMapLngLat(pts); //把json字符串坐标点转换成高德经纬度坐标
    map.zoom=18;
    drawStartAndEndICO(); //绘制起点和终点图标
    //绘制轨迹
    var polyline = new AMap.Polyline({
        map: map,
        path: points,
        strokeColor: "#3898f9",//线颜色
        strokeOpacity: 1,//线透明度
        strokeWeight: 4,//线宽
        strokeDasharray:[10,5],
        position:true,
        strokeStyle: "solid"//线样式

    });

//	setMarkerIcon(icon);
    map.setFitView();
    //播放过的轨迹路径设置为红色
    marker.on('moving',function(e){
        passedPolyline.setPath(points.slice(0,playIndex).concat(e.passedPath));
        //map.setFitView();
    });

    marker.on('moveend',function(){
        progress++;
        window.external.Progress = progress;
        map.panTo(points[progress]);
    });
    map.panTo(points[progress]);
}

//根据后台发送的json坐标字符 转换成高度经纬度对象
function jsonConvertToMapLngLat(json)
{
    map.zoom=18;
    if (json === "[]")
    {
        return;
    }

    //json数组转换一组坐标点
    if (json.indexOf('[') > -1 && json.indexOf(']') > -1 )
    {
        var temparray = eval(json);

        var points = new Array();

        for (var i = 0; i < temparray.length; i++)
        {
            var obj = temparray[i];
            if (obj.hasOwnProperty('X') && obj.hasOwnProperty('Y'))
                points[i] = new AMap.LngLat(temparray[i].X, temparray[i].Y);
            else{
                var arr=new Array();
                arr=obj.split(",");
                points[i] = new AMap.LngLat(arr[0],arr[1]);
            }
        }
        return points;
    }
    else
    {
        if (json === "{}")
        {
            return;
        }

        // json转单个坐标点
        var pt = eval("(" + json + ")");
        if (pt.hasOwnProperty('X') && pt.hasOwnProperty('Y'))
            var point = new AMap.LngLat(pt.X, pt.Y);
        else{
            var arr=new Array();
            arr=pt.split(",");
            var point = new AMap.LngLat(arr[0], arr[1]);
        }
        return point;
    }
}

function drawStartAndEndICO()
{
    var start_xy = points[0];
    var end_xy = points[points.length - 1];
    var way_xy = new Array();
    var waymarker = new Array();


    for (var i=0;i<points.length-2;i++){
        way_xy[i] = points[i+1];
    }

    //起点、终点图标
    var sicon = new AMap.Icon({
        image: "http://cache.amap.com/lbs/static/jsdemo002.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });

    var startmarker = new AMap.Marker({
        icon: sicon, //复杂图标
        visible: true,
        position: start_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });

    var eicon = new AMap.Icon({
        image: "http://cache.amap.com/lbs/static/jsdemo002.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });

    var endmarker = new AMap.Marker({
        icon: eicon, //复杂图标
        visible: true,
        position: end_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });

    for(var i=0;i<way_xy.length;i++){
        waymarker[i] = new AMap.Marker({
            map: map,
            position: way_xy[i],
            icon: new AMap.Icon({
                size: new AMap.Size(40, 50),  //图标大小
                image: "http://webapi.amap.com/theme/v1.3/images/newpc/way_btn2.png",
                imageOffset: new AMap.Pixel(0, -60)
            })
        });
    }
    map.setFitView();

    addclick();

    function addclick() {
        AMap.event.addListener(startmarker, 'click', function() {
            infoWindow.open(map, startmarker.getPosition());
        });

        AMap.event.addListener(endmarker, 'click', function() {
            infoWindow.open(map, endmarker.getPosition());
        });

        for(var j=0;j<waymarker.length;j++){
            AMap.event.addListener(waymarker[j],'click',(function (j) {
                return function () {
                    infoWindow.open(map, waymarker[j].getPosition());
                }
            })(j))
        };
    }

    var title = '车牌号:  <span style="font-size:13px;color:#2d2d2e;">鲁A12138</span>',
        content = [];
    content.push("时间：2017-7-18 09:12:48");
    content.push("速度：37.04（km/h）(0.0)");
    content.push("温度：A 9.0/B 未接（0.0/0.0）");
    content.push("司机：12345678900");
    content.push("状态：定位 总里程54005.64km");
    content.push("地址：");
    var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: createInfoWindow(title, content.join("<br/>")),
        offset: new AMap.Pixel(16, -45)
    });

    function createInfoWindow(title, content) {
        var info = document.createElement("div");
        info.className = "info";

        //可以通过下面的方式修改自定义窗体的宽高
        //info.style.width = "400px";
        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = title;
        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow;

        top.appendChild(titleD);
        top.appendChild(closeX);
        info.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        middle.innerHTML = content;
        info.appendChild(middle);

        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '0 auto';
        var sharp = document.createElement("img");
        sharp.src = "http://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
    }

    //关闭信息窗体
    function closeInfoWindow() {
        map.clearInfoWindow();
    }


}

