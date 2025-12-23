import json

with open('large_files.json', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    print(f"{item['lines']:4d} {item['path']}")
