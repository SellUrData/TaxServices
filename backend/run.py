from app import create_app, db
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('flask_cors')
logger.level = logging.DEBUG

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
