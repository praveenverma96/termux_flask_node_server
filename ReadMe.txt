
#Let's connect on linkedIn -> https://www.linkedin.com/in/0x00153
```
# 📱 Termux Setup (Android)

# 1. Install Termux:
# Download from: https://f-droid.org/en/packages/com.termux/

# 2. Grant storage permission:
termux-setup-storage

# 3. (Optional) Change package mirror:
termux-change-repo

# 4. (Optional) Install and use tmux for split screen:
pkg install tmux
tmux
# Inside tmux:
# Ctrl + b then " → Split horizontally
# Ctrl + b then % → Split vertically

# 5. (Optional) Install Ubuntu environment:
pkg install proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
apt-get update -y && apt-get upgrade -y

# 🐍 Flask Server Setup

# 1. Install Python and Flask:
pkg install python
pip install flask

# 2. Install qrcode-terminal and required image libraries:
pkg install libjpeg-turbo libpng freetype
pip install --no-cache-dir --no-binary :all: Pillow
pip install qrcode-terminal

# 3. Run Flask server:
python flask_server.py


# 💻 Node.js Server Setup

# 1. Install Node.js:
pkg install nodejs

# 2. Initialize project:
npm init -y

# 3. Install dependencies:
npm install express multer archiver ejs qrcode-terminal

# 4. Run Node.js server:
node node_server.js


# ⚠️ Windows Notes (for npm issues)

# If npm doesn't run properly on Windows:
# 1. Open PowerShell as Administrator
# 2. Run the following command:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser


# 📁 Project Folder Structure

# Make sure the following folders exist:

.
├── flask_server.py         # Flask server script
├── node_server.js          # Node.js server script
├── uploads/                # To store uploaded files
├── downloads/              # Optional: for downloadable files
├── logs/                   # Optional: for logging server events
└── README.md               # This file
```
