set -x
unzip -u data/nodes.csv.zip -d data
unzip -u data/nodesall.csv.zip -d data
ls data/*.csv > FILES
open http://localhost:8000
python -m SimpleHTTPServer
