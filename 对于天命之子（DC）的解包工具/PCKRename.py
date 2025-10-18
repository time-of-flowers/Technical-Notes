#!/usr/bin/env python3
import subprocess
import json, sys, re
from pathlib import Path

HELP_TEXT = """
用法: python script.py <path_to_exe> <pck_file_or_folder>

参数说明:
  <path_to_exe>          解包程序 exe 的路径
  <pck_file_or_folder>   待解包的 .pck 文件或包含 .pck 文件的文件夹

示例:
  python script.py unpack.exe example.pck
  python script.py unpack.exe folder_with_pck
"""

def main(folder: Path):
    if not folder.exists():
        print("目录不存在:", folder)
        return

    name = folder.name

    # 删除 _header 文件
    for f in folder.glob("_header*"):
        f.unlink()

    # 读取 .dat 文件
    dat_file = next(folder.glob("*.dat"), None)
    if not dat_file:
        print("未找到 .dat 文件")
        return

    dat = json.loads(dat_file.read_text(encoding="utf-8"))

    # 从 dat 中提取文件映射
    tex = dat.get("textures", [])
    exp = [e["file"] for e in dat.get("expressions", []) if isinstance(e, dict) and "file" in e]
    mot = [m["file"] for g in dat.get("motions", {}).values() for m in g if isinstance(m, dict) and "file" in m]

    # 按数字排序文件
    def sort_key(p: Path):
        m = re.search(r'\d+', p.stem)
        return int(m.group()) if m else 999999

    files = sorted([p for p in folder.iterdir() if p.is_file()], key=sort_key)

    tex_i, exp_i, mot_i = 0, 0, 0
    for f in files:
        suf = f.suffix.lower()
        new = None

        if suf == ".moc":
            new = folder / f"{name}.moc"
            dat["model"] = new.name
        elif suf == ".png" and tex_i < len(tex):
            new = folder / tex[tex_i]
            tex_i += 1
        elif suf == ".exp" and exp_i < len(exp):
            new = folder / exp[exp_i]
            exp_i += 1
        elif suf == ".txt" and mot_i < len(mot):
            new = folder / mot[mot_i]
            mot_i += 1

        if new and f != new:
            if new.exists():
                new.unlink()
            f.rename(new)
            print(f"{f.name} -> {new.name}")

    # 保存新的 model.json
    out = folder / f"{name}.model.json"
    dat_file.unlink()
    out.write_text(json.dumps(dat, ensure_ascii=False, indent=2), encoding="utf-8")
    print("处理完成:", out.name)


def process_pck(exe_file: Path, target: Path):
    if not exe_file.exists():
        print("解包程序不存在:", exe_file)
        return

    # 如果 target 是文件夹，则遍历所有 .pck 文件
    if target.is_dir():
        pck_files = sorted(target.glob("*.pck"), key=lambda p: int(re.search(r'\d+', p.stem).group()) if re.search(r'\d+', p.stem) else 999999)
        if not pck_files:
            print("文件夹中未找到 .pck 文件:", target)
            return
        for pck_file in pck_files:
            run_exe_and_process(exe_file, pck_file)
    elif target.is_file() and target.suffix.lower() == ".pck":
        run_exe_and_process(exe_file, target)
    else:
        print("目标不是 .pck 文件或包含 .pck 文件的文件夹:", target)


def run_exe_and_process(exe_file: Path, pck_file: Path):
    print(f"\n处理 {pck_file} ...")
    # 设置工作目录为 .pck 所在目录
    subprocess.run([str(exe_file), str(pck_file)], check=True, cwd=pck_file.parent)

    folder = pck_file.with_suffix("")  # 默认 exe 输出同名文件夹
    if folder.exists():
        main(folder)
    else:
        print("未生成文件夹:", folder)


if __name__ == "__main__":
    # 如果没有参数或传入 -h/--help，打印帮助信息
    if len(sys.argv) < 3 or sys.argv[1] in ("-h", "--help"):
        print(HELP_TEXT)
        sys.exit(0)

    exe_path = Path(sys.argv[1])
    target_path = Path(sys.argv[2])
    process_pck(exe_path, target_path)
