Take a screenshot from the connected Android device via ADB and copy it to the macOS clipboard.

Run this command:
```
adb exec-out screencap -p > /tmp/sc.png && osascript -e 'set the clipboard to (read (POSIX file "/tmp/sc.png") as TIFF picture)' && rm /tmp/sc.png
```

Tell the user the screenshot is copied to their clipboard and they can Cmd+V to paste it anywhere.
