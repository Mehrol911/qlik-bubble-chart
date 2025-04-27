# qlik-bubble-chart

**Qlik Sense Bubble Chart Extension**  
An interactive grouping chart using D3plus, now with dynamic shape selection.

---

## Features

- **Grouping**: Two-level grouping of bubbles (or custom shapes) by your primary and secondary dimensions  
- **Size**: Bubble (or shape) size driven by a single measure  
- **Color**: Customize by primary dim, secondary dim or your own expression  
- **Shapes**: Choose between Circle (bubble), Square, Triangle, Pentagon or Hexagon  
- **Legend**: Toggle legend on/off  
- **Loading Message**: Custom loading text  
- **Min Size**: Control minimum shape size (1–100)

---

## Demo

![BubbleChart](BubbleChart.gif)  
![Settings](BubbleChart_Settings.gif)

---

## Installation

1. **Fork & Clone**  
   ```bash
   git clone https://github.com/Mehrol911/qlik-bubble-chart
   
### Tested on
1. Qliksense Desktop version 3.2 -> http://localhost:4848/hub

### Dimensions:
1. Primary Dimension represents the grouping bubbles
2. Secondary Dimension represents the bubbles inside the grouped one

### Dimensions Custom Properties:
1. Color -> by hex decimal code (please note color settings in the general settings sections when set overrides the color properties set on dimension level)

Hint: dimensions should not contain null values

### Measures:
1. Size KPI (Measure)

### Options:
1. Color by (Primary Dimension, Secondary Dimension, Expression)
2. Show Legend
3. Loading Message
3. Min Bubble Size -> accepted value 1 - 100

### ToDo List:

1. Lasso Selection
2. Add additional cusomizable layout properties
3. Improve coloring 

### Known Issue:

1. Extension can handle a limited finite number of bubbles -> Not suitable for every usecase
2. Measure Legend issue when using Qliksense Desktop


### Contributors & Changelog
**Patric Amatulli** (original author)

**Mehrol Bazarov** (enhanced with dynamic Shape Type dropdown, bumped version to 1.1.0)

## v1.1.0
- Added Shape Type dropdown (circle, square, triangle, pentagon, hexagon)
- Updated metadata in `.qext`

## v1.0.0
- Initial D3plus bubble grouping extension


## Author

**Patric Amatulli**  
- LinkedIn: https://www.linkedin.com/in/patricamatulli/  
- Company: axeed AG (http://www.axeed.ch)  
- GitHub: https://github.com/pamaxeed  

**Mehrol Bazarov**  
- LinkedIn: https://www.linkedin.com/in/mehrol911  
- GitHub: https://github.com/Mehrol911  
- Email: mehrol911@gmail.com  

## License

Copyright © 2017 Patric Amatulli
Enhancements © Mehrol Bazarov

Released under the MIT license.

***
