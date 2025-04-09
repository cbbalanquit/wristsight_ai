"""Update user created_at default and ensure admin user exists

Revision ID: 900updateuser
Revises: 8991115482df
Create Date: 2025-04-09 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text, inspect
from sqlalchemy.engine.reflection import Inspector
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '900updateuser'
down_revision: Union[str, None] = '8991115482df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    conn = op.get_bind()
    inspector: Inspector = inspect(conn)

    # Drop and re-add created_at without server default (if using SQLite, this is tricky)
    if conn.dialect.name == 'sqlite':
        # SQLite requires table rewrite, so this is just a note.
        print("SQLite doesn't allow dropping default constraints directly. Handle manually if needed.")
    else:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column("created_at",
                                  server_default=None)

    # Check if admin user exists
    result = conn.execute(text("SELECT COUNT(*) FROM users WHERE username = 'admin'"))
    count = result.scalar()

    if count == 0:
        # Create admin user with hashed password
        password_hash = '$2b$12$92.Jsmvvf4bNcblR7AuZne3g2xihv6LR9gBghIPHlNZ5zjHfPB3kO'
        conn.execute(text("""
            INSERT INTO users (email, username, password, role, is_active, created_at)
            VALUES (
                'admin@wristsight.ai',
                'admin',
                :password_hash,
                'admin',
                1,
                datetime('now')
            )
        """), {"password_hash": password_hash})


def downgrade():
    # Not reversing admin user insert or created_at default removal
    pass
