import re
import os.path
import sys

INCLUDE_BEACON_REGEX = re.compile(r"<!-- INCLUDE START id=\"(?P<id>[^\"]*)\" -->(?:.|\n)*?<!-- INCLUDE END id=\"(?P=id)\" -->")
BEACON = "<!-- INCLUDE START id=\"{id}\" -->\n{content}<!-- INCLUDE END id=\"{id}\" -->"
INCLUDE_DIR = 'res/include/'

def process_include_match(matchobj: re.Match):
    includeFile = matchobj.group('id')
    includeFilePath = INCLUDE_DIR + includeFile
    if os.path.exists(includeFilePath):
        with open(includeFilePath, 'r') as fir:
            return BEACON.format(id=includeFile, content=fir.read())
    else:
        print(f'[INCLUDE] File unknow {includeFile}')
        return BEACON.format(id=includeFile, content="")

def process_include_match_clear(matchobj: re.Match):
    includeFile = matchobj.group('id')
    return BEACON.format(id=includeFile, content="")

def process_file(filePath):
    with open(filePath, 'r') as fir:
        content = fir.read()
    content = INCLUDE_BEACON_REGEX.sub(process_include_match, content)
    with open(filePath, 'w') as fiw:
        fiw.write(content)

def process_file_clear(filePath):
    with open(filePath, 'r') as fir:
        content = fir.read()
    content = INCLUDE_BEACON_REGEX.sub(process_include_match_clear, content)
    with open(filePath, 'w') as fiw:
        fiw.write(content)

def process_all_files():
    files_processed = set()
    for root, _, files in os.walk('.'):
        for name in files:
            if name.endswith('.html'):
                file_path = os.path.join(root, name)
                process_file(file_path)
                files_processed.add(file_path)
    return files_processed

def process_all_files_clear():
    files_processed = set()
    for root, _, files in os.walk('.'):
        for name in files:
            if name.endswith('.html'):
                file_path = os.path.join(root, name)
                process_file_clear(file_path)
                files_processed.add(file_path)
    return files_processed


def run():
    if len(sys.argv) > 1 and sys.argv[1] == 'clear':
        files = process_all_files_clear()
        print(f"[INCLUDE] Clear includes in {len(files)}.")
        return files
    else:
        files = process_all_files()
        print(f"[INCLUDE] Include done in {len(files)} file(s).")
        return files

if __name__ == '__main__':
    run()