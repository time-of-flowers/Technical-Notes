import sqlite3

def read_ids_from_file(file_path):
    """读取 ID 列表.txt 文件，返回包含所有 ID 的列表"""
    hero_ids = []
    with open(file_path, 'r') as f:
        lines = f.readlines()
        for line in lines:
            # 移除行尾的换行符并转为整数
            hero_id = line.strip()
            if len(hero_id) == 5 and hero_id.isdigit():
                hero_ids.append(hero_id)
    return hero_ids

def insert_data_to_db(db_path, ids):
    """向 hero_book 表插入数据"""
    try:
        # 连接到 SQLite 数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 插入数据时需要检查 hero_group_id 是否已经存在
        player_id = 17340991850676225
        level = 1

        for hero_group_id in ids:
            # 检查 hero_group_id 是否已经存在
            cursor.execute("SELECT COUNT(*) FROM hero_book WHERE hero_group_id = ?", (hero_group_id,))
            count = cursor.fetchone()[0]

            if count == 0:
                # 如果不存在，则插入新的数据
                cursor.execute(
                    "INSERT INTO hero_book (player_id, hero_group_id, level) VALUES (?, ?, ?)",
                    (player_id, hero_group_id, level)
                )
                print(f"插入 hero_group_id: {hero_group_id}")
            else:
                print(f"hero_group_id: {hero_group_id} 已存在，跳过插入。")
        
        # 提交事务
        conn.commit()
        print("数据插入完毕。")

    except sqlite3.Error as e:
        print(f"数据库操作错误: {e}")
    finally:
        # 关闭数据库连接
        if conn:
            conn.close()

# 文件路径和数据库路径
id_file = r"F:\$Users_V\Desktop\ID列表.txt"
db_file = r"F:\$Users_V\Desktop\game.sqlite"

# 读取 ID 列表文件并插入数据
hero_ids = read_ids_from_file(id_file)
insert_data_to_db(db_file, hero_ids)
