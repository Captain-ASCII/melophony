cd ~/Documents/melophony-api/Server/
sudo nohup npm start &
echo $! > ~/Documents/melophony-api/Tools/current_melophony_pid.txt

cd ~/Documents/melophony-api/App/
sudo nohup npm run production &
echo $! >> ~/Documents/melophony-api/Tools/current_melophony_pid.txt
