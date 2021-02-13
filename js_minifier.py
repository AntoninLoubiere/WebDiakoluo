from jsmin import jsmin
import os
import sys

DIR = {'res/js/base/': 'res/js/all.min.js', 'res/js/diakoluo/': 'res/js/diakoluo.min.js', 'res/js/pages/index/': 'res/js/pages/index.min.js'}
EXCLUDE_FILES = ['storage.js']
EXCLUDE_DIRS = {}  # root: [file names]

MINIFY = False

if len(sys.argv) > 1:
    if not sys.argv[1].endswith('.js'):
        sys.exit(0)

    for d in DIR:
        if sys.argv[1].endswith(DIR[d]):
            sys.exit(0)

def minify_dir(dir, file):
    with open(file, 'w') as fiw:
        for root, dirs, files in os.walk(dir):
            for f in files:
                if f.endswith('.js') and f not in EXCLUDE_FILES:
                    path = os.sep.join((root, f))
                    if not path.endswith(file):
                        print("Add files " + f)
                        with open(path, 'r') as fir:
                            fiw.write(jsmin(fir.read()) if MINIFY else f"\n\n/* {f' {f} '.center(80, '#')}*/\n\n" + fir.read())

            if root in EXCLUDE_DIRS:
                for d in EXCLUDE_DIRS[root]:
                    if d in dirs:
                        dirs.remove(d)


print("Update")

for d in DIR:
    minify_dir(d, DIR[d])

print()