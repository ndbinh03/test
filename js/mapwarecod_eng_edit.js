/*
Author: TienPT, BinhND
Created Date: 1/11/2016
Modified Date: 10/12/2017
*/
//Khai báo các biến toàn cục
var map;
var layers = [];
var typeLayers = [];
var iconLegends = {};
var nameLegends = {};
var fileSources = {};
var bounds = {};
var numLayers;
var menus, latCenter, lngCenter, zoom;
var infoWindow;//Biến toàn cục hiển thị thông tin khi click trên đối tượng
//Cấp phát đối tượng ImageOverlay
ImageOverlay.prototype = new google.maps.OverlayView();
//Viết một đối tượng hiển thị ảnh như một lớp DEM
/** @Hàm khởi dựng */
function ImageOverlay(bounds, image, map) {

  // Các thuộc tính khởi tạo.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;

  // Dịnh nghĩa một thuộc tính để giữ ảnh trong thẻ div. We'll
  // Chúng ta sẽ tạo thẻ div này trên phương thức onAdd() vì vậy vậy bâu giờ chúng ta thiết lập null
  this.div_ = null;

  // gọi setMap để gắn lớp overlay này.
  this.setMap(map);
}

/**
 * onAdd được gọi khi các khung của bản đồ đã sẵn sàng và lớp overlay đã được add tới map
 */
ImageOverlay.prototype.onAdd = function() {

  var div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  // Tạo phần tử img và gắn nó vào div này.
  var img = document.createElement('img');
  img.src = this.image_;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.position = 'absolute';
  div.appendChild(img);

  this.div_ = div;

  //Add phần tử này tới khung của lớp overlay.
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
};

ImageOverlay.prototype.draw = function() {
  // Chúng ta sử dụng toạ độ tây nam (south-west) và đông bắc (north-east) của lớp overlay để chốt đúng vị trí và kích thước
  // coordinates of the overlay to peg it to the correct position and size.
  // Để làm điều này, chúng ta cần lấy lại phép chiếu từ lớp overlay này.
  var overlayProjection = this.getProjection();

  // Lấy toạ độ tây nam và đông bắc của lớp ovelay này
  // Từ toạ độ và convert tới toạ độ pixel.
  // Chúng ta sẽ sử dụng các toạ độ này để rezive thẻ div.
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

  // Resize thẻ div của ảnh để vừa với kích thước chỉ định.
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
};

// phương thức onRemove() sẽ được gọi tự động từ API nếu
// nếu chúng ta từng thiết lập thuộc tính map của lớp overlay là 'null'.
ImageOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};
// Thiết lập ẩn hoặc hiện với ImageOverlay 'hidden' hoặc 'visible'.
ImageOverlay.prototype.hide = function() {
  if (this.div_) {
    //Sử dụng thuộc tính visibility.
    this.div_.style.visibility = 'hidden';
  }
};

ImageOverlay.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = 'visible';
  }
};

ImageOverlay.prototype.toggle = function() {
   if (this.div_) {
        if (this.div_.style.visibility === 'hidden') {
            this.show();
        } else {
            this.hide();
        }
    }
};

