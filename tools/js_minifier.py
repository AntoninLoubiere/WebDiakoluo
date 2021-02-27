from jsmin import jsmin
import sys

COMPILE_FILES = {
    'res/js/all.min.js': [
        'res/js/base/base.js',
        'res/js/base/i18n.js',
        'res/js/base/include.js',
        'res/js/base/modals.js',
        'res/js/base/view-utils.js',
    ],
    'res/js/diakoluo.min.js': [
        'res/js/diakoluo/database.js',
        'res/js/diakoluo/main.js',
        'res/js/diakoluo/file_manager.js',
        'res/js/diakoluo/test/test.js',
        'res/js/diakoluo/test/columns/column.js',
        'res/js/diakoluo/test/columns/column-string.js',
    ],
    'res/js/pages/index.min.js': [
        'res/js/pages/page.js',
        'res/js/pages/main.js',
        'res/js/pages/index/utils.js',
        'res/js/pages/index/list.js',
        'res/js/pages/index/view.js',
        'res/js/pages/index/edit.js',
        'res/js/pages/index/play.js',
        'res/js/pages/index/play-settings.js',
        'res/js/pages/index/play-score.js',
    ]
}

MINIFY = False

if len(sys.argv) > 1:
    if not sys.argv[1].endswith('.js'):
        sys.exit(0)

    for c in COMPILE_FILES:
        if sys.argv[1].endswith(c):
            sys.exit(0)

def add_file(w, f):
    with open(f, 'r') as r:
        w.write(jsmin(r.read()) if MINIFY else f"\n\n/* {f' {f} '.center(80, '#')}*/\n\n" + r.read())

def minify(file, list_files):
    print(f"################ CREATE {file}")
    with open(file, 'w') as fiw:
        for f in list_files:
            print(f)
            add_file(fiw, f)

print("Update")
for c in COMPILE_FILES:
    minify(c, COMPILE_FILES[c])
print()