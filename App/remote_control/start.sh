
product_name="SG.Ltd SG Control Mic"
current_dir=$(dirname $0)

echo "Initialize remote control for Melophony..."

devices=$(xinput --list | grep -iE "$product_name.*keyboard" | grep -oE "id=[0-9]+" | cut -d'=' -f2)

for device in $devices; do
  echo "Disabling device with id $device"
  xinput --disable $device
done;

echo "Start mapper"
$current_dir/hid_mapper --lookup-id --manufacturer '0c40' --product '7a1c' --map "$current_dir/remote_command.map"

echo "Done"