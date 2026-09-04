import time
import math
import re
from typing import List, Dict, Any, Optional

class MedicalRAGVault:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = [
            {
                "id": "doc-med-1",
                "patient_id": "P-1001",
                "title": "Comprehensive Blood Sugar & HbA1c Lab Report (Aug 2026)",
                "content": "Patient: Aarav Sharma (Age 52). Fasting Blood Glucose: 142 mg/dL (ELEVATED, Ref: 70-100 mg/dL). HbA1c: 7.2% (Diabetic Range). Post-Prandial Sugar: 198 mg/dL. Serum Creatinine: 0.9 mg/dL (Normal). Next Sugar & HbA1c Check-up recommended in 7 to 14 days.",
                "source": "Dr. Lal PathLabs, Indiranagar, Bengaluru",
                "timestamp": "2026-08-20",
                "category": "Blood Report"
            },
            {
                "id": "doc-med-2",
                "patient_id": "P-1001",
                "title": "Cardiology & SpO2 Assessment Report",
                "content": "Patient: Aarav Sharma. Rest ECG: Normal Sinus Rhythm, Pulse Rate: 78 bpm. Oxygen Saturation (SpO2): 98% on room air. Blood Pressure: 130/85 mmHg (Mild Hypertension). Active Medications: Metformin 500mg, Telmisartan 40mg.",
                "source": "Apollo Heart Institute, Bengaluru",
                "timestamp": "2026-08-10",
                "category": "Cardiology"
            },
            {
                "id": "doc-med-3",
                "patient_id": "P-1001",
                "title": "Clinical History & Allergy Summary",
                "content": "Diagnosed Type-2 Diabetes Mellitus in 2021. Mild Essential Hypertension. Known Drug Allergy: Penicillin (causes skin rash). Surgical History: None.",
                "source": "Dr. Rajesh Verma Clinical Notes",
                "timestamp": "2026-06-15",
                "category": "Clinical History"
            }
        ]

    def add_document(self, patient_id: str, title: str, content: str, source: str = "Patient Upload", category: str = "General Report") -> Dict[str, Any]:
        doc_id = f"doc-med-{len(self.documents) + 1}"
        doc = {
            "id": doc_id,
            "patient_id": patient_id,
            "title": title,
            "content": content,
            "source": source,
            "timestamp": time.strftime("%Y-%m-%d"),
            "category": category
        }
        self.documents.append(doc)
        return doc

    def list_documents(self, patient_id: str = "P-1001") -> List[Dict[str, Any]]:
        return [d for d in self.documents if d["patient_id"] == patient_id]

    def delete_document(self, doc_id: str) -> bool:
        initial_len = len(self.documents)
        self.documents = [d for d in self.documents if d["id"] != doc_id]
        return len(self.documents) < initial_len

    def search(self, query: str, patient_id: str = "P-1001", top_k: int = 3) -> List[Dict[str, Any]]:
        patient_docs = self.list_documents(patient_id)
        query_words = set(re.findall(r'\w+', query.lower()))
        if not query_words:
            return patient_docs[:top_k]

        results = []
        for doc in patient_docs:
            text = f"{doc['title']} {doc['content']}".lower()
            doc_words = re.findall(r'\w+', text)
            matches = sum(1 for w in doc_words if w in query_words)
            if matches > 0:
                score = matches / (len(query_words) + math.log(len(doc_words) + 1))
                results.append({
                    "document": doc,
                    "score": round(score, 3),
                    "citation": f"[{doc['title']}] ({doc['source']})"
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k] if results else [
            {
                "document": doc,
                "score": 0.1,
                "citation": f"[{doc['title']}] ({doc['source']})"
            } for doc in patient_docs[:top_k]
        ]

medical_vault_instance = MedicalRAGVault()
