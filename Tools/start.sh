cd $HOME/melophony-api/melophonyApiServer/
source venv/bin/activate
nohup gunicorn -c gunicorn_conf.py melophonyApiServer.wsgi &

cd $HOME/melophony-api/App/
nohup npm run production &
