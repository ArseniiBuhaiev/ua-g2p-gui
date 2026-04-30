cd \d "C:\Users\bugae\OneDrive\Documents\Uni\6 СЕМЕСТР\Курсова\g2p_app\build.bat"

call .venv/Scripts/Activate
pyinstaller --noconsole --onedir --name "G2P" --icon "static/icon.ico" --add-data "templates;templates" --add-data "static;static" --add-data "placeholders.csv;." --add-data ".venv\\Lib\\site-packages\\ukrainian_word_stress\\data\\stress.trie;ukrainian_word_stress\\data" app.py

echo "Build finished!"
pause