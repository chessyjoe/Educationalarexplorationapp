from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials, firestore as admin_firestore

def test_count():
    try:
        app = firebase_admin.get_app()
    except ValueError:
        try:
            # try finding credentials
            import os
            cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
            if cred_path:
                cred = credentials.Certificate(cred_path)
                app = firebase_admin.initialize_app(cred)
            else:
                app = firebase_admin.initialize_app()
        except Exception:
            pass

    db = admin_firestore.client()
    query = db.collection('discoveries').limit(1).count()
    results = query.get()
    try:
        if isinstance(results, list):
            print("results list length:", len(results))
            for r in results:
                print("Count:", r.value)
    except Exception as e:
        print("Error reading results:", e)

if __name__ == '__main__':
    test_count()
