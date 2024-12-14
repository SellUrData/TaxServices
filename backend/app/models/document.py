from .. import db
from datetime import datetime

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(50))  # W2, 1099, etc.
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    tax_year = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'document_type': self.document_type,
            'upload_date': self.upload_date.isoformat(),
            'tax_year': self.tax_year,
            'status': self.status,
            'notes': self.notes
        }
