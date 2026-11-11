#!/bin/sh
set -e

until python -c 'import os, psycopg2; psycopg2.connect(os.environ["DATABASE_URL"]).close()'; do
    echo "Aguardando PostgreSQL..."
    sleep 2
done

flask --app app db upgrade
python seed_quizzes.py
python seed_admin.py
exec python app.py
