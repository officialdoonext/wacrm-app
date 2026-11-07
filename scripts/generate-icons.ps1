Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\wacrm-app\app-icon.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source file not found: $sourcePath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)
Write-Output "Source Image: $($srcImage.Width) x $($srcImage.Height)"

$androidMipmaps = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$resDir = "c:\wacrm-app\android\app\src\main\res"

function Resize-And-Save($src, $targetPath, $size, $isRound) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        $g.SetClip($path)
    }

    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($src, $rect)

    $dir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Save as PNG
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Saved: $targetPath ($size x $size)"
}

foreach ($entry in $androidMipmaps.GetEnumerator()) {
    $folder = $entry.Key
    $size = $entry.Value
    
    $squareTarget = Join-Path $resDir "$folder\ic_launcher.png"
    Resize-And-Save $srcImage $squareTarget $size $false

    $roundTarget = Join-Path $resDir "$folder\ic_launcher_round.png"
    Resize-And-Save $srcImage $roundTarget $size $true
}

# Also save into src/assets/app-icon.png and src/assets/logo.png
$assetsDir = "c:\wacrm-app\src\assets"
Resize-And-Save $srcImage (Join-Path $assetsDir "app-icon.png") 512 $false
Resize-And-Save $srcImage (Join-Path $assetsDir "logo.png") 512 $false

$srcImage.Dispose()
Write-Output "All icons successfully generated!"
