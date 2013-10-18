set -x
ls data/*.csv > FILES
open http://localhost:8000
python -m SimpleHTTPServer
