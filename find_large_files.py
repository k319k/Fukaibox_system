import os
import pathlib
import json

def find_large_files(root_dir='.', extensions=['js', 'jsx', 'py'], max_lines=200):
    """Find all files with more than max_lines lines."""
    exclude_dirs = {'node_modules', 'venv', '__pycache__', '.git', 'dist', 'build'}
    files = []
    
    for root, dirs, _ in os.walk(root_dir):
        # Remove excluded directories from dirs list
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for ext in extensions:
            for file_path in pathlib.Path(root).glob(f'*.{ext}'):
                if file_path.is_file():
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = len(f.readlines())
                        if lines > max_lines:
                            files.append((str(file_path), lines))
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
    
    # Sort by line count descending
    files.sort(key=lambda x: x[1], reverse=True)
    
    # Write to JSON file
    with open('large_files.json', 'w', encoding='utf-8') as f:
        json.dump([{'path': path, 'lines': lines} for path, lines in files], f, indent=2)
    
    print(f"\nFiles exceeding {max_lines} lines:\n")
    for path, lines in files:
        print(f"{lines:4d} {path}")
    
    print(f"\nTotal: {len(files)} files need refactoring")
    print(f"Results saved to large_files.json")
    return files

if __name__ == '__main__':
    find_large_files()
