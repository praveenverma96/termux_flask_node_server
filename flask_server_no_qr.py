# Auto-install Flask if not already installed
try:
    from flask import Flask, render_template, request, send_from_directory, redirect, send_file
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'flask'])
    from flask import Flask, render_template, request, send_from_directory, redirect, send_file

import os
from datetime import datetime
from zipfile import ZipFile
import io

# Auto-create folders
for folder in ['uploads', 'downloads', 'logs']:
    os.makedirs(folder, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DOWNLOAD_FOLDER'] = 'downloads'

@app.route('/')
def index():
    files = os.listdir(app.config['DOWNLOAD_FOLDER'])

    # Get client metadata
    metadata = {
        "IP Address": request.remote_addr,
        "User-Agent": request.headers.get('User-Agent'),
        "Accept-Language": request.headers.get('Accept-Language'),
        "Platform": request.user_agent.platform,
        "Browser": request.user_agent.browser,
        "Version": request.user_agent.version,
        "Full UA String": str(request.user_agent)
    }

    # Create a default text template to prefill in submit box
    prefilled_text = "\n".join(f"{k}: {v}" for k, v in metadata.items())
    prefilled_text += "\n\n--- Clipboard Content Below (if accessible) ---"

    return render_template('index.html', files=files, prefilled_text=prefilled_text)

@app.route('/submit', methods=['POST'])
def submit():
    if request.method == 'POST':
        text = request.form['text']
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

        meta_data = {
            "IP Address": request.remote_addr,
            "User-Agent": request.headers.get('User-Agent'),
            "Accept-Language": request.headers.get('Accept-Language'),
            "Platform": request.user_agent.platform,
            "Browser": request.user_agent.browser,
            "Version": request.user_agent.version,
            "Full UA String": str(request.user_agent)
        }

        os.makedirs('logs', exist_ok=True)
        log_filename = f'logs/log_{timestamp}.txt'

        with open(log_filename, 'w') as f:
            f.write(f"Submitted Text:\n{text}\n\nMetadata:\n")
            for k, v in meta_data.items():
                f.write(f"{k}: {v}\n")

        return redirect('/')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect('/')
    file = request.files['file']
    if file.filename == '':
        return redirect('/')
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return redirect('/')

@app.route('/share', methods=['POST'])
def share_file():
    if 'file' not in request.files:
        return redirect('/')
    file = request.files['file']
    if file.filename == '':
        return redirect('/')
    file.save(os.path.join(app.config['DOWNLOAD_FOLDER'], file.filename))
    return redirect('/')

@app.route('/downloads/<path:filename>')
def download_file(filename):
    return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)

@app.route('/download_all')
def download_all():
    zip_buffer = io.BytesIO()
    with ZipFile(zip_buffer, 'w') as zip_file:
        for filename in os.listdir(app.config['DOWNLOAD_FOLDER']):
            file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
            if os.path.isfile(file_path):
                zip_file.write(file_path, arcname=filename)
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype='application/zip', download_name='all_downloads.zip', as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