function initialize() {
   //Đọc thiết lập menu từ file XML
    //Tạo menu cha
    downloadUrl("./data/xml/menu_eng.xml", function(data) {
       var xml = data.responseXML;
        menus = xml.documentElement.getElementsByTagName("Menu");
        for (var j = 0; j < menus.length; j++) {
           var ten = menus[j].getAttribute("Ten");
           $('#menu').append('<a href="#" onclick="chonLuuVuc('+j+')">'+ ten + '</a>');
        }
    });
    if(!latCenter && !lngCenter)
    {
       latCenter = 16.39887;
       lngCenter = 107.940893;
       zoom = 6;
    }
     var mapOptions = {
     center: new google.maps.LatLng(latCenter, lngCenter),
   streetViewControl: true,
   zoomControl: true,
   scaleControl: true,
   mapTypeControl: true,
   disableDefaultUI:false,
    zoom: zoom,
    navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            },
   mapTypeId: google.maps.MapTypeId.TERRAIN
   }
    map = new google.maps.Map(document.getElementById("googleMap"), mapOptions)
    //Thiết lập các lớp hiển thị
    //Chon nhung doi tuong se hien thi tren ban do
    map.set('styles', [
        
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{  visibility: 'off' }]
    },{
      featureType: 'administrative.land_parcel',
      stylers: [{    visibility: 'on'}]
    },{
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [
            { hue: '#ffff00' },
            { gamma: 1.4 },
            { saturation: 82 },
            { lightness: 96 },
            { visibility: 'on' }
          ]
     },{
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ visibility: 'on' }]
     },{
          featureType: 'water',
          elementType: 'labels',
          stylers: [{  visibility: 'off' }]
     },{
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#f5f1e6'}]
     },{
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{color: '#806b63'}]
     },{
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#f8c967'}]
     },{
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#e9bc62'}]
     },{
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [{color: '#e98d58'}]
     },{
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry.stroke',
          stylers: [{color: '#db8555'}]
     },{
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{color: '#806b63'}]
     },{
          featureType: 'road.local',
          elementType: 'labels.text',
          stylers: [{visibility: 'on'}]
     },{
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
     },{
          featureType: 'transit.line',
          elementType: 'labels.text.fill',
          stylers: [{color: '#8f7d77'}]
     },{
          featureType: 'transit.line',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#ebe3cd'}]
     },{
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
     },{
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [{  visibility: 'on' }]
     },{
          featureType: 'poi.school',
          elementType: 'geometry',
          stylers: [
            { hue: '#45dd00' },
            { lightness: (-15) },
            { saturation: (70) }
          ]
     }
     ]);
     
    infoWindow= new google.maps.InfoWindow();//Cửa sổ chi tiết
    //Đóng InforWindows để mở cái mới
    google.maps.event.addListener(map, 'click', function() {
            infoWindow.close();
    });
    //Đóng popup khi chuột dời khỏi marker
    google.maps.event.addListener(map, 'mouseout', function() {
        infoWindow.close();
    });
    
    var contexLegend = document.getElementById('legend');
   map.controls[google.maps.ControlPosition.LEFT_CENTER].push(contexLegend);
   //Hiển thị các lớp bản đồ
   var contextLayer = document.getElementById('layer');
   map.controls[google.maps.ControlPosition.RIGHT_TOP].push(contextLayer);
   //Code tuỳ chỉnh InforWindow
    google.maps.event.addListener(infoWindow, 'domready', function() {
       
         //document.getElementById('interactive');
          //document.getElementById('load').style.visibility="hidden";
          
        //tham chiếu tới thẻ div nằm dưới InfoWindow
          var iwOuter = $('.gm-style-iw');
        //khi thẻ div này ở vị trí gốc, dùng JQuery và tạo biến iwBackgroud
          var iwBackground = iwOuter.prev();
        //Loại bỏ div đổ bóng nền     
          iwBackground.children(':nth-child(2)').css({'display' : 'none'});
          //Loại bỏ màu nền trắng
          iwBackground.children(':nth-child(4)').css({'display' : 'none'});
          //Di chuyển InfoWindows về bên phải 115px
          //iwOuter.parent().parent().css({left: '115px'});
          //Di chuyển đổ bóng biểu tượng trỏ  tới lề bên trái 76px
          //iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
          //Di chuyển biểu tượng trỏ tới lề bên trái 76px
          //iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
          iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

          var iwCloseBtn = iwOuter.next();
          //Tạo hiệu ứng cho nút Close
          iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #0099cc', 'border-radius': '13px', 'box-shadow': '0 0 5px #0099cc'});
        //Nếu chiều cao của thông tin  không vượt quá chiều cao max thì gradient được loại bỏ
          if($('.iw-content').height() < 100){
            $('.iw-bottom-gradient').css({display: 'none'});
          }
        //API tự đụng gán giá trị opacity 0.7 tới button sau sự kiện mouseout
          iwCloseBtn.mouseout(function(){
            $(this).css({opacity: '1'});
          });
          //document.getElementById('interactive');
           //document.getElementById('load').style.visibility="visible";
    });
   google.maps.event.addListener(map, 'tilesloaded', function() {
          document.getElementById('interactive');
        document.getElementById('load').style.visibility="hidden";
   });
   //Code lấy vị trí toạ độ khi click
   /*
   google.maps.event.addListener(map, 'dblclick', function(event) {
      toaDo(event.latLng);
   });
   function toaDo(location) {
      var marker = new google.maps.Marker({
         position: location,
         map: map,
      });
      var infoToaDo = new google.maps.InfoWindow({
         content: 'Vĩ độ: ' + location.lat() +
         '<br>Kinh độ: ' + location.lng()
      });
      infoToaDo.open(map,marker);
   }
   */
}
//Hết hàm initialize
//Viết hàm khi click vào checkbox
function toggle(checkbox,index)
{
   //Hiển thị chú giải
   var contexLegend = document.getElementById('itemLegends');
    if(checkbox.checked) {
     if(typeLayers[index] != "Raster")
     {
        layers[index].loadGeoJson(fileSources[index]);
        //Sự kiện click vào đối tượng dạng vùng và dạng điểm
         layers[index].addListener('click', function(event) {
             //Lấy tất cả properties hiển thị lên InfoWindow
          //console.log(event.feature);
          //Nếu là polygone hoặc là Point thì click sẽ hiển thị popup
          if(event.feature.getGeometry().getType()==='Polygon' || event.feature.getGeometry().getType()==='Point')
          {
             var info = '<div id="iw-container"><div class="iw-title">INFORMATION</div><div class="iw-content">';
             event.feature.forEachProperty(function(value,property) {
             //console.log(property,':',value);
             if(!(value === null && typeof value === "object") && !(value === "" && typeof value === "string") && !(value === 0 && typeof value === "number"))
                    info+="<strong>"+property+"</strong>: "+value+"<br/>";                   
              });
              info+= "</div></div>";
              infoWindow.setContent(info);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);   
             }
        });
        //Sự kiện mouseover vào đối tượng dạng đường
        layers[index].addListener('mouseover', function(event) {
           //alert(event.feature.getGeometry().getType());
           if(event.feature.getGeometry().getType()==='Line' || event.feature.getGeometry().getType()==='LineString' || event.feature.getGeometry().getType()==='MultiLineString')
          {
              var info = '<div id="iw-container"><div class="iw-title">INFORMATION</div><div class="iw-content">';
             event.feature.forEachProperty(function(value,property) {
             //console.log(property,':',value);
             if(!(value === null && typeof value === "object") && !(value === "" && typeof value === "string") && !(value === 0 && typeof value === "number"))
                    info+="<strong>"+property+"</strong>: "+value+"<br/>";                   
              });
              info+= "</div></div>";
              infoWindow.setContent(info);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);   
           }
        });
         layers[index].setMap(map);
     }
     else
     {
        layers[index] = new ImageOverlay(bounds[index], fileSources[index], map);
        layers[index].show();
     }
      //Add thêm chú giải
      var div = document.createElement('div');
      div.innerHTML = '<span class= "legend" id="'+index+'"><img style="margin-right:10px;" src="' + iconLegends[index] + '">'+nameLegends[index]+'<hr/></span>';
      contexLegend.appendChild(div);
      //document.getElementById('interactive');
      //document.getElementById('load').style.visibility="visible";
      //Hiển thị thanh cuận tới legend cuối cùng
      var legend = document.getElementById("itemLegends");
     legend.scrollTop = legend.scrollHeight;
    }
    else {
      if(typeLayers[index] == "Vector")
     {
         layers[index].setMap(null);
      }
      else
      {
         layers[index].hide();
      }
      var elem = document.getElementById(index);
      elem.parentNode.removeChild(elem);
    }
}
//Đây là hàm lấy gía trị thuộc tính trong xml
//Kiểm tra xem có tương thích với hàm getAttribute không
function getAttribute(ele,attr)
{
   var result = (ele.getAttribute && ele.getAttribute(attr)) || null;
   if( !result ) {
      result = ele.attributes[attr].nodeValue;
   }
   return result;
}
//Chọn luu vuc
function chonLuuVuc(index)
{
     //alert(menus[index].attributes["Id"].nodeValue);
     //alert(getAttribute(menus[index],"Id"));
      id = menus[index].getAttribute("Id");
      latCenter = menus[index].getAttribute("Lat");
      lngCenter = menus[index].getAttribute("Lng");
      zoom = Number(menus[index].getAttribute("Zoom"));
      map.setZoom(zoom);
      map.setCenter(new google.maps.LatLng(latCenter, lngCenter));
      //
      document.getElementById("itemLegends").innerHTML = '';//reset bản đồ về trạng thái ban đầu
      fileSources = {};
      bounds = {};
      //console.log(layers.length);
      if(layers.length > 0)
      {
         for(var i=0; i<layers.length;i++)
         {
            if(typeLayers[i] != "Raster")
               layers[i].setMap(null);
            else
            {
               if (layers[i] !== undefined)
                  layers[i].hide();
            }
         }
      }
      typeLayers = [];
      layers = [];
      //Nạp dữ liệu cấu hình tương ứng các lưu vực
      var fileConfig;
      switch(index) {
         case 0:
            fileConfig = "./data/xml/layerKycung_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 1:
            fileConfig = "./data/xml/layerHong_TB_eng.xml";
            loadLuuVuc(fileConfig);
            break;
         case 2:
            fileConfig = "./data/xml/layerMa_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 3:
            fileConfig = "./data/xml/layerCa_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 4:
            fileConfig = "./data/xml/layerHuong_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 5:
            fileConfig = "./data/xml/layerVugia_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 6:
            fileConfig = "./data/xml/layerBa_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 7:
            fileConfig = "./data/xml/layerSerepok_eng.xml";
            loadLuuVuc(fileConfig);
            break;
         case 8:
            fileConfig = "./data/xml/layerDongnai_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         case 9:
            fileConfig = "./data/xml/layerCuulong_eng.xml";
            //alert(fileConfig);
            loadLuuVuc(fileConfig);
            break;
         default:
            alert("Data for the river basin is not available yet!");
            break;
      }
}
//Load dữ liệu tương ứng
function loadLuuVuc(fileConfig)
{
   downloadUrl(fileConfig, function(data) {
      var xml = data.responseXML;
      //Lấy tất cả các lớp (JSON) phân theo các nhóm
      var groups = xml.documentElement.getElementsByTagName("Layers");
      var contextLayer = document.getElementById('itemLayers');
      contextLayer.innerHTML = '';
      contextLayer.style.display="block";
      var content = [];
      numLayers = 0;
      for (var i = 0; i < groups.length; i++) {
          content.push('<div class="mucchinh" style="margin-left:10px;" onclick="hien_layers(event)">'+groups[i].getAttribute("Ten")+'</div><hr/>');
          var childs = groups[i].children;
          if(childs.length > 0)
          {
             content.push('<ul class="muccon">');
             for (var j = 0; j < childs.length; j++)
             {          
                //Gắn các layer lên bản đồ
                //Nếu kiểu lớp là Vector
                fileSources[numLayers] = childs[j].getAttribute("File");//Lưu trữ đường dẫn các file trong một mảng
                typeLayers[numLayers] = childs[j].getAttribute("Type");
                if(childs[j].getAttribute("Type")=="Raster")
                {
                   
                   //Test hiển thị ảnh
                     bounds[numLayers] = new google.maps.LatLngBounds(
                        new google.maps.LatLng(childs[j].getAttribute("LatSW"),childs[j].getAttribute("LngSW")), //S-W, x2, y1
                        new google.maps.LatLng(childs[j].getAttribute("LatNE"),childs[j].getAttribute("LngNE"))); //N-E,  x3,y4
                     // Tuỳ chỉnh đối tượng ImageOverlay chứa ảnh,
                     // đường biên của ảnh và một tham chiếu tới bản đồ đang hiển thị.
                     //layers[numLayers] = new ImageOverlay(bounds, childs[j].getAttribute("File"), map);
                }
                else
                {
                   layers[numLayers] = new google.maps.Data();
                   layers[numLayers].setStyle({
                           strokeColor: childs[j].getAttribute("Color"),
                           strokeWeight: childs[j].getAttribute("Weight"),
                           strokeOpacity: childs[j].getAttribute("SOpacity"), 
                           fillOpacity: childs[j].getAttribute("FOpacity"), 
                           fillColor: childs[j].getAttribute("FColor"),
                           icon: childs[j].getAttribute("Icon"),
                           title: childs[j].getAttribute("Ten")
                  });
                }
               //var item = {};
               //item[childs[j].getAttribute("Ten")] = childs[j].getAttribute("Icon");
               iconLegends[numLayers] = childs[j].getAttribute("Icon");
               nameLegends[numLayers] = childs[j].getAttribute("Ten");
                content.push('<li class="muccon1"><input class="chon" id='+childs[j].getAttribute("Id")+' type="checkbox" onclick="toggle(this,'+ numLayers +')"/>'+childs[j].getAttribute("Ten")+'<a href="'+childs[j].getAttribute("ShpFile")+'" target="_blank"><img src="images/downloads.png" class="downloads" alt="Tải xuống"/></a></li>');
                numLayers += 1;
             }
             content.push('</ul>');
          }
          content.push('<hr/>');
      }
      contextLayer.innerHTML = content.join('');
    });
}

//Hàm ajax đọc file xml hoặc một link  
function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
          new ActiveXObject('Microsoft.XMLHTTP') :
          new XMLHttpRequest;
    request.onreadystatechange = function() {
       /*if(request.readyState == 1) {
          document.getElementById('interactive');
            document.getElementById('load').style.visibility="hidden";
        }*/
        if (request.readyState == 4) {
          request.onreadystatechange = doNothing;
          callback(request, request.status);
        }
    };
    request.open('GET', url, true);
    request.send(null);
}
function doNothing() {
}

google.maps.event.addDomListener(window, 'load', initialize);