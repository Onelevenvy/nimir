# backend/app/utils/organize_data.py

import os
import shutil
from pathlib import Path

def organize_project_data(project_path: str):
    """
    组织项目数据目录结构
    
    Args:
        project_path: 项目根目录路径
    """
    project_path = Path(project_path)
    
    # 创建标准目录结构
    dirs = {
        'original': project_path / 'original',
        'preprocessed': project_path / 'preprocessed',
        'results': project_path / 'results',
    }
    
    # 创建子目录
    for dir_path in dirs.values():
        dir_path.mkdir(parents=True, exist_ok=True)
    
    # 在 results 下创建子目录
    result_subdirs = ['detection', 'segmentation', 'classification']
    for subdir in result_subdirs:
        (dirs['results'] / subdir).mkdir(exist_ok=True)
    
    # 移动原始数据
    source_data_dir = project_path / 'data'
    if source_data_dir.exists():
        print(f"Moving files from {source_data_dir} to {dirs['original']}")
        
        # 获取所有图片文件
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
        image_files = [
            f for f in source_data_dir.glob('**/*') 
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        # 移动文件
        for img_file in image_files:
            dest_file = dirs['original'] / img_file.name
            if not dest_file.exists():  # 避免覆盖
                shutil.copy2(img_file, dest_file)
                print(f"Moved: {img_file.name}")
        
        print(f"Moved {len(image_files)} files")
    else:
        print(f"Source data directory not found: {source_data_dir}")
    
    print("\nDirectory structure created:")
    print(f"Project root: {project_path}")
    for name, path in dirs.items():
        print(f"- {name}: {path}")
        if name == 'results':
            for subdir in result_subdirs:
                print(f"  - {subdir}: {path/subdir}")

if __name__ == "__main__":
    # 使用你的项目路径
    project_path = "/Users/envys/aidata/det_20241029_162744"
    organize_project_data(project_path)