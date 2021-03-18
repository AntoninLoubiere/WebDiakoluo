import os
import js_minifier
import random

CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890+/"

FILES = '// FILES //'
ID = '// ID //'
ID_SIZE = 8

SERVICE_WORKER_TEMPLATE = 'res/js/base/service-worker-template.js'
SERVICE_WORKER = 'sw.js'
DIRS = ['res/css', 'res/font', 'res/img', 'res/include', 'res/modals', 'res/translations']
services_files = ['about.html', 'index.html', 'legal.html', 'template.html'] + list(js_minifier.COMPILE_FILES)


def random_id():
    i = ""
    for _ in range(ID_SIZE):
        i += random.choice(CHARS)

    return i


def main():
    global services_files
    for d in DIRS:
        for root, dirs, files in os.walk(d):
            for name in files:
                if not name.startswith('.'):
                    services_files.append(os.path.join(root, name))

    services_files = ['/WebDiakoluo/{}'.format(f) for f in services_files]
    services_files.append('/')
    services_files.append('/css/index.css')
    services_files = ['f.push("{}");'.format(f) for f in services_files]

    file = ""
    with open(SERVICE_WORKER_TEMPLATE, 'r') as fir:
        file = fir.read()

    file = file.replace(FILES, '\n    '.join(services_files))

    file = file.replace(ID, random_id())

    with open(SERVICE_WORKER, 'w') as fiw:
        fiw.write(file)


if __name__ == '__main__':
    main()
