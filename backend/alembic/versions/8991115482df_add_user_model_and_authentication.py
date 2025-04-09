"""Add User model and authentication

Revision ID: 8991115482df
Revises: 
Create Date: 2025-04-09 12:33:12.773668

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8991115482df'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Import SQLAlchemy operations
    from alembic import op
    import sqlalchemy as sa
    from sqlalchemy import inspect, text
    
    # Get a connection
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Check if users table already exists
    if 'users' not in inspector.get_table_names():
        # Create users table only if it doesn't exist
        op.create_table('users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
            sa.Column('password', sa.String(), nullable=False),
            sa.Column('role', sa.Enum('admin', 'superuser', 'normal', name='userrole'), 
                    nullable=False, server_default='normal'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_users_email', 'users', ['email'], unique=True)
        op.create_index('ix_users_id', 'users', ['id'], unique=False)
        op.create_index('ix_users_username', 'users', ['username'], unique=True)
        
        # Create admin user if users table was just created
        password_hash = '$2b$12$eSyMiC5j1nc.gFdcQ/O8.OtxcYqcwNpoPrW.WmQAuYFbXFFxUEQHW'
        op.execute(
            f"INSERT INTO users (email, username, password, role, is_active) VALUES ('admin@wristsight.ai', 'admin', '{password_hash}', 'admin', 1)"
        )
    
    # Check if analyses table has user_id column
    has_user_id = False
    for column in inspector.get_columns('analyses'):
        if column['name'] == 'user_id':
            has_user_id = True
            break
    
    # Add user_id column if it doesn't exist
    if not has_user_id:
        # Add user_id column to analyses table
        op.add_column('analyses', sa.Column('user_id', sa.Integer(), nullable=True))
        
        # Get admin ID - using the correct SQLAlchemy syntax
        result = conn.execute(text("SELECT id FROM users WHERE username = 'admin'"))
        admin_id = result.scalar()
        
        # If no admin found, use ID 1 as fallback
        if admin_id is None:
            admin_id = 1
        
        # Assign all existing analyses to admin
        op.execute(text(f"UPDATE analyses SET user_id = {admin_id}"))
        
        # Create foreign key relationship
        with op.batch_alter_table('analyses') as batch_op:
            batch_op.create_foreign_key('fk_user_analyses', 'users', ['user_id'], ['id'], ondelete='CASCADE')
            batch_op.alter_column('user_id', nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('analyses', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###
