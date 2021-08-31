from jsmin import jsmin
import sys

COMPILE_FILES = {
    'res/js/all.min.js': [
        'res/js/base/i18n.js',
        'res/js/base/modals.js',
        'res/js/base/base.js',
        'res/js/base/view-utils.js',
        'res/js/base/nav.js',
        'res/js/base/navigation-bar.js',
        'res/js/base/progress-bar.js',
        'res/js/base/context-menu.js',
    ],
    'res/js/diakoluo.min.js': [
        'res/js/diakoluo/database.js',
        'res/js/diakoluo/main.js',
        'res/js/diakoluo/file-manager.js',
        'res/js/diakoluo/sync-manager.js',
        'res/js/diakoluo/test/test.js',
        'res/js/diakoluo/test/columns/column.js',
        'res/js/diakoluo/test/columns/column-string.js',
        'res/js/diakoluo/test/score.js',
    ],
    'res/js/pages/index.min.js': [
        'res/js/pages/page.js',
        'res/js/pages/main.js',
        'res/js/pages/index/callbacks.js',
        'res/js/pages/index/utils.js',
        'res/js/pages/index/api.js',
        'res/js/pages/index/settings.js',
        'res/js/pages/index/list.js',
        'res/js/pages/index/view.js',
        'res/js/pages/index/edit.js',
        'res/js/pages/index/play-card.js',
        'res/js/pages/index/eval.js',
        'res/js/pages/index/eval-settings.js',
        'res/js/pages/index/eval-score.js',
    ]
}

MINIFY = False

def add_file(w, f):
    with open(f, 'r') as r:
        w.write(jsmin(r.read()) if MINIFY else f"\n\n/* {f' {f} '.center(80, '#')}*/\n\n" + r.read())

def minify(file, list_files):
    with open(file, 'w') as fiw:
        for f in list_files:
            add_file(fiw, f)

def run(args=[]):
    if len(args) > 1:
        if not args[1].endswith('.js'):
            sys.exit(0)

        for c in COMPILE_FILES:
            if args[1].endswith(c):
                sys.exit(0)

    tot = 0

    for c in COMPILE_FILES:
        minify(c, COMPILE_FILES[c])
        tot += len(COMPILE_FILES[c])
    print(f"[JS MINIFIER] Process {tot} files compressed into {len(COMPILE_FILES)} files.")

if __name__ == '__main__':
    run(sys.argv)