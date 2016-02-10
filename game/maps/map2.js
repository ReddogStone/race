(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }})("map2",
{ "height":5,
 "layers":[
        {
         "data":[1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
         "height":5,
         "name":"Kachelebene 1",
         "offsetx":-0.5,
         "offsety":-0.5,
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":11,
         "x":0,
         "y":0
        }, 
        {
         "draworder":"topdown",
         "height":0,
         "name":"Objektebene 1",
         "objects":[
                {
                 "ellipse":true,
                 "height":0.5,
                 "id":3,
                 "name":"",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"",
                 "visible":true,
                 "width":0.5,
                 "x":3,
                 "y":0
                }],
         "offsetx":-0.25,
         "offsety":-0.25,
         "opacity":1,
         "type":"objectgroup",
         "visible":true,
         "width":0,
         "x":0,
         "y":0
        }],
 "nextobjectid":35,
 "orientation":"orthogonal",
 "properties":
    {

    },
 "renderorder":"right-down",
 "tileheight":1,
 "tilesets":[
        {
         "columns":4,
         "firstgid":1,
         "image":"..\/..\/asset-source\/pseudo-tile-set.png",
         "imageheight":1,
         "imagewidth":4,
         "margin":0,
         "name":"Pseudo",
         "properties":
            {

            },
         "spacing":0,
         "tilecount":4,
         "tileheight":1,
         "tilewidth":1
        }],
 "tilewidth":1,
 "version":1,
 "width":11
});