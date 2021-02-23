import csv
import json

TRANSLATIONS_FILE = "./res/translations/translations.csv"
UNIVERSAL_FILE = "./res/translations/universal.csv"
UNIVERSAL_FILE_OUTPUT = "./res/translations/universal.json"
TRANSLATIONS_DIR = "./res/translations/"

translations = {}

with open(TRANSLATIONS_FILE, 'r', newline="") as fir:
    reader = csv.DictReader(fir)
    for row in reader:
        for r in row:
            if r == "key":
                continue

            if r not in translations:
                translations[r] = {}
            translations[r][row['key']] = row[r]

for t in translations:
    with open(TRANSLATIONS_DIR + t + ".json", "w") as fiw:
        fiw.write(json.dumps(translations[t]))
print("Translations done")            

translations = {}

with open(UNIVERSAL_FILE, 'r', newline="") as fir:
    reader = csv.DictReader(fir)
    for row in reader:
        translations[row['key']] = row['value']

with open(UNIVERSAL_FILE_OUTPUT, "w") as fiw:
    fiw.write(json.dumps(translations))
print("Universal done")            

