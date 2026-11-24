from app import create_app, db
from app.models.models import LibraryCategory


CATEGORIAS = (
    ("Podcasts", "Podcasts e episódios em áudio", "card-seguranca", "audio"),
    ("Infográficos", "Infográficos e conteúdos visuais", "card-letramento", "image"),
    ("Guias e Manuais", "Guias, manuais e documentos de consulta", "card-lgpd", "book"),
    ("Vídeos", "Vídeos educativos e demonstrações", "card-saude", "video"),
    ("Documentos", "Documentos de apoio em diferentes formatos", "card-cor-5", "file"),
)


def seed_library():
    for position, (nome, descricao, cor, icon) in enumerate(CATEGORIAS):
        if LibraryCategory.query.filter_by(name=nome).first():
            continue
        from app.routes.library_routes import gerar_slug

        categoria = LibraryCategory(
            name=nome,
            slug=gerar_slug(nome),
            description=descricao,
            icon=icon,
            color=cor,
            position=position,
            is_active=True,
        )
        db.session.add(categoria)
    db.session.commit()
    print("Categorias iniciais da biblioteca verificadas.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_library()
