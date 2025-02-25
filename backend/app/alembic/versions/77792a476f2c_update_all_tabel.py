"""update all tabel

Revision ID: 1021274d5a69
Revises: 200783bed0b6
Create Date: 2024-10-30 15:25:43.630638

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "1021274d5a69"
down_revision = "200783bed0b6"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # 先删除 tagTask 表（因为它依赖于 tag 表）
    op.drop_table("tagTask")
    # 然后删除 tag 表
    op.drop_table("tag")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # 先创建 tag 表
    op.create_table(
        "tag",
        sa.Column("project_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("name", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("color", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("comment", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("tag_id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column(
            "created", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "modified", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["project_id"], ["project.project_id"], name="tag_project_id_fkey"
        ),
        sa.PrimaryKeyConstraint("tag_id", name="tag_pkey"),
        comment="Contains all the tags",
    )
    # 然后创建 tagTask 表
    op.create_table(
        "tagTask",
        sa.Column("project_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("tag_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("task_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "tag_task_id",
            sa.INTEGER(),
            server_default=sa.text("nextval('\"tagTask_tag_task_id_seq\"'::regclass)"),
            autoincrement=True,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["project_id"], ["project.project_id"], name="tagTask_project_id_fkey"
        ),
        sa.ForeignKeyConstraint(["tag_id"], ["tag.tag_id"], name="tagTask_tag_id_fkey"),
        sa.ForeignKeyConstraint(
            ["task_id"], ["task.task_id"], name="tagTask_task_id_fkey"
        ),
        sa.PrimaryKeyConstraint("tag_task_id", name="tagTask_pkey"),
        comment="Tag and task intersect",
    )
    # ### end Alembic commands ###
