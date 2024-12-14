from .. import db
from datetime import datetime

class TaxReturn(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tax_year = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='not_started')  # not_started, in_progress, review, completed
    filing_type = db.Column(db.String(20))  # individual, business, etc.
    total_income = db.Column(db.Float)
    total_deductions = db.Column(db.Float)
    total_tax = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tax_year': self.tax_year,
            'status': self.status,
            'filing_type': self.filing_type,
            'total_income': self.total_income,
            'total_deductions': self.total_deductions,
            'total_tax': self.total_tax,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'notes': self.notes
        }
