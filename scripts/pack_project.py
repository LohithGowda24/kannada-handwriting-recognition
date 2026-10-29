import zipfile
import os
import sys

def create_archive(output_path):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ignore_dirs = {'node_modules', 'dist', '.git', '.vite', '__pycache__', '.aistudio'}
    
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file.endswith('.zip') or file.endswith('.pyc'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                zipf.write(full_path, rel_path)

if __name__ == '__main__':
    out_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/kannada-htr-project.zip'
    create_archive(out_file)
    print(f"Archive written to {out_file}")
