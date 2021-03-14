import os
import js_minifier

BEACON = '// FILES //'
SERVICE_WORKER_TEMPLATE = 'res/js/base/service-worker-template.js'
SERVICE_WORKER = 'sw.js'
DIRS = ['res/css', 'res/font', 'res/img', 'res/include', 'res/modals', 'res/translations']
services_files = ['about.html', 'index.html', 'legal.html', 'template.html'] + list(js_minifier.COMPILE_FILES)

for d in DIRS:
    for root, dirs, files in os.walk(d):
        for name in files:
            if not name.startswith('.'):
                services_files.append(os.path.join(root, name))

services_files = ['f.push("/WebDiakoluo/{}");'.format(f) for f in services_files]
services_files.append('/')
services_files.append('/css/index.css')

file = ""
with open(SERVICE_WORKER_TEMPLATE, 'r') as fir:
    file = fir.read()

file = file.replace(BEACON, '\n    '.join(services_files))

with open(SERVICE_WORKER, 'w') as fiw:
    fiw.write(file)