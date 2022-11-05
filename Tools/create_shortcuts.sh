
current_dir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
script_path=$(realpath $current_dir/../App/remote_control/start.sh)

echo "[Desktop Entry]
Type=Application
Terminal=true
Name=Remote controler
Icon=/usr/share/icons/gnome/48x48/apps/terminal.png
Exec=sudo $script_path" > $HOME/Desktop/hid_mapper.desktop

echo "[Desktop Entry]
Type=Application
Terminal=false
Name=Start Melophony
Icon=/usr/share/icons/gnome/48x48/apps/terminal.png
Exec=sudo $current_dir/start.sh" > $HOME/Desktop/melophony_start.desktop

echo "[Desktop Entry]
Type=Application
Terminal=false
Name=Stop Melophony
Icon=/usr/share/icons/gnome/48x48/apps/terminal.png
Exec=sudo $current_dir/stop.sh" > $HOME/Desktop/melophony_stop.desktop

