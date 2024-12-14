from flask import Blueprint, request, send_file, jsonify, current_app, make_response
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import auth
import os
from datetime import datetime
from functools import wraps
from flask_cors import cross_origin

documents = Blueprint('documents', __name__)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_user_folder(user_id):
    user_folder = os.path.join(UPLOAD_FOLDER, user_id)
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)
    return user_folder

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            token = auth_header.split(' ')[1]
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        
    return decorated

@documents.route('/upload', methods=['POST', 'OPTIONS'])
@cross_origin(origins=['http://localhost:3000'], 
             methods=['POST', 'OPTIONS'],
             allow_headers=['Content-Type', 'Authorization', 'Accept'])
@requires_auth
def upload_document():
    print("Received upload request")
    print("Files in request:", request.files)
    print("Headers:", dict(request.headers))
    
    if 'file' not in request.files:
        print("No file in request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    print("File name:", file.filename)
    
    if file.filename == '':
        print("Empty filename")
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_folder = get_user_folder(request.user_id)
        print("User folder:", user_folder)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        unique_filename = timestamp + filename
        print("Unique filename:", unique_filename)
        
        file_path = os.path.join(user_folder, unique_filename)
        print("Saving file to:", file_path)
        file.save(file_path)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filePath': os.path.join(request.user_id, unique_filename)
        })
    
    print("File type not allowed:", file.filename)
    return jsonify({'error': 'File type not allowed'}), 400

@documents.route('/<path:document_id>', methods=['GET'])
@cross_origin(origins=['http://localhost:3000'])
@requires_auth
def download_document(document_id):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, request.user_id, document_id)
        return send_file(file_path)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@documents.route('/<path:document_id>', methods=['DELETE'])
@cross_origin(origins=['http://localhost:3000'])
@requires_auth
def delete_document(document_id):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, request.user_id, document_id)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'message': 'File deleted successfully'})
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
