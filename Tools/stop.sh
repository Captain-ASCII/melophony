
while read p; do
    echo "Killing $p..."
    sudo kill -9 $p
done < ~/Documents/current_melophony_pid.txt

sudo lsof -i | grep -E "1804|1951" | awk '{print $2}' | xargs sudo kill -9 
