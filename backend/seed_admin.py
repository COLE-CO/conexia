from src.core.database import SessionLocal
from src.core.config import settings
from src.modules.auth import models, security

def create_super_admin():
    db = SessionLocal()
    try:
        admin_email = settings.ADMIN_EMAIL
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if existing_admin:
            print("El administrador inicial ya existe.")
            return

        hashed_password = security.get_password_hash(settings.ADMIN_PASSWORD)
        
        db_admin = models.User(
            email=admin_email,
            hashed_password=hashed_password,
            full_name="Super Administrador Conexia",
            role=models.UserRole.ADMIN,
            is_active=True,
            must_change_password=True
        )
        
        db.add(db_admin)
        db.commit()
        print(f"Administrador creado exitosamente: {admin_email} (contraseña definida en el script)")
        
    except Exception as e:
        db.rollback()
        print(f"Error al crear el admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()