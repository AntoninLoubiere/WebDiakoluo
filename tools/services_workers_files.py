import os
import js_minifier
import random

CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890?!"

FILES = '// FILES //'
ID = '// ID //'
ID_SIZE = 8

SERVICE_WORKER_TEMPLATE = 'res/js/base/service-worker-template.js'
SERVICE_WORKER = 'sw.js'
DIRS = ['res/css', 'res/font', 'res/img', 'res/include', 'res/modals', 'res/translations']
EXCLUDE_DIRS = {'res/img': ['manifest'], '': ['api']}
services_files = ['about.html', 'index.html', 'legal.html', 'template.html'] + list(js_minifier.COMPILE_FILES)


def random_id():
    i = ""
    for _ in range(ID_SIZE):
        i += random.choice(CHARS)

    return i


def run(swId):
    global services_files
    for d in DIRS:
        for root, dirs, files in os.walk(d):
            for name in files:
                if not name.startswith('.'):
                    services_files.append(os.path.join(root, name))

            if root in EXCLUDE_DIRS:
                for exclude_dir in EXCLUDE_DIRS[root]:
                    dirs.remove(exclude_dir)

    services_files = ['/WebDiakoluo/{}'.format(f) for f in services_files]
    services_files.append('/')
    services_files.append('/css/index.css')
    services_files = ['f.push("{}");'.format(f) for f in services_files]

    file = ""
    with open(SERVICE_WORKER_TEMPLATE, 'r') as fir:
        file = fir.read()

    file = file.replace(FILES, '\n    '.join(services_files))

    file = file.replace(ID, swId)

    with open(SERVICE_WORKER, 'w') as fiw:
        fiw.write(file)
    print(f"[SERVICE WORKER] Service worker created with id: {swId}")


if __name__ == '__main__':
    run(random_id())
