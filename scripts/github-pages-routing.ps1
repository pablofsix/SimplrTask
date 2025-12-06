# Create directory-based routing for GitHub Pages

# Create popout directory with index.html
New-Item -ItemType Directory -Path "out/popout" -Force | Out-Null
Copy-Item "out/popout.html" "out/popout/index.html" -Force

Write-Host "✓ Created out/popout/index.html for GitHub Pages routing"
