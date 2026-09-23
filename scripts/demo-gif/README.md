# Demo GIF — Reproduction Steps

`public/screenshots/demo.gif` is a real, animated walkthrough built from actual screenshots of the
live deployed site (Dashboard → Financials → Forensic → DCF → Diligence → Memo), not a mockup.

It was built with zero new dependencies: headless Chrome (already used for the static screenshots)
captures one PNG per page, then a small PowerShell + Python pair encodes them into a properly-timed,
looping animated GIF using only .NET's built-in `System.Windows.Media.Imaging.GifBitmapEncoder`
(`make-gif.ps1`) followed by a raw GIF block patch (`add_delays.py`) to fix a known .NET limitation
where `GifBitmapEncoder` silently drops per-frame delay metadata, leaving every frame at 0ms.

## To regenerate

```bash
mkdir -p /tmp/gif-frames
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
BASE="https://aastha2806.github.io/ai-investment-diligence-platform"

"$CHROME" --headless=new --window-size=1280,800 --screenshot=/tmp/gif-frames/1-dashboard.png "$BASE/"
"$CHROME" --headless=new --window-size=1280,800 --screenshot=/tmp/gif-frames/2-financials.png "$BASE/financials/"
"$CHROME" --headless=new --window-size=1280,800 --virtual-time-budget=4000 --screenshot=/tmp/gif-frames/3-forensic.png "$BASE/forensic/"
"$CHROME" --headless=new --window-size=1280,800 --screenshot=/tmp/gif-frames/4-dcf.png "$BASE/dcf/"
"$CHROME" --headless=new --window-size=1280,800 --screenshot=/tmp/gif-frames/5-diligence.png "$BASE/diligence/"
"$CHROME" --headless=new --window-size=1280,800 --screenshot=/tmp/gif-frames/6-memo.png "$BASE/memo/"

powershell -File scripts/demo-gif/make-gif.ps1 -FramesDir /tmp/gif-frames -OutFile /tmp/gif-frames/demo-raw.gif
python3 scripts/demo-gif/add_delays.py /tmp/gif-frames/demo-raw.gif public/screenshots/demo.gif 200
```

## Why this approach

- `--virtual-time-budget` on the Forensic capture lets the Recharts line animation settle before
  the screenshot (the app itself now sets `isAnimationActive={false}` on all charts, so this is
  largely belt-and-suspenders).
- `System.Windows.Media.Imaging.GifBitmapEncoder` (WPF, part of `PresentationCore.dll`, present in
  every .NET Framework install on Windows) correctly writes the multi-frame GIF structure but not
  reliable per-frame timing — `add_delays.py` is a ~70-line pure-Python GIF block parser that
  inserts a proper Graphic Control Extension (delay + disposal method) before each frame's Image
  Descriptor, and the Netscape 2.0 looping extension is inserted once, right after the Logical
  Screen Descriptor / Global Color Table, by `make-gif.ps1`.
