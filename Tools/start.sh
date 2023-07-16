#!/usr/bin/env bash

script_dir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
melophony_dir=${script_dir%"/Tools"}

cd $melophony_dir/Server/
source venv/bin/activate
rm -f nohup.out
nohup gunicorn -c gunicorn_conf.py melophonyApiServer.wsgi &
