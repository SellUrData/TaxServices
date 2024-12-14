from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.document import Document
from ..models.tax_return import TaxReturn
from .. import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get statistics
    total_users = User.query.filter_by(role='client').count()
    total_documents = Document.query.count()
    total_returns = TaxReturn.query.count()
    pending_returns = TaxReturn.query.filter_by(status='in_progress').count()
    
    return jsonify({
        'total_users': total_users,
        'total_documents': total_documents,
        'total_returns': total_returns,
        'pending_returns': pending_returns
    }), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = User.query.filter_by(role='client').all()
    return jsonify([user.to_dict() for user in users]), 200

@admin_bp.route('/tax-returns', methods=['GET'])
@jwt_required()
def get_all_returns():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    tax_returns = TaxReturn.query.all()
    return jsonify([tax_return.to_dict() for tax_return in tax_returns]), 200

@admin_bp.route('/tax-returns/<int:return_id>', methods=['PUT'])
@jwt_required()
def update_tax_return(return_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    tax_return = TaxReturn.query.get(return_id)
    if not tax_return:
        return jsonify({'message': 'Tax return not found'}), 404
    
    data = request.get_json()
    if 'status' in data:
        tax_return.status = data['status']
    if 'notes' in data:
        tax_return.notes = data['notes']
    
    db.session.commit()
    return jsonify(tax_return.to_dict()), 200
