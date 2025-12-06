#!/bin/bash
# Create directory-based routing for GitHub Pages

# Create popout directory with index.html
mkdir -p out/popout
cp out/popout.html out/popout/index.html

echo "✓ Created out/popout/index.html for GitHub Pages routing"
