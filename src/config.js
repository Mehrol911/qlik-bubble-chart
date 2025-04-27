define(function() {
  var QLIK_MAX_DATA_PER_REQUEST = 10000;
  var QLIK_DIMENSION_COUNT = 2;
  var QLIK_DIMENSION_MAX = 2;
  var QLIK_DIMENSION_MIN = 2;
  var QLIK_MEASURE_COUNT = 1;
  var DATA_PER_ROW = QLIK_DIMENSION_COUNT + QLIK_MEASURE_COUNT;
  var ROWS_PER_PAGE = Math.floor(QLIK_MAX_DATA_PER_REQUEST/DATA_PER_ROW);

  var PRIMARY_DIM_INDEX = 0;
  var SECONDARY_DIM_INDEX = 1;
  var SIZE_INDEX = 2;

  var BUBBLE_COLOR_INDEX = 0;

  var SELECTED_INDEX = 'Index';
  var BUBBLE_HEX= 'hex';
  
  return {
    QLIK_MAX_DATA_PER_REQUEST: QLIK_MAX_DATA_PER_REQUEST,
    DATA_PER_ROW: DATA_PER_ROW,
    ROWS_PER_PAGE: ROWS_PER_PAGE,
    PRIMARY_DIM_INDEX: PRIMARY_DIM_INDEX,
    SECONDARY_DIM_INDEX: SECONDARY_DIM_INDEX,
    SIZE_INDEX: SIZE_INDEX,
    SELECTED_INDEX:SELECTED_INDEX,
    BUBBLE_COLOR_INDEX: BUBBLE_COLOR_INDEX,
    BUBBLE_HEX: BUBBLE_HEX,
     
    initialProperties: {
      version: 1.0,
      qHyperCubeDef: {
        qDimensions: [],
        qMeasures: [],
        qInitialDataFetch: [{
            qWidth: DATA_PER_ROW,
            qHeight: 0 // needs a limitation
        }]
      },
      selectionMode: "CONFIRM"
    },
    definition: {
      type: 'items',
      component: 'accordion',
      items: {        
        bubbles: {
          uses: 'dimensions',
          min: QLIK_DIMENSION_MIN,
          max: QLIK_DIMENSION_MAX,
          items: {
            color: {
              type: 'string',
              component: 'expression',
              label: 'Bubble Color (Hex Code)',
              ref: 'qAttributeExpressions.' + BUBBLE_COLOR_INDEX + '.qExpression'
            }
          }
        },        
        size: {
          uses: 'measures',
          min: QLIK_MEASURE_COUNT,
          max: QLIK_MEASURE_COUNT,
        },
        addons: {
          uses: "addons",
          items: {
            dataHandling: {
              uses: "dataHandling"
            }
          }
        },
        settings: {
          uses: "settings",
          items: {
            options: {
                label: "Options",
                type: "items",
                items: {                      
                  Legend: {
                    type: "boolean",
                    label: "Show Legend",
                    ref: "qDef.Legend",
                    defaultValue: true
                  },
                  BubbleMinSize: {
                    ref: "qDef.BubbleMinSize",
                    type: "number",
                    label: "Bubble Min Size",
                    defaultValue: "50",
                    expression: "optional"
                  },
                  ShapeType: {
                    ref: "qDef.ShapeType",
                    label: "Shape Type",
                    type: "string",
                    component: "dropdown",
                    options: [
                             { value: "circle",  label: "Circle"    },
                             { value: "square",  label: "Square"    },
                             { value: "diamond", label: "Diamond"   }
                        ],
                        defaultValue: "circle"
                      },
                  Color: {
                    ref: "qDef.Color",
                    label: "Color by",
                    defaultValue: "",
                    type: "string",
                    component: "dropdown",
                    options: [{
                            value: "1",
                            label: "Primary Dimension"
                        }, {
                            value: "2",
                            label: "Secondary Dimension"
                        }, {
                            value: "3",
                            label: "Expression"
                        }, {
                            value: "0",
                            label: "None"
                        }
                    ]
                  },
                  Loading: {
                    type: "string",
                    label: "Loading Message",
                    ref: "qDef.Loading",
                    defaultValue: "Loading..."
                  }
                }
            }
          }
        }
      }     
    },
    snapshot: {
	    canTakeSnapshot: true
    }
  };
});
