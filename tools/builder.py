import services_workers_files
import translations
import js_minifier
import include
import pages_includer
import os
import sys
import json

ID_FILE = 'api/last_cache_id.json'

if __name__ == '__main__':
    cacheId = services_workers_files.random_id()
    translations.load_translations()
    translations.universal['id'] = cacheId
    translations.write_translations()
    with open(ID_FILE, 'w') as fiw:
        json.dump({'id': cacheId, 'version': translations.universal['version']}, fiw)
    js_minifier.run()
    processed_files = include.run()
    processed_files.update(pages_includer.run())
    services_workers_files.run(cacheId)
    print("[MAIN] Build finished.")

    if len(sys.argv) > 1 and sys.argv[1] == 'git-add':
        os.system('git add sw.js ' + ID_FILE + ' ' + ' '.join(
            set(js_minifier.COMPILE_FILES) |
            set(translations.translations_files) |
            processed_files)
        )
        print("[MAIN] Files added to git.")
