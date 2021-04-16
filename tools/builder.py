import services_workers_files
import translations
import js_minifier
import os
import sys

if __name__ == '__main__':
    cacheId = services_workers_files.random_id()
    translations.load_translations()
    translations.universal['id'] = cacheId
    translations.write_translations()
    js_minifier.run()
    services_workers_files.run(cacheId)
    print("[MAIN] Build finished.")

    if len(sys.argv) > 1 and sys.argv[1] == 'git-add':
        os.system('git add sw.js ' + ' '.join(
            list(js_minifier.COMPILE_FILES) + 
            translations.translations_files)
        )
        print("[MAIN] Files added to git.")
