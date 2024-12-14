from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.document import Document
from ..models.tax_return import TaxReturn
from .. import db
from datetime import datetime

client_bp = Blueprint('client', __name__)

@client_bp.route('/documents', methods=['GET'])
@jwt_required()
def get_documents():
    current_user_id = get_jwt_identity()
    documents = Document.query.filter_by(user_id=current_user_id).all()
    return jsonify([doc.to_dict() for doc in documents]), 200

@client_bp.route('/documents', methods=['POST'])
@jwt_required()
def upload_document():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    document = Document(
        user_id=current_user_id,
        filename=data.get('filename'),
        document_type=data.get('document_type'),
        tax_year=data.get('tax_year'),
        notes=data.get('notes')
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify(document.to_dict()), 201

@client_bp.route('/tax-returns', methods=['GET'])
@jwt_required()
def get_tax_returns():
    current_user_id = get_jwt_identity()
    tax_returns = TaxReturn.query.filter_by(user_id=current_user_id).all()
    return jsonify([tax_return.to_dict() for tax_return in tax_returns]), 200

@client_bp.route('/tax-returns/<int:return_id>', methods=['GET'])
@jwt_required()
def get_tax_return(return_id):
    current_user_id = get_jwt_identity()
    tax_return = TaxReturn.query.filter_by(
        id=return_id,
        user_id=current_user_id
    ).first()
    
    if not tax_return:
        return jsonify({'message': 'Tax return not found'}), 404
    
    return jsonify(tax_return.to_dict()), 200

@client_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    
    # Get recent documents
    recent_documents = Document.query.filter_by(user_id=current_user_id)\
        .order_by(Document.upload_date.desc())\
        .limit(5)\
        .all()
    
    # Get recent tax returns
    recent_returns = TaxReturn.query.filter_by(user_id=current_user_id)\
        .order_by(TaxReturn.created_at.desc())\
        .limit(3)\
        .all()
    
    return jsonify({
        'recent_documents': [doc.to_dict() for doc in recent_documents],
        'recent_returns': [ret.to_dict() for ret in recent_returns]
    }), 200
