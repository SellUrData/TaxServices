from flask import Flask, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from datetime import timedelta
import os
from dotenv import load_dotenv
from firebase_admin import credentials
import firebase_admin
from .config import FIREBASE_CONFIG

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tax_services.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    
    # Initialize Firebase Admin SDK if not already initialized
    if not firebase_admin._apps:
        if FIREBASE_CONFIG:
            cred = credentials.Certificate(FIREBASE_CONFIG)
            firebase_admin.initialize_app(cred)
        else:
            print("Warning: Firebase configuration not found. Some features may not work.")
    
    # Configure CORS
    app.config['CORS_HEADERS'] = 'Content-Type'
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization", "Accept"],
                 "expose_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": False,
                 "send_wildcard": False,
                 "max_age": 3600
             }
         })
    
    # Initialize other extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.client import client_bp
    from .routes.admin import admin_bp
    from .routes.documents import documents

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(client_bp, url_prefix='/api/client')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(documents, url_prefix='/api/documents')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Create uploads directory if it doesn't exist
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    
    # Add root route
    @app.route('/')
    def index():
        response = make_response(jsonify({
            'status': 'ok',
            'message': 'Smythe Tax Services API is running'
        }))
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response
    
    return app
