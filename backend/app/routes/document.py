from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from ..models.document import Document
from ..models.user import User
from .. import db

document_bp = Blueprint('document', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@document_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed'}), 400
    
    filename = secure_filename(file.filename)
    document_type = request.form.get('type', 'other')
    description = request.form.get('description', '')
    
    # Create uploads directory if it doesn't exist
    upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(current_user_id))
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Create document record in database
    document = Document(
        filename=filename,
        file_path=file_path,
        document_type=document_type,
        description=description,
        user_id=current_user_id
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify(document.to_dict()), 201

@document_bp.route('/documents', methods=['GET'])
@jwt_required()
def get_documents():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    documents = Document.query.filter_by(user_id=current_user_id).all()
    return jsonify([doc.to_dict() for doc in documents]), 200

@document_bp.route('/documents/<int:document_id>', methods=['GET'])
@jwt_required()
def get_document(document_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'message': 'Document not found'}), 404
        
    if document.user_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify(document.to_dict()), 200

@document_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@jwt_required()
def delete_document(document_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'message': 'Document not found'}), 404
        
    if document.user_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Delete file from filesystem
    try:
        os.remove(document.file_path)
    except OSError:
        pass  # File might not exist
    
    # Delete record from database
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Document deleted'}), 200
