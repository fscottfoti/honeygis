set -x
unzip -f nodes.csv.zip
unzip -f nodesall.csv.zip
ls *.csv > FILES
open http://localhost:8000
python -m SimpleHTTPServer
