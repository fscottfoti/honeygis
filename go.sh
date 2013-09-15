set -x
unzip -u nodes.csv.zip
unzip -u nodesall.csv.zip
ls *.csv > FILES
open http://localhost:8000
python -m SimpleHTTPServer
