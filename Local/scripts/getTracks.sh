

adb shell "run-as com.melophony ls files" > current.txt
ls $HOME/Documents/Stash/melophony-local/tracks/ > local.txt

files=$(diff <(sort current.txt) <(sort local.txt) | grep m4a | cut -d' ' -f2)

for f in $files
do
    adb shell "run-as com.melophony cp files/{$commaFiles} /storage/sdcard0/"
    adb pull /storage/sdcard0/$f tracks/
    adb shell "rm /storage/sdcard0/$f"
done

rm current.txt local.txt