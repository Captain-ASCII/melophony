cd ~/Documents/melophony-api/Server/
sudo nohup npm start &
#echo $! > $HOME/Documents/melophony-api/Tools/current_melophony_pid.txt

cd ~/Documents/melophony-api/App/
sudo nohup npm run production &
#echo $! >> $HOME/Documents/melophony-api/Tools/current_melophony_pid.txt

#cat $HOME/Documents/melophony-api/Tools/current_melophony_pid.txt
