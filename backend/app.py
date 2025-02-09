from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

# Import blueprints from feature modules
from features.alternative_credit_scoring.routes import credit_scoring_bp
from features.fraud_detection.routes import fraud_bp
from features.loan_approval.routes import loan_bp
from features.dynamic_loan_pricing.routes import loan_pricing_bp

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/build'),
    static_url_path=''
)

# Enable CORS for all routes and explicitly allow requests from localhost:3000
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Register blueprints with their URL prefixes
app.register_blueprint(credit_scoring_bp)
app.register_blueprint(fraud_bp)
app.register_blueprint(loan_bp)
app.register_blueprint(loan_pricing_bp)

# Default route (can be used for testing)
@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Banking API"}), 200

# Serve React static files for any other routes (for client-side routing)
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
