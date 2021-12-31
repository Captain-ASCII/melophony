cd $HOME/melophony-api/Server/
nohup python3 manage.py runserver &
#echo $! > $HOME/melophony-api/Tools/current_melophony_pid.txt

cd $HOME/melophony-api/App/
nohup npm run production &
#echo $! >> $HOME/melophony-api/Tools/current_melophony_pid.txt

#cat $HOME/melophony-api/Tools/current_melophony_pid.txt
