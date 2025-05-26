# Utiliser l'image officielle Python
FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt


COPY . .


EXPOSE 5000

# Variables d'environnement
ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=5000


CMD ["python", "app.py"]