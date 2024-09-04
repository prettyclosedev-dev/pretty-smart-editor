#!/bin/bash

# Navigate to the 'css' directory and rename CSS files
cd build/static/css

# Rename the main CSS file and its map
mv main.*.css polotno.css
mv main.*.css.map polotno.css.map

# Navigate to the 'js' directory and rename JS files
cd ../js

# Rename the main JS file and its associated map and LICENSE file
mv main.*.js polotno.js
mv main.*.js.map polotno.map.js
mv main.*.js.LICENSE.txt polotno.js.LICENSE.txt

# Rename the blueprint JS files
mv blueprint-icons-all-paths-loader.*.chunk.js polotno-blueprint-1.js
mv blueprint-icons-all-paths-loader.*.chunk.js.map polotno-blueprint-1.map.js
mv blueprint-icons-split-paths-by-size-loader.*.chunk.js polotno-blueprint-2.js
mv blueprint-icons-split-paths-by-size-loader.*.chunk.js.map polotno-blueprint-2.map.js

echo "Files renamed successfully."
