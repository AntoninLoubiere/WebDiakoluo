inotifywait -rm -e close_write ./res/js/ | 
while read -r dir event filename
do
    python3 ./js_minifier.py "$dir$filename"
done