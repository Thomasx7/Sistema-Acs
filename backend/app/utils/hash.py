from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(senha):
    return generate_password_hash(senha)

def check_password(senha, hashed):
    return check_password_hash(hashed, senha)