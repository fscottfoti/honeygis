set -x
unzip nodes.csv.zip
unzip nodesall.csv.zip
ls *.csv > FILES
python -m SimpleHTTPServer &
open http://localhost:8000
