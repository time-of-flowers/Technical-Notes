import sqlite3

def update_hero_pic_in_db(db_path):
    """检查 hero 表中的 hero_id 和 hero_pic 是否一致，如果不一致则修改 hero_pic 为 hero_id"""
    try:
        # 连接到 SQLite 数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 查询 hero 表，获取 hero_id 和 hero_pic
        cursor.execute("SELECT hero_id, hero_pic FROM hero")
        rows = cursor.fetchall()

        updated_count = 0  # 记录更新的条目数

        for hero_id, hero_pic in rows:
            # 检查 hero_id 和 hero_pic 是否一致
            if hero_id != hero_pic:
                # 更新 hero_pic 为 hero_id
                cursor.execute(
                    "UPDATE hero SET hero_pic = ? WHERE hero_id = ?",
                    (hero_id, hero_id)
                )
                updated_count += 1
                print(f"已更新: hero_id = {hero_id}, hero_pic = {hero_pic} -> {hero_id}")

        # 提交事务
        conn.commit()

        if updated_count == 0:
            print("所有条目中的 hero_id 和 hero_pic 已一致，无需更新。")
        else:
            print(f"已更新 {updated_count} 条数据。")

    except sqlite3.Error as e:
        print(f"数据库操作错误: {e}")
    finally:
        # 关闭数据库连接
        if conn:
            conn.close()

# 数据库文件路径
db_file = r"F:\$Users_V\Desktop\game.sqlite"

# 调用函数进行更新
update_hero_pic_in_db(db_file)
