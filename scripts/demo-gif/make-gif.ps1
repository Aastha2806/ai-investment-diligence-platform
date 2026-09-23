param(
    [string]$FramesDir = $PSScriptRoot,
    [string]$OutFile = (Join-Path $PSScriptRoot "demo.gif"),
    [int]$DelayCentiseconds = 200
)

Add-Type -AssemblyName PresentationCore

$dir = $FramesDir
$files = @("1-dashboard.png","2-financials.png","3-forensic.png","4-dcf.png","5-diligence.png","6-memo.png") | ForEach-Object { Join-Path $dir $_ }
$outFile = $OutFile
$delayCentiseconds = $DelayCentiseconds

$encoder = New-Object System.Windows.Media.Imaging.GifBitmapEncoder

foreach ($f in $files) {
    $bmp = New-Object System.Windows.Media.Imaging.BitmapImage
    $bmp.BeginInit()
    $bmp.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    $bmp.UriSource = New-Object System.Uri($f, [System.UriKind]::Absolute)
    $bmp.EndInit()
    $bmp.Freeze()

    $metadata = New-Object System.Windows.Media.Imaging.BitmapMetadata("gif")
    $metadata.SetQuery("/grctlext/Delay", [uint16]$delayCentiseconds)
    $metadata.SetQuery("/grctlext/Disposal", [byte]2)

    $newFrame = [System.Windows.Media.Imaging.BitmapFrame]::Create($bmp, $null, $metadata, $null)
    $encoder.Frames.Add($newFrame)
}

$rawFile = Join-Path $dir "demo.raw.gif"
$fsOut = [System.IO.File]::Open($rawFile, [System.IO.FileMode]::Create)
$encoder.Save($fsOut)
$fsOut.Close()

[byte[]]$bytes = [System.IO.File]::ReadAllBytes($rawFile)

# GifBitmapEncoder doesn't emit the Netscape looping extension by default; insert it manually
# right after the Logical Screen Descriptor (+ Global Color Table, if present).
$packed = $bytes[10]
$offset = 13
if (($packed -band 0x80) -ne 0) {
    $gctSize = 3 * [Math]::Pow(2, ($packed -band 0x07) + 1)
    $offset += [int]$gctSize
}

[byte[]]$netscape = @(0x21,0xFF,0x0B,0x4E,0x45,0x54,0x53,0x43,0x41,0x50,0x45,0x32,0x2E,0x30,0x03,0x01,0x00,0x00,0x00)

$head = New-Object byte[] ($offset)
[Array]::Copy($bytes, 0, $head, 0, $offset)
$tail = New-Object byte[] ($bytes.Length - $offset)
[Array]::Copy($bytes, $offset, $tail, 0, $tail.Length)

$finalBytes = New-Object byte[] ($head.Length + $netscape.Length + $tail.Length)
[Array]::Copy($head, 0, $finalBytes, 0, $head.Length)
[Array]::Copy($netscape, 0, $finalBytes, $head.Length, $netscape.Length)
[Array]::Copy($tail, 0, $finalBytes, $head.Length + $netscape.Length, $tail.Length)

[System.IO.File]::WriteAllBytes($outFile, $finalBytes)
Remove-Item $rawFile

Write-Output "Wrote $outFile ($([Math]::Round((Get-Item $outFile).Length / 1MB, 2)) MB)"
Write-Output "Header: $([System.Text.Encoding]::ASCII.GetString($finalBytes[0..5]))"
