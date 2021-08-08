import re
import os.path
import sys

INCLUDE_BEACON_REGEX = re.compile(r"<!-- PAGES START -->(?:.|\n)*?<!-- PAGES END -->")
BEACON = "<!-- PAGES START -->\n{content}<!-- PAGES END -->"

PAGES = {
    'index.html': {
        'res/pages/loading.html',
        'res/pages/list.html',
        'res/pages/view.html',
        'res/pages/edit.html',
        'res/pages/play-card.html',
        'res/pages/eval.html',
        'res/pages/eval-settings.html',
        'res/pages/eval-score.html',
        'res/pages/settings.html',
        'res/pages/sync.html',
        'res/pages/shared.html',
    }
}


def clear_sub(_):
    return BEACON.format(content="")


def content_sub_creator(content):
    def sub(_):
        return BEACON.format(content=content)

    return sub


def process_all_files(clear):
    file_processed = set()
    for file in PAGES:
        file_processed.add(file)
        with open(file, 'r') as fir:
            content = fir.read()
        if clear:
            with open(file, 'w') as fiw:
                content = INCLUDE_BEACON_REGEX.sub(clear_sub, content)
                fiw.write(content)
        else:
            files_list = PAGES[file]
            contentToWrite = ""
            for f in files_list:
                with open(f, 'r') as fir:
                    contentToWrite += fir.read()


            with open(file, 'w') as fiw:
                content = INCLUDE_BEACON_REGEX.sub(content_sub_creator(contentToWrite), content)
                fiw.write(content)

    return file_processed


def run():
    clear = len(sys.argv) > 1 and sys.argv[1] == 'clear'
    files = process_all_files(clear)
    if clear:
        print(f"[PAGES_INCLUDE] Clear done in {len(files)} file(s).")
    else:
        print(f"[PAGE_INCLUDE] Include page in {len(files)} file(s)")
    return files




if __name__ == '__main__':
    run()