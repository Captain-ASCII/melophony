cd $HOME/melophony-api/melophonyApiServer/
source venv/bin/activate
nohup gunicorn -c gunicorn_conf.py melophonyApiServer.wsgi &
#echo $! > $HOME/melophony-api/Tools/current_melophony_pid.txt

cd $HOME/melophony-api/App/
nohup npm run production &
#echo $! >> $HOME/melophony-api/Tools/current_melophony_pid.txt

#cat $HOME/melophony-api/Tools/current_melophony_pid.txt
