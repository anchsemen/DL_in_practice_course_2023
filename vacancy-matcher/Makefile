install_deps:
	cd ml && pip3 install -r requirements.txt

run_ml:
	cd ml && uvicorn main:app --reload --host 0.0.0.0 --port 8000

run_tg:
	cd telegram-gateway && npm run dev