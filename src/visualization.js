var debug = false;

requirejs.config({
    shim: {
      "extensions/my-axeed-bubble-chart/lib/d3plus": {
        deps: ["extensions/my-axeed-bubble-chart/lib/d3"]
      }
    }
  });

define(['qlik', 'qvangular',  'jquery', './config',  'text!./style.css', '../lib/d3', '../lib/d3plus'],

function(qlik, qv, $, config,  style) {

  $('<style>').html(style).appendTo('head');

  return {
    definition: config.definition,
    initialProperties: config.initialProperties,
    paint: main
  };

  function main($element, layout) { 

    var visualizationThis = this;
    visualizationThis.backendApi.cacheCube.enabled = false;
    var scope = angular.element($element).scope();

    if (typeof layout.axeed === 'undefined') {
      var visualization =  {};
    } else {
      var visualization = layout.axeed;
    }

    $element.empty();

    setupProperties($element, visualization, layout, layout.qInfo.qId);
    retrieveData($element, visualization, visualizationThis, config);

    //PAM: Anonymous inner functions
    function retrieveData($element, visualization, visualizationThis, config)
    {
                                
      var columns = layout.qHyperCube.qSize.qcx;
      var totalheight = layout.qHyperCube.qSize.qcy;
      
      var pageheight = Math.floor(10000 / columns);
      var numberOfPages = Math.ceil(totalheight / pageheight);
      
      var Promise = qv.getService('$q');
    
      var promises = Array.apply(null, Array(numberOfPages)).map(function(data, index) {
        var page = {
          qTop: (pageheight * index) + index,
          qLeft: 0,
          qWidth: columns,
          qHeight: pageheight
        };
        
        return visualizationThis.backendApi.getData([page]);
        
      }, visualizationThis)
      
      Promise.all(promises).then(function(data) {
        render(visualization, visualizationThis, data, config);
      });    

    }

    function render(visualization, visualizationThis, data, config) {
      // map our dropdown values to the exact D3plus shape names
      var shapeMap = {
          circle:  "Circle",
          square:  "Square",
          diamond: "Diamond"
          };
      var d3Data = [];
      var d3AttrsData = [];
          
      //PAM: Iterate over rows and retrieve data and defined attributes values into a json array
      data.forEach(function(obj) {
        obj[0].qMatrix.forEach(function(row, index) {

          var jsonData = {};
          var jsonPrimaryAttrData = {};
          var jsonSecondaryAttrData = {};

          jsonData[visualization.properties.dim1] =  row[config.PRIMARY_DIM_INDEX].qText==''?'N/A':row[config.PRIMARY_DIM_INDEX].qText;
          jsonData[visualization.properties.dim2] =  row[config.SECONDARY_DIM_INDEX].qText==''?'N/A':row[config.SECONDARY_DIM_INDEX].qText;
          jsonData[visualization.properties.value] = row[config.SIZE_INDEX].qNum;
          jsonData[config.SELECTED_INDEX] =          row[config.SECONDARY_DIM_INDEX].qElemNumber;
          d3Data.push(jsonData);

          if(row[config.PRIMARY_DIM_INDEX].qAttrExps.qValues[config.BUBBLE_COLOR_INDEX].qText != undefined){
            jsonPrimaryAttrData[visualization.properties.dim1] = row[config.PRIMARY_DIM_INDEX].qText==''?'N/A':row[config.PRIMARY_DIM_INDEX].qText;
            jsonPrimaryAttrData[config.BUBBLE_HEX] = row[config.PRIMARY_DIM_INDEX].qAttrExps.qValues[config.BUBBLE_COLOR_INDEX].qText;
            d3AttrsData.push(jsonPrimaryAttrData);
          }

          if(row[config.SECONDARY_DIM_INDEX].qAttrExps.qValues[config.BUBBLE_COLOR_INDEX].qText != undefined){         
            jsonSecondaryAttrData[visualization.properties.dim2] = row[config.SECONDARY_DIM_INDEX].qText==''?'N/A':row[config.SECONDARY_DIM_INDEX].qText;
            jsonSecondaryAttrData[config.BUBBLE_HEX] = row[config.SECONDARY_DIM_INDEX].qAttrExps.qValues[config.BUBBLE_COLOR_INDEX].qText;
            d3AttrsData.push(jsonSecondaryAttrData);
          }

        });
      });   

      if(debug){
        console.log(d3Data);
        console.log(d3AttrsData);
      }      

      var selValues = [];
      var selIndex =  [];
    
      //PAM: Render Visualization using d3 plus and Extension properties setting
      var d3visualization = d3plus.viz();
      d3visualization.container("#" + visualization.properties.rootDivId)  
        .data(d3Data)     
        .type(
          visualization.properties.shapeType === "circle"
            ? "bubbles"
            : "point"
        )
        .id([visualization.properties.dim1, visualization.properties.dim2, config.SELECTED_INDEX])
        .tooltip({
        "Info": [visualization.properties.dim1, visualization.properties.dim2]
        })
        .depth(1) 
        .size(visualization.properties.value)
        .size({"scale": {"range": {"min": visualization.properties.bubbleMinSize}}})
        .legend(visualization.properties.showLegend)
        .messages(visualization.properties.laodingMessage)
        .order({sort: 'desc'})
        .attrs(d3AttrsData)
        .color("hex")
        .shape(function(d) {
          var t = visualization.properties.shapeType;
          // the built-in shapes still work:
          if (t === "circle"  || t === "square"  || t === "triangle") {
            return shapeMap[t] || "Circle";
          }
          // for pentagon & hexagon use d3.symbol()
          var symbolType = t === "pentagon"
            ? d3.symbolPentagon
            : d3.symbolHexagon;
          // size here is in pixels², adjust scale to taste
          return d3.symbol().type(symbolType).size(
            Math.pow(d[ visualization.properties.value ], 0.6)
          )();
        })
      
        .mouse({
          click: function(d) {
            // update selection arrays
            addOrRemove(selValues, d[visualization.properties.dim2]);
            addOrRemove(selIndex,  d[config.SELECTED_INDEX]);
        
            // grab every drawn node, regardless of shape
            var nodes = d3.selectAll('.d3plus-node');
        
            // dim unselected
            nodes.filter(function(x) {
              return !isInArray(x[visualization.properties.dim2], selValues);
            })
            .transition()
              .style('fill-opacity', 0.4);
        
            // highlight selected
            nodes.filter(function(x) {
              return isInArray(x[visualization.properties.dim2], selValues);
            })
            .transition()
              .style('fill-opacity', 1);
        
            // apply Qlik selection
            visualizationThis.selectValues(1, [d.Index], true);
        
            // clear logic
            scope.selectionsApi.clear = function() {
              selValues = [];
              selIndex  = [];
              nodes.transition().style('fill-opacity', 0.4);
            };
          }
        })   
        .draw();
        if (visualization.properties.shapeType !== "circle") {
          transformGroupShapes( visualization.properties.shapeType );
        }
        
        /**
 * Replace each group‐boundary circle with an n-sided polygon
 * @param {string} shapeType – "square", "triangle", "pentagon", or "hexagon"
 */
function transformGroupShapes(shapeType) {
  // only square & diamond supported now
  var sidesMap = { square: 4, diamond: 4 };
  var sides = sidesMap[shapeType];
  if (!sides) return;

  // rotate diamond by 45°, otherwise start at top
  var startAngle = shapeType === "diamond"
    ? -Math.PI / 4
    : -Math.PI / 2;
  var angle = (2 * Math.PI) / sides;

  // replace each grouping circle
  d3.selectAll("g.d3plus-group").each(function() {
    var g = d3.select(this);
    var circle = g.select("circle");
    if (circle.empty()) return;

    // read circle center & radius
    var cx = +circle.attr("cx"),
        cy = +circle.attr("cy"),
        r  = +circle.attr("r");

    // compute each polygon point using startAngle
    var pts = d3.range(sides).map(function(i) {
      var a = startAngle + i * angle;
      return [
        cx + r * Math.cos(a),
        cy + r * Math.sin(a)
      ].join(",");
    }).join(" ");

    // draw polygon & remove circle
    g.append("polygon")
     .attr("points", pts)
     .attr("fill", "none")
     .attr("stroke", circle.attr("stroke"))
     .attr("stroke-width", circle.attr("stroke-width"));
    circle.remove();
  });
}


      //PAM: Check if Color Settings are set in the General Settings -> if yes then use this setting
      if(visualization.properties.color > 0){
         d3visualization.color(visualization.properties.color==1
               ?visualization.properties.dim1
               :visualization.properties.color==2
               ?visualization.properties.dim2
               :visualization.properties.color==3
               ?visualization.properties.value:"missing")  
       }
    }

    function setupProperties($element, visualization, layout, id) {

      var properties = visualization.properties;

      if (typeof properties === 'undefined') {
        properties = visualization.properties = {};
      }

      //PAM: Retreive and set visualization property object
      properties.dim1 = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;
      properties.dim2 = layout.qHyperCube.qDimensionInfo[1].qFallbackTitle;
      properties.value = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle;
      properties.showLegend = layout.qDef["Legend"];
      properties.bubbleMinSize = layout.qDef["BubbleMinSize"];
      properties.color = layout.qDef["Color"];
      properties.loadingMessage = layout.qDef["Loading"];
      properties.shapeType = layout.qDef["ShapeType"] || "circle";
      properties.id = id;
      properties.rootDivId = 'viz_axeed-bubble-chart_' + id;

      if(debug){
        console.log(properties.rootDivId);
        console.log(properties.dim1);
        console.log(properties.dim2);
        console.log(properties.value);
        console.log(properties.showLegend);
        console.log(properties.bubbleMinSize );
        console.log(properties.color);
        console.log(properties.rootDivId );
      }
  
      $element.html(
        $('<div />')
          .attr('id', properties.rootDivId)
      );  
    }
  }
});



/*
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// PAM: Helper Section
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

function addOrRemove(array, value) {
   
    var index = array.indexOf(value);
    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
   


